## 什么是 tokens？

Tokens 是用于信息交换的自包含紧凑型 JSON 对象。典型的 token 是客户端（应用程序）与另一个服务（如网络服务器）之间使用的 JSON Web Token（JWT）。具体细节取决于确切的认证流程。在本文中，我们将使用 JWTs（读作 “JOT”）这一术语，因为它更方便并在专业文献中广泛使用。

##### Tokens 解释

与存储用户在网络会话中的活动信息的 [[cookies]]不同，tokens 在软件之间传输信息。存储在 token 中的信息取决于 token 的类型。例如，ID token 携带已认证用户的信息。Access token 通常包含关于安全主体及其授权访问权限的信息。这就是 tokens 和 cookies 交集的地方：某些 tokens 存储在客户端，例如在本地存储中或在 cookie 中。为了安全起见，最好存储在 HttpOnly cookie 中。我不是一个 Web 开发人员，但我了解到开发人员倾向于使用 cookies，因为本地存储被认为是较不安全的选项。还值得一提的是，tokens 作为协议的一部分，并非所有令牌都属于同一协议。

我将在这里提及并简要解释的协议是 OAuth 2.0 和 OpenID Connect（OIDC），因为它们被 Microsoft Identity Platform 使用。

![OpenID Connect 登录流程 - 来源：Microsoft Learn](openid-connect.png)

 #TODO

![登录流程后，通过 OAuth 授权流程获取Access token - 来源：Microsoft Learn](openid-authed.png)

## Tokens 解决的问题

让我们描述一个传统的认证和授权场景，其中不存在 tokens。用户首先登录，Web 服务器通过检查其数据库中的输入凭据来认证用户。一旦凭据匹配，服务器就会发出一个唯一的会话标识符并将其发送给客户端。用户的客户端将会话 ID 存储在设备上。客户端每次向服务器发送请求时，都会在 cookie 或 http 请求头中发送会话 ID。服务器需要再次从其数据库中查找会话 ID，以识别用户并检查授权级别。

这种情况的问题在于，对于客户端的每个请求，服务器都需要向数据库发送一次请求，这使得应用程序的使用速度变慢。

而使用 tokens 的场景通过发出包含用户信息和验证 token 内容真实性的签名的 JWT 解决了随后的数据库查找问题。JWT 发送到客户端，客户端再次存储它。每次客户端向服务器发送请求时，客户端都会包含 JWT。**服务器只需验证 token 的签名以确保其真实性**，当验证通过时，服务器可以从 token 中提取身份和授权详细信息，而无需数据库查找。

## Tokens 的类型

以下是一些常见的 token 类型：

- ID token
- Access token
- Refresh token
- Bearer token

接下来，我将简要介绍这些 tokens 和术语。

### ID token

ID tokens 是通过 OpenID Connect（OIDC）登录流程获取的，这是一个用于**去中心化认证**的开放标准。ID tokens **必须采用 JSON Web Token 格式**。它们由授权服务器（Microsoft Entra ID）向客户端应用程序签发。ID token 包含关于用户或安全主体的声明，并可以包含关于多重认证（MFA）状态的声明。例如，客户端应用程序可以使用 ID token 中的信息和声明验证用户的身份。默认情况下，Microsoft Identity Platform 中的 ID tokens 有效期为一小时。ID tokens 不用于调用受保护的 API。

Microsoft 有两个版本的 ID tokens，并且它们具有不同的端点。版本之间的区别在于它们可以包含的信息和声明。

- v1.0 https://login.microsoftonline.com/common/oauth2/authorize
- v2.0 https://login.microsoftonline.com/common/oauth2/v2.0/authorize

![](entra-id.png)

用户正在登录将用户重定向到 Entra ID 以完成认证的网络应用程序。认证成功后，Entra ID 将发出一个 ID token 并发送给客户端（浏览器）。浏览器不会试图理解 ID token，只是将其发送到网络服务器。

### Access token

Access token 是授权服务器签署的短期（JWT）token，它使客户端能够安全地调用受保护的 Web API。Access tokens 不需要采用 JSON Web Token 格式，但在 Microsoft Identity Platform 中，它们采用 JWT 格式。客户端的每个 http 请求都包含 Access token。通常是在 HTTP 请求的 Authorization 头部使用 “Bearer” 模式来实现这一点。这样可以避免服务器在每次请求时都需要对用户进行身份验证。客户端将 Access token 存储在 cookie 或本地存储中。与 ID tokens 类似，Access tokens 也有两个版本，每个版本都有不同的端点。Access tokens 是为了在服务器端使用。客户端不需要也不应使用 Access token 的内容。

### Refresh token

Refresh token 通常与 Access token 一起获取。它用于在之前的 Access tokens 过期时获取新的Access tokens 和新的 Refresh token。在 Microsoft Identity Platform 中，Refresh tokens 是加密的，不能被其他人读取。客户端将 Access token 存储在 cookie 或本地存储中。Refresh token 的有效期为 90 天，单页应用程序是例外，其有效期为 24 小时。

### Bearer token

Bearer token 是指任何持有该 token 的人都可以使用的 tokens。token 持有者不必证明持有加密密钥。可以将其视为酒店房卡。如果你丢失了房卡，其他人捡到后可以使用它进入房间，而不需要证明他们是房间的合法所有者。

## JSON Web Token (JWT)

JSON Web Tokens 是用于在两方之间安全传输数据的标准化对象。为了确保在传输过程中 JWT 的内容未被更改或篡改，JWT 使用加密密钥进行签名。需要重复的是：JWTs 是签名的，不是加密的。签名验证数据的发送者，而加密将数据从明文转换为只有授权接收者才能阅读的密文。如果在传输过程中签名的 token 内容被更改，公钥（用于验证 token 签名的私钥对）将无法再验证签名。强烈建议与 JWTs 一起使用 HTTPS 等协议，以保护传输过程中的 token 内容的机密性。

互联网工程任务组（IETF）在 RFC 7519 中描述了 JWT 标准。

JSON Web Token 由三个部分组成：

- 头部
- 有效负载
- 签名

### 头部

通常来说，证书头包含两个部分，分别描述令牌的类型和签名算法。

```json
 {
   "alg": "HS256",
   "typ": "JWT"
 }
```

### 有效负载

负载是包含所有实际信息的部分，例如声明。在 RFC 7519 的第 4 章中，注册声明被定义如下：

- “iss” = 发行者声明。发行者声明标识发行 JWT 的主体
- “sub” = 主题声明。主题声明标识 JWT 的主题主体
- “aud” = 受众声明。受众声明标识 JWT 的预期接收者
- “exp” = 到期时间声明。到期声明标识 JWT 不应被接受处理的时间
- “nbf” = 生效时间声明。NFB 声明标识 JWT 应被接受处理之前的时间
- “iat” = 签发时间声明。签发时间声明标识 JWT 的签发时间
- “jti” = JWT ID 声明。JWT ID 声明为 JWT 提供唯一标识符

**该标准并未强制要求使用注册的名称，因此它们仍然是可选的**。其他类型的名称包括公共名称和私有名称。

```json
 {
   "session": "ch72gsb320000udocl363eofy",
   "client_id": "YzEzMGdoMHJnOHBiOG1ibDhyNTA=",
   "response_type": "code",
   "scope": "introscpect_tokens, revoke_tokens",
   "iss": "bjhIRjM1cXpaa21zdWtISnp6ejlMbk44bTlNZjk3dXE=",
   "sub": "YzEzMGdoMHJnOHBiOG1ibDhyNTA=",
   "name": "John Doe",
   "aud": "https://login.microsoftonline.com/{tid}/oauth2/v2.0/authorize",
   "jti": "1516239022",
   "exp": "2024-05-17T07:09:48.000+0545"
 }
```

##### 签名

头部和负载都经过 Base64Url 编码。为了签名 token，需要使用编码后的头和负载，以及密钥和签名算法来完成签名。

```
HMACSHA256(
    base64UrlEncode(header) + "." + base64UrlEncode(payload), 
    secret
)
```

你可以在签名 JWT 中看到 JSON Web Token 的所有三个部分，不同部分由点（.）分隔。

##### 示例 token

最简单的查看 JWT 方法是访问 Microsoft Graph Explorer https://developer.microsoft.com/en-us/graph/graph-explorer 并登录。登录后，我们运行‘GET my profile’查询并打开 Access token 选项卡，复制 token。

然后我们访问 https://jwt.ms 并粘贴 token，在我们粘贴的 token 下方是解码后的 token 内容和解释声明缩写如 “oid”、“uti” 等的‘Claims’选项卡。从下面的 token 我们可以推断出以下内容：

- “typ”: “JWT” 表示 token 类型是 JSON Web Token
- “alg”: “RS256” 表示此 token 的签名使用 RSA 签名和 SHA-256 算法
- “aud”: “00000003-0000-0000-c000-000000000000” 表示 token 接收者（受众）是 Microsoft Graph
- “iss”: “https://sts.windows.net/f77b793c-9409-XXXX-XXXX-b793feaadb48/” 表示 token 的发行者是 Azure Active Directory v1 端点
- “appid”: “de8bc8b5-d9f9-48b1-a8ad-b748da725064” 表示使用 token 的客户端是 Graph Explorer，因为它使用 token 调用 Microsoft Graph API
- “scp”: “openid profile User.Read email” 列出了应用程序（Graph Explorer）请求的 API 范围、已同意的范围以及 Microsoft Graph 公开的范围
- “ver”: “1.0” 表示 token 版本

### JWT 的安全问题

与任何技术解决方案一样，JSON Web Token 也有其缺点。

#### 大小限制和存储

一些复杂的应用程序需要在 token 中存储大量信息。当 tokens 存储在 cookies 中时，这会增加每个请求的开销，甚至超过 cookie 允许的大小（4 KB）。当这种情况发生时，常见的解决方法是将 JWT 存储在本地存储中，这有其自身的安全问题，主要是本地存储中的数据对页面内的任何脚本都是可访问的。这可能导致跨站点脚本攻击能够访问 token。

一般来说，cookies 旨在由服务器读取，而 localstorage 只能由浏览器读取。这意味着 cookie 限制较小的数据量而 localstorage 没有这种限制。当 token 存储在本地存储中时，浏览器使用 JavaScript 访问它。这是 token 存储在本地存储中容易受到跨站点脚本攻击的根本原因，因为攻击者可能会将恶意 JavaScript 注入网页并窃取访问 token。本地存储不提供任何安全措施，而 cookies 具有 secure 属性可以保护 token 免受此类攻击。不要误会，如果 token 存储在未正确保护的 cookies 中，我们也容易受到 XSS 攻击。但 cookies 有机制保护 token 免受这些类型的攻击，这也是 OWASP 社区推荐使用 cookies 存储 tokens 的原因。

#### 失效

如开头所述，tokens 是自包含的。没有中央机构跟踪和管理 tokens。这在尝试使 token 失效时成为一个挑战。默认情况下，访问 token 的有效期为一（1）小时，有效期详细信息包含在 token 中。

#### 未加密

请记住，tokens 是签名的，但不是加密的。因此，如果未通过 HTTPS 充分保护，token 内容可能会暴露给未经授权的一方。