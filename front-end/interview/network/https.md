## 从 web 开发角度，谈谈你对 https 的理解



在 Web 开发中，HTTPS（**HyperText Transfer Protocol Secure**，超文本传输安全协议）是基于 HTTP **加密传输**的协议，它通过 **SSL/TLS** 提供 **数据加密、完整性校验、身份认证**，有效防止**中间人攻击**、**数据篡改**和**信息窃取**。

### TLS/SSL

HTTPS 依赖于 **TLS（Transport Layer Security）** 或其前身 **SSL（Secure Sockets Layer）** 进行加密。TLS 主要解决三大问题：

- **数据加密**：防止信息被第三方窃听。
- **身份认证**：验证服务器是否合法，防止中间人攻击（MITM）。
- **数据完整性**：防止数据被篡改。

**TLS 主要工作流程**

1. **TLS 握手阶段（TLS Handshake）**
   - 客户端（浏览器）请求服务器的 **SSL/TLS 证书**（包括公钥）。
   - 服务器返回证书，客户端验证其是否合法（通过 CA 证书链）。
   - 客户端生成随机数，并使用公钥加密，发送给服务器。
   - 服务器用私钥解密，生成对称加密密钥，双方协商对称加密算法（如 AES）。
2. **数据传输阶段**
   - 使用协商的对称加密密钥（如 AES）进行数据加密和传输，提高效率。
3. **连接关闭**
   - 通过 `FIN` 包通知关闭连接，防止 MITM 伪造连接。

### **CA 证书**

HTTPS 依赖 **CA（Certificate Authority，证书颁发机构）** 签发的 SSL 证书来保证服务器身份的真实性。

#### **证书验证流程**

1. **浏览器检查服务器返回的 SSL 证书**
2. **检查 CA 签名**（是否被信任的机构签发）
3. **检查域名是否匹配**
4. **检查证书是否过期**
5. **检查证书是否吊销（CRL / OCSP）**

如果证书不可信，浏览器会弹出 **不安全警告**。

#### **常见证书类型**

- **DV（域名验证）**：最基础的证书，仅验证域名所有权。
- **OV（组织验证）**：需要企业信息认证，适用于企业网站。
- **EV（扩展验证）**：最高级别，地址栏显示绿色，适用于金融、支付类网站。

### **HTTPS 如何保证安全**

#### **防止中间人攻击（MITM）**

HTTP 明文传输时，攻击者可以通过 **流量监听** 劫持数据（如 Wi-Fi 劫持、DNS 劫持、代理劫持）。

- HTTPS 使用 **TLS 加密**，即使攻击者截获数据包，也无法解密内容。
- CA 证书验证服务器身份，防止 **假冒服务器**（钓鱼网站）。

#### **防止数据篡改**

- HTTP 数据在传输过程中可以被篡改，导致用户访问恶意内容（如 **运营商劫持广告**）。
- HTTPS 采用 **消息认证码（MAC）** 和 **数据完整性校验（HMAC）**，确保数据未被修改。

#### **防止 DNS 劫持**

- DNS 劫持可以将 `https://example.com` 解析到假冒 IP 地址。
- 使用 **DNS over HTTPS（DoH）** 或 **DNSSEC** 可以防止此类攻击。

#### **前向安全性（Perfect Forward Secrecy，PFS）**

- 普通加密：如果黑客获取私钥，可以解密所有历史数据。
- **PFS 机制**：每次会话生成独立密钥，即使私钥泄露，历史通信仍然安全。

### **对 Web 开发的影响**

#### **SEO 影响**

- Google 明确表示 **HTTPS 站点在搜索排名上优先于 HTTP**。
- Chrome（自 2018 年 7 月起）对 **非 HTTPS 站点标记为“不安全”**。

#### **浏览器限制**

- **非安全请求被阻止**（Mixed Content）：如果 HTTPS 页面加载 HTTP 资源（如图片、CSS、JS），会被浏览器阻止或警告。
- HTTP Cookie 机制变化：
  - `SameSite` 默认设置为 `Lax`，防止 CSRF。
  - 只有 `Secure` 标记的 Cookie 才能通过 HTTPS 传输。

#### **性能优化**

HTTPS 初期由于 **TLS 握手** 会增加**额外延迟**，但 HTTP/2 带来了优化：

- **多路复用**：一个 TCP 连接可同时处理多个请求，减少 **队头阻塞**。
- **服务器推送**：服务器可以主动推送 CSS/JS 资源，减少请求次数。
- **头部压缩（HPACK）**：减少 HTTP 头部的冗余数据，降低传输成本。

#### **CORS（跨域）**

HTTPS 页面对跨域请求更严格：

- `Access-Control-Allow-Origin` 不能使用 `*` 时包含 `credentials: true`。
- 不能在 `file://` 协议下进行 HTTPS 请求（需本地服务器）。

## https 是如何加密的？

HTTPS 主要通过两种加密方式保证安全：

1. **对称加密（Symmetric Encryption）**：用于加密数据，保证通信安全（如 AES）。
2. **非对称加密（Asymmetric Encryption）**：用于安全地交换密钥，防止中间人攻击（如 RSA, ECDSA）。

> **核心概念：HTTPS 采用** 非对称加密 + 对称加密 **相结合的方式，确保通信的** **安全性、完整性、身份认证**。

**HTTPS 详细加密流程**

当浏览器和服务器建立 HTTPS 连接时，会经历 **TLS/SSL 握手**（TLS 1.2 / TLS 1.3）。

### TLS 1.2

**TLS 1.2 采用 4 次消息交互（2 轮往返），导致握手时间较长**：

```text
1️⃣ Client Hello  →  
2️⃣ ← Server Hello  
3️⃣ ← Server Certificate + Server Key Exchange  
4️⃣ Client Key Exchange + Finished →  
5️⃣ ← Finished  
```

1. **Client Hello**
   - 发送 **支持的 TLS 版本**（如 TLS 1.2）
   - 发送 **支持的加密算法**
   - 发送 **Client Random**
2. **Server Hello**
   - 服务器选择 **加密算法**
   - 发送 **Server Random**
   - 发送 **SSL 证书（包含 RSA 公钥或 ECDH 公钥）**
   - 服务器 **等待客户端继续协商**
3. **Client Key Exchange**
   - 客户端生成 **Pre-Master Key** 并 **用服务器公钥（RSA）加密**
   - 发送给服务器
   - 服务器解密后，双方使用 **Client Random + Server Random + Pre-Master Key 计算 Session Key**
4. **Finished**
   - 交换 `Finished` 消息，握手结束
   - 之后开始对称加密的安全通信

**TLS 1.2 问题**

+ **需要 2-RTT（2 轮往返）才能建立连接**，较慢
+ **RSA 密钥交换不支持前向安全性**
+ **容易受到攻击（如 BEAST、ROBOT）**

### TLS 1.3

**TLS 1.3 通过合并多个消息，将握手减少到 1-RTT，提高了速度**：

```plaintext
1️⃣ Client Hello (包含密钥交换)  →  
2️⃣ ← Server Hello + Finished  
```

### **📌 具体流程**

1. **Client Hello（改进）**
   - 发送 **支持的 TLS 版本（TLS 1.3）**
   - 发送 **支持的加密算法**
   - 发送 **Client Random**
   - **直接发送 ECDHE 公钥，避免额外轮次**
2. **Server Hello**
   - 服务器选择 **加密算法**
   - 发送 **Server Random**
   - **直接返回 ECDHE 公钥，计算 Pre-Master Key**
   - **服务器 `Finished` 消息合并发送**
3. **双方计算 Session Key**
   - 服务器和客户端 **各自计算 Pre-Master Key**
   - 使用 **HKDF（HMAC-based Extract-and-Expand Key Derivation Function）** 生成最终 Session Key
   - 之后开始 **对称加密通信**

**TLS 1.3 优化点**

- **握手减少到 1-RTT**，连接速度提高 50%
- **默认使用 ECDHE**，每次握手生成新密钥，支持前向安全性
- **精简消息结构**，提高性能和安全性
