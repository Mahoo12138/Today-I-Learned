+ 有几种方式可以取得对 `<form>` 元素的引用。最常用的是将表单当作普通元素为它指定一个 id 属性，从而可以使用 `getElementById()`来获取表单；

+ `focus()`方法把浏览器焦点设置到表单字段，这意味着该字段会变成活动字段并可以响应键盘事件。  
+ `focus()`的反向操作是 `blur()`，其用于从元素上移除焦点。  

+ 对于`<input>`和`<textarea>`元素， `change` 事件会在字段失去焦点，同时 `value` 自控件获得焦点后发生变化时触发。对于`<select>`元素， `change` 事件会在用户改变了选中项时触发，不需要控件失去焦点。  
+ `<input>`元素`size` 属性指定文本框的宽度，这个宽度是以字符数来计量的；
+ `<textarea>`的初始值必须包含在`<textarea>`和`</textarea>`之间；
+ 应该使用 `value` 属性，而不是标准 DOM 方法读写文本框的值；
+ 剪贴板上的数据可以通过 window 对象（ IE）或 event 对象（ Firefox、 Safari 和 Chrome）上的 `clipboardData` 对象来获取。
+ 在 Firefox、 Safari 和 Chrome 中，为防止未经授权访问剪贴板，只能在剪
  贴板事件期间访问 `clipboardData` 对象；
+ HTML5 为文本字段新增了 `pattern` 属性。这个属性用于指定一个正则表达式；
+ 使用 `checkValidity()`方法可以检测表单中任意给定字段是否有效；
+ `validity` 属性会告诉我们字段为什么有效或无效。这个属性是一个对象，包含一系列返回布尔值的属性；
+ 通过指定 `novalidate` 属性可以禁止对表单进行任何验证；

---

+ 富文本编辑的基本技术就是在空白 HTML 文件中嵌入一个`iframe`。通过 `designMode` 属性，可以将这个空白文档变成可以编辑的，实际编辑的则是`<body>`元素的 HTML；
+ 可以给页面中的任何元素指定 `contenteditable` 属性，然后该元素会立即被用户编辑；  
+  通过表单提交富文本，通常的解决方案是在表单中添加一个隐藏字段，使用内嵌窗格或
  contenteditable 元素的 HTML 更新它的值；

  