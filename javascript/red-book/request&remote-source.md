2005 年， Jesse James Garrett 撰写的文章中描绘了一个被他称作 Ajax（ Asynchronous JavaScript+XML，即异步 JavaScript 加 XML）的技术，涉及发送服务器请求额外数据而不刷新页面；

+ 把 Ajax 推到历史舞台上的关键技术是 XMLHttpRequest（ XHR）对象；
+ 这个技术主要是可以实现在不刷新页面的情况下从服务器获取数据，格式并不一定是 XML ；
+ XHR 对象的 API 被普遍认为比较难用，而 Fetch API （支持期约（ promise）和服务线程（ service worker）自从诞生以后就迅速成为了 XHR 更现代的替代标准。 

### XMLHttpRequest 对象  

通过 `XMLHttpRequest` 构造函数原生支持 XHR 对象：  

+ 调用 `open()`不会实际发送请求，只是为发送请求做好准备；
+ `send()`方法接收一个参数，是作为请求体发送的数据；
+ 多数情况下最好使用异步请求，这样可以不阻塞 JavaScript 代码继续执行；
+ 每次 `readyState` 从一个值变成另一个值，都会触发 `readystatechange` 事件；
+ 在收到响应之前如果想取消异步请求，可以调用 `abort()` 方法；

---

默认情况下， XHR 请求会发送以下头部字段：

+ **Accept**：浏览器可以处理的内容类型。

+ **Accept-Charset**：浏览器可以显示的字符集。
+ **Accept-Encoding**：浏览器可以处理的压缩编码类型。
+ **Accept-Language**：浏览器使用的语言。
+ **Connection**：浏览器与服务器的连接类型。
+ **Cookie**：页面中设置的 Cookie。
+ **Host**：发送请求的页面所在的域。
+ **Referer**：发送请求的页面的 URI。注意，这个字段在 HTTP 规范中就拼错了，所以考虑到兼容
性也必须将错就错。**（正确的拼写应该是 Referrer）**
+ **User-Agent**：浏览器的用户代理字符串

如果需要发送额外的请求头部，可以使用 `setRequestHeader()` 方法；

+ 必须在 `open()`之后、 `send()`之前调用 `setRequestHeader()` ；

+ 有些浏览器允许重写默认头部，有些浏览器则不允许；

最常用的请求方法是 GET 请求，用于向服务器查询某些信息：

+ 查询字符串中的每个名和值都必须使用 `encodeURIComponent()` 编码；

POST 请求，用于向服务器发送应该保存的数据：

+ 使用 XHR 模拟表单提交。为此，第一步需要把 **ContentType** 头部设置为`"application/x-www-formurlencoded"` ；

XMLHttpRequest Level 1 只是把已经存在的 XHR 对象的实现细节明确了一下。 XMLHttpRequest Level 2
又进一步发展了 XHR 对象；

+ XMLHttpRequest Level 2 新增了 `FormData` 类型；  
+  `FormData` 实例可直接传给 XHR 对象的 `send()`方法，不再需要给 XHR 对象显式设置任何请求头部了；
+ 在给 timeout 属性设置了一个时间且在该时间过后没有收到响应时， XHR 对象就会触发 timeout 事件；
+ Firefox 首先引入了 `overrideMimeType()` 方法用于重写 XHR 响应的 MIME 类型，必须在调用 `send()` 之前调用 `overrideMimeType()`；

### 进度事件

这些事件最初只针对 XHR，现在也推广到了其他类似的 API：

+ **loadstart**：在接收到响应的第一个字节时触发。
+ **progress**：在接收响应期间反复触发。
+ **error**：在请求出错时触发。
+ **abort**：在调用 `abort()` 终止连接时触发。
+ **load**：在成功接收完响应时触发。
+ **loadend**：在通信完成时，且在 error、 abort 或 load 之后触发

load 事件在响应接收完成后立即触发，这样就不用检查 readyState 属性：

+ onload 事件处理程序会收到一个 event 对象，其 target 属性设置为 XHR 实例  

Mozilla 在 XHR 对象上另一个创新是 progress 事件：

+ 事件的 event 对象，其 target 属性是 XHR 对象，且包含 3 个额外属性： `lengthComputable`、 `position` 和 `totalSize`，分别表示进度信息是否可用、接收到的字节数；、响应的 ContentLength 头部定义的总字节数；
+ 有了这些信息，就可以给用户提供进度条了；

### 跨源资源共享

通过 XHR 进行 Ajax 通信的一个主要限制是跨源安全策略。 

跨源资源共享（ CORS， Cross-Origin Resource Sharing）定义了浏览器与服务器如何实现跨源通信。

基本思路就是使用自定义的 HTTP 头部允许浏览器和服务器相互了解，以确实请求或响应应该成功还是失败。  

+ 发送请求时，没有自定义头部，则会创建一个 `Origin` 头部，包含发送请求的页面的源（协议、域名和端口）；
+ 如果服务器决定响应请求，那么应该发送 `Access-Control-Allow-Origin` 头部，包含相同的源； 
+ 如果资源是公开的，那么就包含"`*`"  ；

现代浏览器通过 XMLHttpRequest 对象原生支持 CORS ；出于安全考虑，跨域 XHR 对象也施加了一些额外限制：

+ 不能使用 `setRequestHeader()`设置自定义头部。
+ 不能发送和接收 cookie。
+ `getAllResponseHeaders()`方法始终返回空字符串。

---

某些请求不会触发CORS 预检请求，称为**简单请求**；若请求满足所有下述条件，则该请求可视为简单请求：

- 使用下列方法之一：`GET`、`HEAD`、`POST`
- 除了被用户代理自动设置的头部字段（例如`Connection`，`User-Agent`）和在 Fetch 规范中定义为禁用头部名称 的其他头部，允许人为设置的字段为 Fetch 规范定义的对 CORS 安全的头部字段集合。该集合为：
  - `Accept`
  - `Accept-Language`
  - `Content-Language`
  - `Content-Type`（需要注意额外的限制）
- `Content-Type` 的值仅限于下列三者之一：
  - `text/plain`
  - `multipart/form-data`
  - `application/x-www-form-urlencoded`
- 请求中的任意 `XMLHttpRequest`对象均没有注册任何事件监听器；`XMLHttpRequest`对象可以使用 `XMLHttpRequest.upload`属性访问。
- 请求中没有使用 `ReadableStream`对象。

---

跨源资源共享标准新增了一组 HTTP 头部字段，允许服务器声明哪些源站通过浏览器有权限访问哪些资源。

另外，规范要求，对那些可能对服务器数据产生副作用的 HTTP 请求方法（特别是 GET 以外的 HTTP 请求，或者搭配某些 MIME 类型 的 POST 请求），**浏览器必须首先使用 OPTIONS 方法发起一个预检请求**（preflight request），从而获知服务端是否允许该跨源请求；

服务器确认允许之后，才发起实际的 HTTP 请求。在预检请求的返回中，服务器端也可以通知客户端，是否需要携带身份凭证（包括 Cookies 和 HTTP 认证 相关数据）。

与前述简单请求不同，“**需预检的请求**”要求必须首先使用 `OPTIONS` 方法发起一个**预检请求**到服务器，以获知服务器是否允许该实际请求。预检请求的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。

预检请求可以查询允许使用的自定义头部、除 GET 和 POST 之外的方法，以及可发送的不同请求体内容类型。 

服务器会通过在预检请求响应中发送如下头部信息：

+ Access-Control-Allow-Origin：与简单请求相同。
+ Access-Control-Allow-Methods：允许的方法（逗号分隔的列表）。
+ Access-Control-Allow-Headers：服务器允许的头部（逗号分隔的列表）。
+ Access-Control-Max-Age：缓存预检请求的秒数

在`Access-Control-Max-Age`有效时间内，浏览器无须为同一请求再次发起预检请求。

请注意，浏览器自身维护了一个 最大有效时间，如果该首部字段的值超过了最大有效时间，将不会生效。

当响应的是附带身份凭证的请求时，服务端必须明确 `Access-Control-Allow-Origin` 的值，而不能使用通配符`*`；

---

默认情况下，跨源请求不提供凭据（ cookie、 HTTP 认证和客户端 SSL 证书）。可以通过将 `withCredentials` 属性设置为 true 来表明请求会发送凭据。

但是，如果服务器端的响应中未携带 `Access-Control-Allow-Credentials: true`，浏览器将不会把响应内容返回给请求的发送者（ responseText 是空字符串， status 是 0， onerror()被调用） 。

CORS 预检请求不能包含凭据。预检请求的响应必须指定 `Access-Control-Allow-Credentials: true` 来表明可以携带凭据进行实际的请求；

### 替代性跨源技术

**图片探测**（ image pings）是利用 `<img>` 标签实现跨域通信的最早的一种技术。任何页面都可以跨域加载图片而不必担心限制；可以通过监听 onload 和 onerror 事件知道什么时候能接收到响应；

```js
img.src = "http://www.example.com/test?name=Nicholas";
```

图片探测频繁用于跟踪用户在页面上的点击操作或动态显示广告。当然，图片探测的缺点是只能发
送 GET 请求和无法获取服务器响应的内容；

JSONP 是“JSON with padding”的简写，JSONP 格式包含两个部分：**回调和数据**，JSONP 服务通常支持以查询字符串形式指定回调函数的名称；

JSONP 服务通常支持以查询字符串形式指定回调函数的名称；JSONP 响应在被加载完成之后会立即执行；

```js
function handleResponse(response) {
console.log(`
You're at IP address ${response.ip}, which is in
${response.city}, ${response.region_name}`);
}
let script = document.createElement("script");
script.src = "http://freegeoip.net/json/?callback=handleResponse";
document.body.insertBefore(script, document.body.firstChild);
```

+ JSONP 是从不同的域拉取可执行代码。如果这个域并不可信，则可能在响应中加入恶意内容；
+ 不好确定 JSONP 请求是否失败。虽然 HTML5 规定了<script>元素的 onerror 事件处理程序，但还没有被任何浏览器实现；

### Fetch API

Fetch API 能够执行 XMLHttpRequest 对象的所有任务，但更容易使用，接口也更现代化，能够在
Web 工作线程等现代 Web 工具中使用：

+ XMLHttpRequest 可以选择异步，而 Fetch API 则必须是异步；

+ `fetch()`方法是暴露在全局作用域中的，包括主页面执行线程、模块和工作线程  

Fetch API 支持通过 `AbortController/AbortSignal` 对中断请求。调用 `AbortController.abort()`会中断所有网络传输，特别适合希望停止传输大型负载的情况。  

```js
let abortController = new AbortController();
fetch('wikipedia.zip', { signal: abortController.signal })
.catch(() => console.log('aborted!');
// 10 毫秒后中断请求
setTimeout(() => abortController.abort(), 10);
// 已经中断
```

在初始化 Headers 对象时，也可以使用键/值对形式的对象，而 Map 则不可以； 

+ Headers 对象使用护卫来防止不被允许的修改；
+ 在通过构造函数初始化 Request 对象， 对 mode 属性赋值；   

使用 Request 构造函数和使用 `clone()` 方法，可以创建 Request 对象的副本：

+ init 对象，则 init 对象的值会覆盖源对象中同名的值；
+ 第一个请求（赋值请求）的请求体 (bodyUsed) 会被标记为“已使用”  ；
+ 如果源对象与创建的新对象不同源，则 referrer 属性会被清除；
+ 使用 `clone()` 方法，这个方法会创建一模一样的副本；
+ 如果请求对象的 bodyUsed 属性为 true（即请求体已被读取），这无法再使用上述方式克隆；

在调用 `fetch()` 时，可以传入已经创建好的 Request 实例而不是 URL：

+ `fetch()`也不能拿请求体已经用过的 Request 对象来发送请求；
+ 想基于包含请求体的相同 Request 对象多次调用 fetch()，必须在第一次发送 fetch()请求前
  调用 `clone()`；

### Beacon API

Beacon API 给 **navigator** 对象增加了一个 `sendBeacon()` 方法；

+ 方法接收一个 URL 和一个数据有效载荷参数，并会发送一个 POST 请求；
+ 有效载荷参数有 ArrayBufferView、 Blob、 DOMString、 FormData 实例；

```js
navigator.sendBeacon('https://example.com/analytics-reporting-url', '{foo: "bar"}');
```

+ `sendBeacon()` 并不是只能在页面生命周期末尾使用，而是任何时候都可以使用；
+ 调用 sendBeacon()后，浏览器会把请求添加到一个内部的请求队列。浏览器会主动地发送队
  列中的请求。
+ 浏览器保证在原始页面已经关闭的情况下也会发送请求。
+ 状态码、超时和其他网络原因造成的失败完全是不透明的，不能通过编程方式处理。
+ 信标（ beacon）请求会携带调用 sendBeacon()时所有相关的 cookie  

### Web Socket

Web Socket（套接字）的目标是通过一个长时连接实现与服务器全双工、双向的通信；

一个 HTTP 请求会发送到服务器以初始化连接。服务器响应后，连接使用 HTTP的 Upgrade 头部从 HTTP 协议切换到 Web Socket 协议； 

客户端与服务器之间可以发送非常少的数据，不会对HTTP 造成任何负担；

+ 必须给 WebSocket 构造函数传入一个绝对 URL。同源策略不适用于 Web Socket；
+ WebSocket 对象没有 readystatechange 事件；
+ 要向服务器发送数据，使用 `send()`方法并传入一个字符串、 ArrayBuffer 或 Blob ；
+ 服务器向客户端发送消息时， WebSocket 对象上会触发 **message** 事件 ；
+ WebSocket 对象不支持 DOM Level 2 事件监听器，因此需要使用 DOM Level 0 风格的事件处理； 
+ 只有 close 事件的 event 对象上有额外信息。这个对象上有 3 个额外属性：wasClean、 code 和 reason；

### 安全

在未授权系统可以访问某个资源时，可以将其视为跨站点请求伪造（ CSRF， cross-site request forgery）
攻击。  需要验证请求发送者拥有对资源的访问权限。可以通过如下方式实现：

+ 要求通过 SSL 访问能够被 Ajax 访问的资源。
+ 要求每个请求都发送一个按约定算法计算好的令牌（ token）  
