大多数时间，用户通过更上层的控制器来完成 Pod 部署。上层的控制器包括 Deployment、 DaemonSet 以及 StatefulSet。

## 原理

+ 一个 Deployment 对象只能管理一个 Pod 模板；
+ Deployment 是一种完全成熟的 Kubernetes API 对象。因此可以在清单文件中定义它，并 POST 到 API Server 端；
+ Deployment 在底层利用了另一种名为 ReplicaSet 的对象， 总体来说，Deployment 使用 ReplicaSet 来提供自愈和扩缩容能力。

## 创建 Deployment

```yaml
# deploy.yml
apiVersion: apps/v1 #旧版 K8s 使用 apps/v1beta1 
kind: Deployment
metadata:
	name: hello-deploy
spec:
  replicas: 10
  selector:
 	matchLabels:
 	  app: hello-world
minReadySeconds: 10
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1 
    maxSurge: 1 
template:
  metadata:
    labels:
      app: hello-world
  spec:
    containers:
      - name: hello-Pod
        image: nigelpoulton/k8sbook:latest
 		ports:
 		- containerPort: 8080
```

`spec.minReadySeconds`指明每个 Pod 的更新动作之间间隔 10s，有助于调节更新操作的节奏；

`spec.strategy`：

+ 使用 RollingUpdate 策略来进行更新；
+ 不允许出现比期望状态指定的 Pod 数量少超过一个的情况；
+ 不允许出现比期望状态指定的 Pod 数量多超过一个的情况；

`spec` 部分定义了绝大多数的参数，spec 下的内容都与 Pod 有关：

+ spec.replicas 指明需要部署多少个 Pod 副本；
+ spec.selector 表明 Deployment 要管理的 Pod 所必须具备的标签；
+ spec.strategy 指明如何执行更新操作；
+ spec.template 下的内容定义了 Deployment 管理的 Pod 模板；

```bash
$ kubectl apply -f deploy.yml
```



Deployment 会自动创建相对应的 ReplicaSet。可使用如下的 kubectl 命令予以验证：

```bash
$ kubectl get rs
```



### 访问 Deployment

以下的 YAML 定义了一个能够与上述部署的 Pod 副本协同的 Service。YAML 中包含了 一个 deployment 字段：

```	yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-svc
  labels:
    app: hello-world
spec:
  type: NodePort
  ports:
  - port: 8080
    nodePort: 30001
    protocol: TCP
  selector:
    app: hello-world
```

Service 部署好后，可以通过以下任一种方式来访问该应用： 

+ 在集群内部，通过 DNS 名称 hello-svc 和端口 8080 访问。 
+ 在集群外部，通过集群任一节点和端口号 30001 访问。



### 回滚 Deployment

使用`kubectl apply` 命令进行 Deployment 的升级时，如果添加可 `--record` 参数，Kubernetes 会维护该 Deployment 的版本历史记录。

执行 `kubectl rollout history deployment <deploy-name>` 命令可以显示 Deployment 的版本记录。

更新一个 Deployment 会创建一个新的 ReplicaSet，并且更新前的 ReplicaSet 并不会被删除；