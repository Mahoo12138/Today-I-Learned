通过 Deployment 或者 DaemonSet 对 Pod 进行管理，出现故障的 Pod 会自动被替换，但是替换后的新 Pod 会拥有完全不同的 IP 地址，在水平扩/缩容时也会发生，这些都会引起 **IP 地址变化（IP churn）**。

Service（服务）机制为一组 Pod 提供了可靠且稳定的网络，包括一个稳定的服务名称与 IP 地址等，并且对于其下的 Pod 提供了请求级别的负载均衡机制。

Service 作用于 TCP 以及 UDP 层，所以 Service 层并不具备应用层的智能，即无法提供应用层的主机与路径路由能力。



## 原理

### Label 与松耦合

+ Service 与 Pod 之间是通过 Label 和 Label 筛选器（selector）松耦合在一起的；

### Endpoint 对象

每一个 Service 在被创建的时候，都会得到一个关联的 Endpoint 对象。整个 Endpoint 对象其实就是一个动态的列表，其中包含集群中所有的匹配 Service Label 筛选器的健康 Pod。

使用 kubectl 命令就可以查看其 Endpoint：

```bash
$ kubectl get ep hello-svc
```

### 从集群内部访问 Service

Kubernetes 支持几种不同类型的 Service，默认类型是 ClusterIP；
+ ClusterIP Service 拥有固定的 IP 地址和端口号，并且仅能够从集群内部访问得到；
+ ClusterIP 与对应的 Service 名称一起被注册在集群内部的 DNS 服务中；

### 从集群外部访问 Service

另一种类型的 Service 叫作 NodePort Service。它在 ClusterIP 的基础上增加 了从集群外部访问的可能。

NodePort Service 在 ClusterIP 基础上增加了另一个端口，这个用来从集群外部访问到 Service 的端口叫作 NodePort。

例如一个 NodePort Service：

 + Name:magic-sandbox
 + ClusterIP:172.12.5.17
 + port:8080
 + NodePort:30050

从集群内部，可以通过前 3 个值（Name、ClusterIP、port）来直接访问这个名为 magic-sandbox 的服务。从集群外部，通过发送请求到集群中的任何一个节点的 IP 上的端口 30050 来访问它
## 将 Pod 连接到 Service

Service 使用标签（label）与一个标签选择器（label selector）来决定应当将流量负载均衡到哪一个 Pod 集合；

Service 中维护了一个标签选择器（label selector），其中包含了一个 Pod 所需要处理的全部请求对应的标签。

Service 只会将流量路由到健康的 Pod，这意味着如果 Pod 的健康检查失败，那么 Pod 就不会接收到任何流量。

