Deployment 和 StatefulSet 都支持自愈、自动扩缩容、滚动更新等特性。

当然，StatefulSet 与 Deployment 还是有显著不同的，StatefulSet 能够确保以下几点：
+ Pod 的名字是可预知和保持不变的
+ DNS 主机名是可预知和保持不变的
+ 卷的绑定是可预知和保持不变的

以上 3 个属性构成了 Pod 的状态，该状态在即使发生故障、扩缩容，以及其他调度操作之后，依然保持不变，从而使 StatefulSet 适用于 那些要求 Pod 保持不变的应用中。

由 StatefulSet 管理的 Pod，在发生故障后会被新的 Pod 代替，不过依然保持相同的名字、相同的 DNS 主机名和相同的卷。即使新的 Pod 在另一个节点上启动，亦是如此。然而 Deployment 管理下的 Pod 就无法实现这一点。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: tkb-sts 
spec: 
  selector:
    matchLabels:
      app: mongo 
 ServiceName: "tkb-sts" 
 replicas: 3 
 template: 
   metadata:
     labels:
       app: mongo
   spec:
     containers:
       - name: ctr-mongo 
         image: mongo:latest
```

这个 StatefulSet 的名字是 tkb-sts，它定义了 3 个基于 mongo:latest 镜像运行的 Pod 副本。

## StatefulSet 中 Pod 的命名

由 StatefulSet 管理的所有 Pod 都会获得一个可预知的、保持不变的名字。这些 Pod 名字 对于其启动、自愈、扩缩容、删除、附加卷等操作都非常重要。

对于上述 yaml 文件，第一个 Pod 的名为 tkb-sts-0，第二个名为 tkb-sts-1，第三个名为 tkb-sts-2。

## 按序创建和删除

StatefulSet 另一个基本特性就是，对 Pod 的启动和停止是受控和有序的。

**StatefulSet 每次仅创建一个 Pod，并且总是等前一个 Pod 达到运行且就绪状态之后才开 始创建下一个 Pod**。而 Deployment 在使用 ReplicaSet 控制器创建 Pod 时则是并行开始的，这 可能会引发潜在的竞态条件（race condition）。

扩缩容操作也遵循同样的规则，当缩容时，则遵循相反的规则。

在缩容的时候 Pod 是被依序而非并行删除的，这对于许多的有状态应用来说意义重大。例如， 对于数据存储类的集群化应用来说，如果多个副本是被同时删除的话，会面临数据丢失的风险。

StatefulSet 控制器能够自行完成自愈和扩缩容。而 Deployment 是通过一 个独立的 ReplicaSet 控制器来完成这些操作的，二者从架构上是不同的。

## 删除 StatefulSet

删除一个 StatefulSet 并不是按序依次终止所有 Pod 的；

可以使用 terminationGracePeriodSeconds 来调整间隔时间。通常应至少将 该参数设置为 10，以便让 Pod 中的应用能够有机会将本地缓存中的数据落盘，以及安全地 提交进行中的写入操作。