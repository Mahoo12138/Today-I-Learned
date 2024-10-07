kubectl 的作用是将对用户友好的命令转换成 API Server 所能理解的 JSON 格式。它基于一个配置文件来决定将其 POST 到哪个集群的 API Server。

默认情况下，kubectl 的配置文件位于`$HOME/.kube/config`。它包含如下配置信息：

+ clusters：kubectl 可以连接的多个集群的列表
+ contexts：集群和相关用户的组合，并用易于记忆的名字来代指
+ users：定义不同的用户以及对不同集群的不同级别的权限

如下是一个 kubectl 的配置文件，其中定义了一个名为 minikube 的集群、一个名为 minikube 的 context，以及一个名为 minikube 的用户。该 context 是用户 minikube 和 集群 minikube 的组合，并被设置为默认的 context。

```yaml
apiVersion: v1 
clusters: 
- cluster:
    certificate-authority: C:\Users\nigel\.minikube\ca.crt 
    server: https://192.168.1.77:8443
  name: minikube 
contexts: 
- context: 
    cluster: minikube 
    user: minikube
  name: minikube 
current-context: minikube 
kind: Config 
preferences: {}
users: 
- name: minikube 
  user:
    client-certificate: C:\Users\nigel\.minikube\client.crt 
    client-key: C:\Users\nigel\.minikube\client.key
```

+ 执行 `kubectl config view` 命令可以查看 kubectl 配置，敏感数据会在输出中被抹掉。
+ `kubectl config current-context` 查看当前使用的 context；
+ `kubectl config use-context <context_name>` 来改变当前的 context；



+ `kubectl apply -f Pod.yml` 将配置文件清单 POST 到 API Server；
+ `kubectl get Pods` 命令来检查状态，可添加`--watch` 参数来监控，以便在状态发生 变化时能够及时看到；
+ `kubectl describe` 会打印出所查看对象的总览信息，其多行格式易于阅读；
+ `kubectl exec` 命令进入容器执行命令，添加参数-it ，可使 exec 的会话成为交互式（interactive）的，并且把当前终端的 STDIN 和 STDOUT 与 Pod 中第一个容器的 STDIN 和 STDOUT 连接起来。
+ `kubectl logs`，不使用 `--container` 参数指定容器名称，则会对 Pod 中的第一个容器起作用。