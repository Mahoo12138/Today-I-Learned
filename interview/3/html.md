# 第3天 HTML全局属性(global attribute)有哪些（包含H5）？

全局属性：用于任何HTML5元素的属性

- accesskey：设置快捷键
- class：为元素设置类标识
- contenteditable：指定元素内容是否可编辑
- contextmenu：自定义鼠标右键弹出上下文菜单内容（仅firefox支持）
- data-*：为元素增加自定义属性
- dir：设置元素文本方向（默认ltr；rtl）
- draggable：设置元素是否可拖拽
- dropzone：设置元素拖放类型（copy|move|link,H5新属性，主流均不支持）
- hidden：规定元素仍未或不在相关
- id：元素id，文档内唯一
- lang：元素内容的语言
- spellcheck：是否启动拼写和语法检查
- style：行内css样式
- tabindex：设置元素可以获得焦点，通过tab导航
- title：规定元素有关的额外信息
- translate：元素和子孙节点内容是否需要本地化（均不支持）

## accesskey 

提供了为当前元素生成快捷键的方式。属性值必须包含一个可打印字符。

激活 accesskey 的操作取决于浏览器及其平台，例如 Firefox 在 Windows 和 Linux平台中为 `Alt + Shift + key`，在 Mac 中为 `Control + Option + key`。



