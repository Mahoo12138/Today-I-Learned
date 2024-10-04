
## Kubernetes DNS

+ 每个 Kubernetes 集群都有自己内部的 DNS 服务，集群 DNS 服务有一个静态 IP 地址，并且这个 IP 地址集群在每个 Pod 上都是硬编码的， 这意味着每个容器以及 Pod 都能找到 DNS 服务。
+ 集群 DNS 是基于 CoreDNS 来实现的；

## Kubernetes 的应用打包

一个应用想要在 Kubernetes 上运行，需要完成如下几步：

1. 将应用按容器方式进行打包。
2. 将应用封装到 Pod 中。
3. 通过声明式 manifest 文件部署

用户需要选择某种语言来编写一个应用程序，完成之后需要将应用构 建到容器镜像当中并存放于某个私有仓库（Registry）。此时，已经完成了应用服务的容器化（containerized）。

之后，用户需要定义一个可以运行容器化应用的 Pod，Pod 就是一层简单的封装，允许容器在 Kubernetes 集群上运行。

在 Kubernetes 集群中可以运行一个 Pod 单例，但是通常情况下不建议这么做。**推荐的方式是通过更上层的 controller 来完成**。

最常见的 controller 就是 *Deployment*，它提供了可扩容、 自愈与滚动升级等特性。读者只需要通过一个 YAML 文件就可以指定 Deployment 的配置信 息，包括需要使用哪个镜像以及需要部署多少副本。


## 声明式模型与期望状态

+ 声明式模型只关注最终结果——告诉 Kubernetes 我们想要的什么。
+ 命令式模型则包含达成最终结果所需的一系列命令——告诉 Kubernetes 如何来实现

声明式模型的工作方式如下所述：

1. 在 manifest 文件中声明一个应用（微服务）期望达到的状态
2. 将 manifest 文件发送到 API Server
3. Kubernetes 将 manifest 存储到集群存储，并作为应用的期望状态
4. Kubernetes 在集群中实现上述期望状态
5. Kubernetes 启动监控循环，保证应用的当前状态（current state）不会与期望状态出现差异

manifest 文件是按照简版 YAML 格式进行编写的，告知 Kubernetes 集群希望应用运行的样子（需要使用哪个镜像、有 多少副本需要运行、哪个网络端口需要监听，以及如何执行更新）。这就是所谓的**期望状态**。

kubectl 会将 manifest 文件通过 HTTP POST 请求发送到 API Server，在请求经过认证以及授权后，Kubernetes 会检查 manifest 文件，确定需要将该文件发送到哪个控制器，并将其保存到集群存储当中，作为整个集群的期望状态（desired state）中的一部分。

然后是集群中的调度工作，包括拉取镜像、启动容器、构建网络以及启动应用进程。

最终，Kubernetes 通过后台的 reconciliation（调谐）循环来持续监控集群状态。

> 如果集群当前状态（current state）与期望状态（desired state）存在差异，则 Kubernetes 会执行必要的任务来解决对应的差异点。



### 调谐循环

期望状态能够实现的基础是底层调谐循环（reconciliation loop，也称作 control loop）的 概念。



