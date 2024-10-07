## 概述

云原生微服务应用 应当将应用和配置解耦，其优点如下：

+ 可重用的应用镜像
+ 更容易测试
+ 更简单、更少的破坏性改动

Kubernetes 通过提供一个名为 ConfigMap（CM）的对象，将配置数据从 Pod 中剥离出 来。使用它可以动态地在 Pod 运行时注入数据。

ConfigMap 通常用于存储如下的非敏感配置数据，诸如凭证和密码等的敏感数据，Kubernetes 提供了另一种名为 Secret 的对象来存储敏感数据。

Secret 和 ConfigMap 在设计和实现上是非常类似的，主要的区别就在于 Kubernetes 会对保存在 Secret 中的值进行混淆。

## 创建

执行如下命令来创建一个名为 testmap1 的 ConfigMap，其中包含两个通过命令行字面 值传入的 entry：

```bash
$ kubectl create configmap testmap1 \ 
 --from-literal shortname=msb.com \ 
 --from-literal longname=magicsandbox.com
```

以下命令可以用来查看这两个 entry 是如何保存在 map 中的。 

```bash
$ kubectl describe cm testmap1
```

执行如下命令基于文件内容来创建 ConfigMap。注意，命令中使用了`--from-file` 参 数来代替`--from-literal`：

```bash
$ kubectl create cm testmap2 --from-file cmfile.txt
```

针对这个 ConfigMap 执行 describe 命令的结果包括以下 3 个：

+ 一个 map 的 entry 被创建
+ entry 的 key 就是文件的名称（cmfile.txt）
+ entry 的 value 是文件的内容

ConfigMap 是一等 API 对象。因此我们可以像对其他 API 对象一样查看和查询 ConfigMap。同样的，kubectl get 命令可以列出所有的 ConfigMap，并且可以使用-o yaml 和-o json 参数 从集群存储中拉取完整的配置。

有趣的是，ConfigMap 对象没有状态（期望状态和当前状态）的概念。因此它没有 spec 和 status 部分，取而代之的是 data。

```yaml
kind: ConfigMap 
apiVersion: v1
metadata:
  name: multimap
data:
  given: Nigel
  family: Poulton
```

接下来的 YAML 显得更加复杂—它定义了只有一个 entry 的 map，不过由于 entry 的 value 部分是一个完整的配置文件：

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: test-conf
data: 
 test.conf: | 
   env = plex-test
   endpoint = 0.0.0.0:31001
   char = utf8
   vault = PLEX/test
   log-size = 512M
```

在 entry 的 key 之后有一个管道符号（|）。它告诉 Kubernetes 这个符号之后的所有内容都需要被作为一个字面值来看待。

## 使用

#### ConfigMap 与环境变量

创建 ConfigMap后， 将其 entity 映射到位于 Pod template 的 container 部分的环境变量中；当容器启动的时候，环境变量会以标准 Linux 或 Windows 环境变量的形式出现在容器中。

将 ConfigMap 作为环境变量来使用是有缺点的，即环境变量是静态的。也就是说，所有对 ConfigMap 的更新操作并不会影响到运行中的容器。即更新了 ConfigMap 中的值，容器中的环境变量并不会有变化。

#### ConfigMap 与容器启动命令

容器是允许定义启动 命令的，而我们又可以借助变量来自定义启动命令：

```yaml
spec:
 containers:
   - name: args1
   image: busybox
   command: [ "/bin/sh", "-c", "echo First name $(FIRSTNAME) last name $(LASTNAME)" ] 
   env: 
     - name: FIRSTNAME 
       valueFrom: 
         configMapKeyRef:
           name: multimap
           key: given
     - name: LASTNAME 
       valueFrom: 
         configMapKeyRef:
           name: multimap
           key: family
```

其中有两个变量：FIRSTNAME 和 LASTNAME，它们是在 env 部 分进行的具体定义：

+ FIRSTNAME 基于 ConfigMap multimap 的 given entry；
+ LASTNAME 基于同一个 ConfigMap 的 family entry；

#### ConfigMap 与卷

将 ConfigMap 与卷结合是最灵活的方式。这种方式是对整个配置文件的应用，ConfigMap 更新也会同步到运行的容器中。

通过卷导入 ConfigMap 的步骤大体如下：

1. 创建一个 ConfigMap；
2. 在 Pod 模板中创建一个 ConfigMap 卷；
3. 将 ConfigMap 卷挂载到容器中；
4. ConfigMap 中的 entry 会分别作为单独的文件出现在容器中；

下面的 YAML 创建了一个名为 cmoul 的 Pod，其中配置项如下

+ spec.volumes 创建了一个基于 ConfigMap multimap 的且名为 volmap 的卷；
+ spec.containers.volumeMounts 将 volmap 卷挂载到 /etc/name；

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cmvol
spec:
  volumes:
    - name: volmap
      configMap:
        name:multimap
   containers:
     - name: ctr
       image: nginx
       volumeMounts:
         - name: volmap
           mountPath: /etc/name
```

spec.volumes 创建了一个特殊类型的卷，称为 ConfigMap 卷。卷的名称是 volmap， 它基于 ConfigMap multimap。这意味着卷中的内容将来自 ConfigMap 的 data 部分定义的 各个 entry。

这个例子的卷中有两个文件：given 和 family。given 文件的内容是 Nigel， family 文件的内容是 Poulton。

在 spec.containers 中将 volmap 卷挂载到了容器的 /etc/name。也就是说在容器中，两个文件的路径如下

+ /etc/name/given
+ /etc/name/family
