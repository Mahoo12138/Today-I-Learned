
## 主节点

Kubernetes 的主节点（master）是组成集群的控制平面的系统服务的集合。
### API Server

+ 所有组件之间的通信，都需要通过 API Server 来完成；
+ 提供了 RESTful 风格的 API 接口；

### Etcd

+ 一种常见的分布式数据库，为主节点（控制层）提供集群存储；
+ 集群存储是有状态（stateful）的部分，它持久化地存储了整 个集群的配置与状态；
+ 关于集群的可用性（availability）这一点上，etcd 认为一致性比可用性更加重要，使用了业界流行的 RAFT 一致性算法来解决这个问题

### Controller Manager

+ 实现了全部的后台控制循环（controller），完成对集群的监控并对事件作出响应；
+ 负责创建 controller， 并监控它们的执行，包括：工作节点 controller、终端 controller，以及副本 controller。
+ 每个 controller 都在后台启动了独立的循环监听功能，负责监控 API Server 的变更，保证集群的当前状态（current state）可以与期望状态（desired state）相匹配。
+ 每个控制循环实现上述功能的基础逻辑大致如下。 
	1. 获取期望状态；
	2. 观察当前状态；
	3. 判断两者间的差异；
	4. 变更当前状态来消除差异点

#### Cloud Controller Manager

+ 如果用户的集群运行在诸如 AWS、Azure、GCP、DO 和 IBM 等类似的公有云平台上，则 控制平面会启动一个云 controller 管理器；
+ 负责集成底层的公有云服务，例如实例、负载均衡以及存储等；


### Scheduler

+ 通过监听 API Server 来启动新的工作任务，并将其分 配到适合的且处于正常运行状态的节点中；
+ 逻辑比较复杂，包括过滤节点，执行前置校验，计算节点分数，排序节点，获取得分最高节点；
+ 调度器并不负责执行任务，只是为当前任务选择一个合适的节点运行。


## 工作节点

工作节点是 Kubernetes 集群中的工作者，主要负责：

+ 监听 API Server 分派的新任务。
+ 执行新分派的任务。
+ 向控制平面回复任务执行的结果（通过 API Server）

### Kubelet 

+ 每个工作节点上的核心部分，是 Kubernetes 中重要的代理端，并且在集群中的每 个工作节点上都有部署（通常工作节点与 Kubelet 这两个术语基本上是等价的）；
+ 是负责监听 API Server 新分配的任务，当监听到一个任务时，Kubelet 就会负责执行该任务，并将执行结果反馈回去。


### CRI

+ Kubelet 需要一个容器运行时（container runtime）来执行依赖容器才能执行的任务，例如拉取镜像并启动或停止容器。
+ 容器运行时接口（CRI）屏蔽了 Kubernetes 内部运行机制，并向第三方容器运行时提供了文档化接口来接入。
+ Kubernetes 目前支持丰富的容器运行时。一个非常著名的例子就是 cri-containerd。

### kube-proxy

+ kube-proxy 运行在集群中的每个工作节点，负责本地集群网络；
+ 保证了每个工作节点都可以获取到唯一的 IP 地址，并且实现了本地 IPTABLE 以及 IPVS 来保障 Pod 间的网络路由与负载均衡。