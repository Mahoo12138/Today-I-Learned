**跨站脚本攻击**（Cross-Site Scripting，**XSS**，区别于层叠样式表 CSS）是一种注入攻击，它将恶意代码注入到本来安全的网站中。攻击者利用目标网站的漏洞，向最终用户发送恶意代码，通常是客户端 JavaScript。与直接针对应用程序主机不同，XSS 攻击通常直接针对应用程序的用户。

如果 Web 应用程序在没有适当转义或验证的情况下显示来自用户或不受信任来源的内容，就会为 XSS 攻击留下漏洞。XSS 漏洞是当今 OWASP 十大安全问题之一，特别是因为许多组织严重依赖 Web 应用程序进行客户互动和验证。

### **Reflected XSS**

反射型的 XSS 攻击，主要是由于**服务端接收到客户端的不安全输入**，**在客户端触发执行**从而发起 Web 攻击。

具体而言，反射型 XSS 只是简单地把用户输入的数据 “反射” 给浏览器，这种攻击方式往往需要攻击者诱使用户点击一个恶意链接，或者提交一个表单，或者进入一个恶意网站时，注入脚本进入被攻击者的网站。这是一种**非持久型**的攻击。

比如：在某购物网站搜索物品，搜索结果会显示搜索的关键词。搜索关键词填入`<script>alert('handsome boy')</script>`，点击搜索。页面没有对关键词进行过滤，这段代码就会直接在页面上执行，弹出 alert。

### **Stored XSS**

基于存储的 XSS 攻击，是通过**提交带有恶意脚本的内容存储在服务器上**，**当其他人看到这些内容时发起 Web 攻击**。一般提交的内容都是通过一些**富文本编辑器**编辑的，很容易插入危险代码。

比较常见的一个场景是攻击者在社区或论坛上写下一篇包含恶意 JavaScript 代码的文章或评论，文章或评论发表后，所有访问该文章或评论的用户，都会在他们的浏览器中执行这段恶意的 JavaScript 代码。这是一种**持久型**的攻击。

### **DOM XSS**

基于 DOM 的 XSS 攻击是指通过恶意脚本修改页面的 DOM 结构，是**纯粹发生在客户端的攻击**。

DOM 型 XSS 跟前两种 XSS 的区别：**DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞**。举个栗子 ：

```html
<input type="text" id="input">
<button id="btn">Submit</button>
<div id="div"></div>
<script>
    const input = document.getElementById('input');
    const btn = document.getElementById('btn');
    const div = document.getElementById('div');
 
    let val;
    
    input.addEventListener('change', (e) => {
        val = e.target.value;
    }, false);
 
    btn.addEventListener('click', () => {
        div.innerHTML = `<a href=${val}>testLink</a>`
    }, false);
</script>
```

点击 Submit 按钮后，会在当前页面插入一个链接，其地址为用户的输入内容。如果用户在输入时构造了如下内容：

```text
" onclick=alert(/xss/)
```

用户提交之后，页面代码就变成了：

```html
<a href onlick="alert(/xss/)">testLink</a>
```

此时，用户点击生成的链接，就会执行对应的脚本。**DOM 型 XSS 攻击，实际上就是网站前端 JavaScript 代码本身不够严谨，把不可信的数据当作代码执行了。**在使用 `.innerHTML`、`.outerHTML`、`document.write()` 时要特别小心，不要把不可信的数据作为 HTML 插到页面上，而应尽量使用 `.textContent`、`.setAttribute()` 等。
DOM 中的内联事件监听器，如 `location`、`onclick`、`onerror`、`onload`、`onmouseover` 等，`<a>` 标签的 `href` 属性，JavaScript 的 `eval()`、`setTimeout()`、`setInterval()` 等，都能把字符串作为代码运行。如果不可信的数据拼接到字符串中传递给这些 API，很容易产生安全隐患，请务必避免。

### JSONP XSS

JSONP 的 callback 参数非常危险，有两种风险可能导致 XSS：

1. callback 参数**意外截断 js 代码**，特殊字符单引号双引号，换行符均存在风险。
2. callback 参数**恶意添加标签**，造成 XSS 漏洞。

浏览器为了保证跨域访问的安全性，会默认发一个 callback 参数到后台，接口拿到这个参数之后，需要将返回的 JSON 数据外面包上 callback 参数。

具体的返回格式：

```js
CALLBACK(JSON)
```

如果 ajax 请求是 JSONP 请求，返回的内容浏览器还会自动检测，如果不是按这个格式返回或者 callback 的内容不对，这次请求就算失败了。

这里有一个机制，那就是**请求的 callback 会被放入返回的内容当中**，这也是可能出问题的地方。举个栗子，如果返回的页面，那么 `Content-Type: text/html`，那么 callback 注入的 html 元素都可以直接放到页面上了。那么，html 页面必然不能支持 callback。支持 JSONP 的链接如果直接放到浏览器里面访问，浏览器就不会做 callback 校验了。





+ [前端 | XSS 的攻击手段及其防御 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/61773197)

+ [前端安全系列（一）：如何防止XSS攻击？ - 美团技术团队 (meituan.com)](https://tech.meituan.com/2018/09/27/fe-security.html)