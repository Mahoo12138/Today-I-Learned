## 什么是 cookies？

Cookies 是网站（网络服务器）访问时创建并存储在设备中的小型文本文件。我们都遇到过它们。几乎每个你访问的网站都会用一个 cookie 通知栏来 “迎接” 你。cookie 的用途取决于 cookie 的类型以及网站希望 cookie 执行的任务。例如，一个在线商店可以使用 cookies 来跟踪用户在其网站上的活动、最后访问的页面、选择的语言、浏览的商品以及放入购物车的商品。当用户离开网站但后来返回时，网站可以读取 cookie，例如，继续用户上次离开的地方。但并非所有 cookies 都服务于相同的目的。

下图以非常高的抽象层次解释了 cookies 的工作原理。

![图 1 - cookies 如何诞生的高级概述](cookies/cookies.png)

但我们为什么需要 cookies 呢？我们需要使用 cookies，因为 HTTP 是一种无状态协议。HTTP 不记得客户端的会话信息，因此客户端负责存储这些信息 —— 使用 cookie。对于某些网站，无状态行为可能没问题，也许网站上没有需要在用户会话期间保留的元素或用户操作。但对于大多数交互式网站，cookies 是必要且必不可少的，我们作为网站访客也期望网站以某种方式运行。多亏了 cookies，这一切才成为可能。当客户端从网络服务器请求网站时，网络服务器响应 “200 OK” 并使用 Set-Cookie 头向客户端发送 cookie。cookie 包含会话 ID，通常还包含其他属性。Web 服务器也在服务器端跟踪其分发给客户端的会话 ID。

Cookies 主要用于：

- HTTP 会话管理
- 个性化
- 跟踪

浏览器会将 Cookies 存储在您的计算机上。更确切地说，它们存储在硬盘上的临时目录中。存储 cookies 的确切位置和方法取决于浏览器和操作系统。通常情况下，你会通过浏览器界面进入设置来管理 cookies，但不同操作系统和浏览器的文件路径可以在互联网上找到。例如，Microsoft Edge 将 cookies 存储在以下路径：`C：\Users\[username]\AppData\Local\Microsoft\Edge\User Data\Default\Cookies-MSEDGEPROFILE.DEFAULT` 其中，[username] 是用户的登录名。

![图 2 - 在浏览文件路径时可能会出现此类文件](cookies/cookie-path.webp)

通常你会使用浏览器的界面来管理、查看或删除 cookies。

![图 3 - Microsoft Edge 浏览器设置中的 cookies](cookies/cookie-manage.webp)

### Cookie 属性

Cookies 具有一些非常重要的属性，因为它们定义了 cookie 的工作方式。以下是 cookie 可以具有的一些属性列表。

- `Session ID`：是一个用于识别和匹配客户端和网络服务器之间会话的唯一随机字符串

- `Expires`：定义了 cookie 的过期日期

- `Domain`：指定了该 Cookie 可用的域名或多个域名

- `Path`：指定了该 Cookie 可用于访问的资源或路径

- `HttpOnly`：启用时将防止客户端 API（如 JavaScript）访问 cookie。这有助于减轻跨站脚本（XSS）攻击的风险

- `Secure`：启用时将只允许通过 HTTPS 发送 Cookie，而禁止使用 HTTP 等未加密连接，这使得 Cookie 更不容易受到 Cookie 窃取的攻击

- `Session`：定义 cookie 是一个临时 cookie，当浏览器关闭时过期

- `SameSite`：可以有 strict、lax 或 none 值

- - Strict：浏览器仅将 cookie 发送到与来源域相同的目标域
  - Lax：浏览器将 cookie 发送到不同于来源域的目标域，但仅限于安全请求（如 GET）且不是第三方 cookie。
  - None：允许第三方 cookie（跨站点 cookie）

你可以通过右键单击并选择 “Inspect” > “Application” > “Storage” > “Cookies” 查看你正在浏览的网站的 cookies。当你选择一行时，你可以在页面底部看到值：

![图 4 - 打开 Google Chrome 默认打开 www.google.com 网站并检查活动 cookie 的结果！](cookies/google-cookie.webp)

### Cookies 的类型

当你需要处理 cookies 时，可能会遇到一些 cookie 术语。可以从多个角度将 cookies 粗略地分为不同的类别。有第一方 cookies 和第三方 cookies。有必需 cookies（绝对必要）和非必须 cookies（非必要）。我们将在这里使用后者来对我们的 cookies 进行分类。分类并不重要，这只是为了让人们更容易将东西放在心理盒子里。此外，有些 cookies 只是其他 cookies 的变体。例如，你可能会听到 “安全 cookie”，但实际上这可能只是启用了 _secure_ 属性的会话 cookie 或第一方 cookie。即使如此，会话 cookies 和第一方 cookies 也可能非常相似。尽管在我看来，这些术语的定义相当模糊，不同的网站可能会互换使用不同的 cookie 术语，但我们至少应该尝试为它们中的每一个给出某种定义。

#### 必需 cookies

必需 cookies 对于网站正常运行是必要的，通常使用户的浏览体验更方便。

- 会话 cookies
- 第一方 cookies
- 认证 cookies
- 用户中心安全 cookies
- 用户输入 cookies

#### 会话 cookies

会话 cookies （又称非持久 cookie、内存 cookie、临时 cookie）是临时 cookie 文件，当用户关闭浏览器或其会话变为非活动状态时会被删除（如果用户注销，会话将结束）。它们是单次会话 cookies。当用户重新启动浏览器并返回创建 cookie 的网站时，网站将无法识别用户，因为用户的浏览器中没有 cookie 供网站读取。如果网站需要登录，用户将需要重新登录。登录后，将生成一个新的会话 cookie，它将存储用户的浏览信息并在用户离开网站并关闭浏览器之前保持活动状态。由于会话 cookie 具有其独特的 ID，它还可用于跟踪网站访问者数量。如果您正在计划一次度假旅行，并且每天多次访问旅行社的网站，会话 cookie 的 ID 将向该网站透露您只是一个独特的访客。
