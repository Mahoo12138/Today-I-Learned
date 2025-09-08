## 核心概念

`document.currentScript` 是一个只读属性，它返回当前正在执行的 `<script>` 元素。简单来说，就是让 JavaScript 代码能够识别"我现在正在哪个 script 标签里运行？"。

这解决了一个实际问题：当页面上有多个脚本时，有时脚本需要知道关于自身的信息——比如它从哪里加载、有什么属性、或者在 DOM 中的位置。

## 历史演变

`document.currentScript` 是作为 HTML5 规范的一部分引入的，大约在 2011-2013 年标准化。在它出现之前，开发者必须使用各种变通方法：

**早期的替代方案：**

- 检查 `document.getElementsByTagName('script')` 并假设最后一个就是当前执行的（不可靠）
- 使用 `Error().stack` 解析堆栈跟踪（非标准，容易出错）
- 要求开发者通过全局变量手动传递配置

这个属性的加入为这个常见需求提供了一个干净、标准的解决方案。

## 当前状态

`document.currentScript` 在所有现代浏览器中都**完全支持**：

- Chrome/Edge：从版本 29 开始（2013）
- Firefox：从版本 4 开始（2011）
- Safari：从版本 8 开始（2014）
- Opera：从版本 16 开始（2013）

它是 HTML 现行标准的一部分，被认为是稳定的、可用于生产环境的 API。

## 工作原理

```javascript
// 在 <script> 标签内
console.log(document.currentScript); // 返回该 <script> 元素

// 访问属性
const scriptSrc = document.currentScript.src;
const dataConfig = document.currentScript.getAttribute('data-config');
```

**重要限制：** 在以下情况下 `document.currentScript` 返回 `null`：

- 在事件处理器内
- 在回调函数内（如 `setTimeout`、`Promise.then`）
- 在模块脚本内（`<script type="module">`）
- 脚本执行完毕后

## 实用技巧

### 1. **自引用配置**

```javascript
// 库脚本根据自身属性进行配置
<script src="widget.js" data-theme="dark" data-api-key="abc123"></script>

// 在 widget.js 内部：
const config = {
  theme: document.currentScript.getAttribute('data-theme'),
  apiKey: document.currentScript.getAttribute('data-api-key')
};
```
### 2. **相对路径解析**

```javascript
// 查找相对于脚本位置的资源
const scriptDir = new URL('.', document.currentScript.src).href;
const cssPath = scriptDir + 'styles.css';
```
### 3. **尽早缓存引用**

```javascript
// 由于 currentScript 在异步上下文中会变为 null，需要立即保存
const thisScript = document.currentScript;

setTimeout(() => {
  console.log(document.currentScript); // null
  console.log(thisScript); // 仍然保有引用
}, 100);
```
### 4. **检测内联脚本**

```javascript
if (document.currentScript.src === '') {
  // 这是内联脚本
} else {
  // 这是外部脚本
}
```

### 5. **模块脚本的替代方案**

对于 ES6 模块，使用 `import.meta.url` 代替：

```javascript
// 在模块脚本中
const currentModuleURL = import.meta.url;
```

## 常见陷阱

**不要在异步上下文中使用** - 它会返回 `null`：

```javascript
// ❌ 不会工作
fetch('/api').then(data => {
  console.log(document.currentScript); // null
});

// ✅ 先捕获它
const script = document.currentScript;
fetch('/api').then(data => {
  console.log(script); // 可以工作
});
```

**模块脚本** - 对于 type="module" 的脚本始终返回 `null`，请改用 `import.meta`。

## 何时使用

适用场景：

- 构建需要自我配置的可嵌入组件/库
- 需要加载相对于自身的额外资源的脚本
- 需要知道如何被加载的分析或追踪脚本
- 需要检测自身 script 标签的 polyfill

`document.currentScript` 是一个简单但强大的工具，用于创建更灵活、更独立的 JavaScript 组件。