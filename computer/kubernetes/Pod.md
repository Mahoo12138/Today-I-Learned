## Pod

在 Kubernetes 中，调度的原子单位是 Pod，虽然 Kubernetes 支持运行容器化应用，但用户无法直接在集群中运行容器，容器必须并且总是需要在 Pod 中才能运行。

> 在英语中，会将 a group of whales（一群鲸鱼） 称作 a Pod of whales，Pod 就是来源于此。因为 Docker 的 Logo 是鲸鱼，所以在 Kubernetes 中会将包含了一组容器的事物称作 Pod。

Pod 是一个用于运行容器的有限制的环境。Pod 本身并不会运行任何东西，只是 作为一个承载容器的沙箱而存在。

换一种说法，Pod 就是为用户在宿主机操作系统中划出有限的一部分特定区域，构建一个网络栈，创建一组内核命名空间，并且在其中运行一个或者多个容器，这就是 Pod。

在 Pod 中运行多个容器时，容期间共享 Pod 环境中的 IPC 命名空间，共享的内存，共享的磁盘、网络以及其他资源等。

例如，运行在相同 Pod 中的所有容器都有相同的 IP 地址，如此一来，Pod 内容器通信，就可以使用 Pod 提供的 localhost 接口来完成。

### 调度单元

Kubernetes 中最小的调度单元也是 Pod，当需要扩容或缩容应用时，可添加或删除 Pod，但不要选择通过向一个已经存在的 Pod 中增加更多的容器这种 方式来完成扩容。
### 原子操作单位

+ 只有当 Pod 中的所有容器都启动成功且处于运行 状态时，Pod 提供的服务才会被认为是可用的；
+ 一个 Pod 只会被唯一的工作节点调度；


### Pod 原理

在使用 Docker 作为容器运行时，Pod 实际上是一个名为 `pause container` 的特殊容器。没错，Pod 就是一种特殊容器的花哨称谓。

Pod（pause container）就是一些系统资源的集合，并且能够被其中运 行的容器继承和共享。这些系统资源就是内核命名空间（kernel namespace），包括以下几部分。 
+ 网络命名空间：IP 地址、端口范围、路由表…… 
+ UTS 命名空间：主机名。
+ IPC 命名空间：UNIX 域套接字（domain socket）……

如果需要从外部访问 Pod 内的容器，则需要分别将其暴露在不同的端口上。每个容器都有其自己的端口，同一个 Pod 中的容器不能使用同一个端口。

控制组（Control Group, CGroup）用于**避免某个容器消耗掉节点上所有可用的 CPU、RAM 和 IOPS**。可以说是 CGroup 限制了资源的使用。 

也就是说，同一个 Pod 中的两个容器可以有不同的 CGroup 限额。这是一种强大而又灵活的模式。


### 部署 Pod

+ 要在一个部署清单（manifest）文件中进 行定义，并将该文件 POST 到 API Server；
+ 控制平面（control plane）会检查这个 YAML 格式的配置文件，并将其作为一条部署意图的记录（a record of intent）写入集群存储中；
+ 调度器会选择一个健康的有充足可用资源的节点来部署它；

部署一个 Pod 是一种原子操作。也就是说，这一操作要么整体成功，要么全部失败— 没有 Pod 被“部分”部署成功的状态。


### Pod 的生命周期

部署过程中，完成调度后就会进入等待状态（pending state），此时节点会下载镜像并启动容器。在所有资源就绪前，Pod 的状态都保持在等待状态。

一切就绪后，Pod 进入运行状态（running state）。在完成所有任务后，会停止并进入成功状态（succeeded state）。当 Pod 无法启动时，保持在等待状态（pending state）或进入失败状态（failed state）。

通过 Pod 清单文件部署的 Pod 是**单例的——它没有副本（not replicated），也没有自愈能力（self-healing capabilities）**。正因如此，我们几乎都会基于 Deployment 和 DaemonSet 等更高级的对象来部署 Pod，因为它们可以在 Pod 宕掉的时候进行重新调度。


+ Pod 的生命周期是有限的；Pod 会被创建并运行，并且最终被销毁。
+ 如果 Pod 出现预期外的销毁，用户无须将其重新启动。因为 Kubernetes 会启动一个新的 Pod 来取代有问题的 Pod；这是一个有全新 的 ID 与 IP 地址的 Pod。
+ 不要在设计程序的时候使其依赖特定的 Pod。
