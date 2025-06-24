## iframe 是什么

`<iframe>`（inline frame）可以在当前页面中嵌入另一个 HTML 页面，实现多个页面共存。

```html
<iframe src="https://example.com"></iframe>
```

## iframe 的优点

| 优点                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| **隔离性强**              | iframe 的内容与主页面是相互独立的 DOM 和 JS 环境（可用于沙箱执行） |
| **可复用嵌套内容**        | 比如广告、评论插件、支付组件，可以从其他域复用嵌入           |
| **不会污染主页面 JS/CSS** | 内部页面的脚本、样式不会影响宿主页面，反之亦然（前提是非同源） |
| **跨域嵌套支持**          | 可以嵌入不同域的内容，而不会因为浏览器同源策略导致 JS 报错（因为本身不能直接访问） |

## iframe 的缺点

| 缺点           | 说明                                                             |
| ------------ | -------------------------------------------------------------- |
| **性能差**      | iframe 页面是独立文档，会重复加载资源，影响初始加载性能                                |
| **SEO 不友好**  | 搜索引擎爬虫不容易抓取 iframe 中的内容                                        |
| **样式难控制**    | 无法直接通过 CSS 影响 iframe 内部内容（尤其是跨域 iframe）                        |
| **通信困难**     | 跨域 iframe 不能直接访问 parent/child，需要使用 `postMessage`               |
| **响应式布局复杂**  | iframe 的高度默认是固定的，需要手动适配内容高度                                    |
| **历史记录管理困难** | 嵌套的 iframe 页面不会影响主页面的浏览历史管理，路由混乱                               |
| **安全隐患**     | 如果嵌入的是第三方页面，容易造成 XSS、clickjacking 等攻击（需配合 `sandbox`, `CSP` 使用） |

## 常见使用场景

| 场景             | 说明                                              |
| -------------- | ----------------------------------------------- |
| **广告投放**       | 常用于嵌入第三方广告，如 Google Ads，隔离执行环境防止污染主页面           |
| **第三方支付**      | 比如嵌入 Stripe/PayPal 的支付 iframe，隔离支付流程            |
| **文档预览**       | 嵌入 PDF、Office 文档或其他 Web 页面（避免重写代码）              |
| **旧系统集成**      | 在现代系统中嵌入遗留系统的 UI，隔离架构逻辑                         |
| **登录/认证**（过去）  | 嵌入 OAuth 登录页（现在多用 popup + redirect，iframe 使用受限） |
| **低代码/可视化编辑器** | 可用于嵌套沙箱环境运行自定义代码、预览页面                           |

## 安全使用 iframe

### 使用 `sandbox` 属性

`sandbox` 是 `<iframe>` 专属的安全机制，它默认**全面限制 iframe 权限**，然后通过属性逐项放开。

```html
<iframe 
  src="https://example.com/embed"
  sandbox="allow-scripts allow-forms allow-same-origin">
</iframe>
```

| 子属性                 | 含义                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `allow-scripts`        | 允许 JS 脚本执行（但仍不能创建弹窗）                         |
| `allow-same-origin`    | 允许 iframe 中的 JS 识别其为“同源”（不设此属性则变成沙箱域） |
| `allow-forms`          | 允许表单提交                                                 |
| `allow-popups`         | 允许弹窗（如 `window.open`）                                 |
| `allow-modals`         | 允许 `alert`, `confirm`, `prompt` 等弹窗                     |
| `allow-downloads`      | 允许触发下载行为                                             |
| `allow-presentation`   | 允许进入全屏展示模式                                         |
| `allow-top-navigation` | 允许通过 JS 跳转父窗口的地址（极其危险）                     |

#### allow-same-origin

该属性允许被沙盒化的 `iframe` 内容保持“同源”权限，即让 `iframe` 内的代码能够像正常页面一样访问自己来源（协议+域名+端口）下的资源。

- 当 `iframe` 启用 `sandbox` 但未添加 `allow-same-origin` 时，浏览器会强制将 `iframe` 视为**独立于任何来源的“隔离源”**（类似 `data:` URL），无法访问其原始域的资源；
- `allow-same-origin` **必须与 `allow-scripts` 配合**才能生效；



### 使用 CSP 控制 iframe 加载与嵌套

`Content-Security-Policy` 是 HTTP 响应头，用于约束当前页面或嵌套页面的行为，尤其适用于 iframe 安全管理。

#### 限制谁能嵌入你的网站：

```http
Content-Security-Policy: frame-ancestors 'self' https://trusted.com
```

- 表示你的页面**只允许被自己或指定来源（trusted.com）以 iframe 形式嵌入**

#### 限制你加载哪些 iframe：

```http
Content-Security-Policy: child-src https://bilibili.com
```

- 限定你只加载某些 iframe 源，防止被注入不明来源的内容；

## 面试题

### iframe 有哪些优缺点及使用场景？

`iframe` 用于在当前页面嵌入独立文档，优点是隔离性强、可用于跨域嵌套，常用于广告、支付、旧系统集成等。但它也有性能差、通信复杂、SEO 差、安全性较弱的问题。现代开发中应慎用，必要时应结合 `sandbox`、`postMessage`、`CSP` 等手段保障安全。