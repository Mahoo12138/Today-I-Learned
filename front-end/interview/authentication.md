## 从状态说起

### HTTP 无状态

我们知道，HTTP 是无状态的。也就是说，HTTP 请求方和响应方间无法维护状态，都是一次性的，它不知道前后的请求都发生了什么。

但有的场景下，我们需要维护状态。最典型的，一个用户登陆微博，发布、关注、评论，都应是在登录后的用户状态下的。

### **标记**

那解决办法是什么呢？==标记==。

> 在学校或公司，入学入职那一天起，会录入你的身份、账户信息，然后给你发个卡，今后在园区内，你的门禁、打卡、消费都只需要刷这张卡。

### **前端存储**

这就涉及到一发、一存、一带，发好办，登陆接口直接返回给前端，存储就需要前端想办法了。

> 前提是，你要把卡带在身上。

前端的存储方式有很多。

- 最矬的，挂到全局变量上，但这是个「体验卡」，一次刷新页面就没了
- 高端点的，存到 `cookie`、`localStorage` 等里，这属于「会员卡」，无论怎么刷新，只要浏览器没清掉或者过期，就一直拿着这个状态。

前端存储这里不展开了。有地方存了，请求的时候就可以拼到参数里带给接口了。

## 基石：cookie

> 可是前端好麻烦啊，又要自己存，又要想办法带出去，有没有不用操心的？

有，cookie。

cookie 也是前端存储的一种，但相比于 localStorage 等其他方式，借助 HTTP 头、浏览器能力，cookie 可以做到前端无感知。

一般过程是这样的：

- 在提供标记的接口，通过 HTTP 返回头的 Set-Cookie 字段，直接「种」到浏览器上
- 浏览器发起请求时，会自动把 cookie 通过 HTTP 请求头的 Cookie 字段，带给接口

- 浏览器发起请求时，会自动把 cookie 通过 HTTP 请求头的 Cookie 字段，带给接口

### 配置：Domain / Path

> 你不能拿清华的校园卡进北大。

cookie 是要限制==空间范围==的，通过 Domain（域）/ Path（路径）两级。

> Domain 属性指定浏览器发出 HTTP 请求时，哪些域名要附带这个 Cookie。如果没有指定该属性，浏览器会默认将其设为当前 URL 的一级域名，比如 *http://www.example.com* 会设为 *http://example.com*，而且以后如果访问 *http://example.com* 的任何子域名，HTTP 请求也会带上这个 Cookie。如果服务器在Set-Cookie字段指定的域名，不属于当前域名，浏览器会拒绝这个 Cookie。  
> Path 属性指定浏览器发出 HTTP 请求时，哪些路径要附带这个 Cookie。只要浏览器发现，Path 属性是 HTTP 请求路径的开头一部分，就会在头信息里面带上这个 Cookie。比如，PATH 属性是/，那么请求 /docs 路径也会包含该 Cookie。当然，前提是域名必须一致。

### 配置：Expires / Max-Age

> 你毕业了卡就不好使了。

cookie 还可以限制==时间范围==，通过 Expires、Max-Age 中的一种。

> Expires 属性指定一个具体的到期时间，到了指定时间以后，浏览器就不再保留这个 Cookie。它的值是 UTC 格式。如果不设置该属性，或者设为 null，Cookie 只在当前会话（session）有效，浏览器窗口一旦关闭，当前 Session 结束，该 Cookie 就会被删除。另外，浏览器根据本地时间，决定 Cookie 是否过期，由于本地时间是不精确的，所以没有办法保证 Cookie 一定会在服务器指定的时间过期。  
> Max-Age 属性指定从现在开始 Cookie 存在的秒数，比如 60 * 60 * 24 * 365（即一年）。过了这个时间以后，浏览器就不再保留这个 Cookie。  
> 如果同时指定了 Expires 和 Max-Age，那么 Max-Age 的值将优先生效。  
> 如果 Set-Cookie 字段没有指定 Expires 或 Max-Age 属性，那么这个 Cookie 就是 Session Cookie，即它只在本次对话存在，一旦用户关闭浏览器，浏览器就不会再保留这个 Cookie。

### 配置：Secure / HttpOnly

> 有的学校规定，不带卡套不让刷（什么奇葩学校，假设）；有的学校不让自己给卡贴贴纸。

cookie 可以限制==使用方式==。

> Secure 属性指定浏览器只有在加密协议 HTTPS 下，才能将这个 Cookie 发送到服务器。另一方面，如果当前协议是 HTTP，浏览器会自动忽略服务器发来的 Secure 属性。该属性只是一个开关，不需要指定值。如果通信是 HTTPS 协议，该开关自动打开。  
> HttpOnly 属性指定该 Cookie 无法通过 JavaScript 脚本拿到，主要是 `Document.cookie` 属性、`XMLHttpRequest` 对象和 Request API 都拿不到该属性。这样就防止了该 Cookie 被脚本读到，只有浏览器发出 HTTP 请求时，才会带上该 Cookie。

### HTTP 头对 cookie 的读写

回过头来，HTTP 是如何写入和传递 cookie 及其配置的呢？

HTTP 返回的一个 Set-Cookie 头用于向浏览器写入「一条（且只能是一条）」cookie，格式为 cookie 键值 + 配置键值。例如：

```
Set-Cookie: username=jimu; domain=jimu.com; path=/blog; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly
```

那我想一次多 set 几个 cookie 怎么办？多给几个 Set-Cookie 头（一次 HTTP 请求中允许重复）

```
Set-Cookie: username=jimu; domain=jimu.com
Set-Cookie: height=180; domain=me.jimu.com
Set-Cookie: weight=80; domain=me.jimu.com
```

HTTP 请求的 Cookie 头用于浏览器把符合当前「空间、时间、使用方式」配置的所有 cookie 一并发给服务端。因为由浏览器做了筛选判断，就不需要归还配置内容了，只要发送键值就可以。

```
Cookie: username=jimu; height=180; weight=80
```
