## 代理

主要作用是隐藏你的 IP 地址，并将你的网络流量转发到目标服务器。它通常只作用于特定的应用程序或浏览器，而不是整个系统。代理服务器本身并不加密你的网络流量。

作为客户端和目标服务器之间的**中介**，将你的请求转发到目标服务器。目标服务器会看到代理服务器的 IP 地址，而不是你的真实 IP 地址。
## VPN

创建一个加密的隧道，将你的所有网络流量通过该隧道传输到 VPN 服务器。它作用于操作系统级别，保护所有应用程序和网络活动。VPN 提供更全面的保护，不仅隐藏你的 IP 地址，还加密你的数据，防止窃听和数据泄露。

**创建一个虚拟网络接口**，并将你的所有网络流量通过该接口传输到 VPN 服务器。VPN 服务器会将你的流量转发到目标服务器。目标服务器会看到 VPN 服务器的 IP 地址，而不是你的真实 IP 地址。

## 总结

| 特性   | 代理          | VPN              |
| ---- | ----------- | ---------------- |
| 功能范围 | 特定应用或浏览器    | 整个系统             |
| 安全性  | 只隐藏 IP 地址   | 加密流量，隐藏 IP 地址    |
| 工作方式 | 中介转发        | 加密隧道             |
| 用途   | 访问受限内容、提高速度 | 保护隐私、访问受限内容、安全连接 |
