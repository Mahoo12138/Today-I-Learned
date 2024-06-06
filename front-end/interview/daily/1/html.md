# 页面导入样式时，使用link和@import有什么区别？

+ 1.link 是 HTML(XHTML) 标签，@import 是 css 提供的。
+ link 引入的样式页面加载时同时加载，@import 引入的样式需等页面加载完成后再加载。
+ link 没有兼容性问题，@import 是在 CSS2.1 提出的, 不兼容 ie5 以下。
+ link 可以通过 js 操作 DOM 动态引入样式表改变样式，而 @import 不可以。


link 标签除了引入样式，还可以被用来创建站点图标：
```html
<link rel="icon" href="favicon.ico">

```