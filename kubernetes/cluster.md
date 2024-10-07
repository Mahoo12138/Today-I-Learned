## cluster 
集群（cluster）是由一组相互协作的工作节点（Worker Nodes）组成的系统，这些节点共同运行容器化的应用程序。

一个 Kubernetes 集群主要由以下两个部分组成：

1. **控制平面（Control Plane）**：管理 Kubernetes 集群状态、调度资源、监控节点健康等关键功能的组件集合；当然也可以作为工作节点；
2. **工作节点（Worker Nodes）**：提供计算、存储和网络资源，用于运行应用负载；

当使用 `kubectl get nodes` 查看节点时，会出现：

```
NAME         STATUS   ROLES                  AGE   VERSION
mahoorange   Ready    control-plane,master   82s   v1.30.5+k3s1
```

**`control-plane`（控制平面）** 和 **`master`（主节点）** 是等价的概念，只是术语上的演变。

## Node

Node 是 Kubernetes 集群的工作节点（Worker Nodes），可以是物理机也可以是虚拟机。

## Namespace

在一个 Kubernetes 集群中可以使用 namespace 创建多个“虚拟集群”，这些 namespace 之间可以完全隔离，也可以通过某种方式，让一个 namespace 中的 service 可以访问到其他的 namespace 中的服务。

**哪些情况下适合使用多个 namespace ？**

因为 namespace 可以提供独立的命名空间，因此可以实现部分的环境隔离。当你的项目和人员众多的时候可以考虑根据项目属性，例如生产、测试、开发划分不同的 namespace。

+ `kubectl get ns` ：获取集群中有哪些 namespace，集群中默认会有 `default` 和 `kube-system` 这两个 namespace；
+ 在执行 `kubectl` 命令时可以使用 `-n` 指定操作的 namespace。
+ 用户的普通应用默认是在 `default` 下，与集群管理相关的为整个集群提供服务的应用一般部署在 `kube-system` 的 namespace 下，例如在安装 kubernetes 集群时部署的 `kubedns`、`heapseter`、`EFK` 等都是在这个 namespace 下面。
+ 并不是所有的资源对象都会对应 namespace，`node` 和 `persistentVolume` 就不属于任何 namespace。