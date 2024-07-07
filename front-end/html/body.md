# body 元素的 onerror 事件处理

## 前言

> Thus, for example, a bubbling error event dispatched on a child of the `body` element of a `Document` would first trigger the `onerror` event handler content attributes of that element, then that of the root `html` element, and only then would it trigger the `onerror` event handler content attribute on the `body` element. This is because the event would bubble from the target, to the `body`, to the `html`, to the `Document`, to the `Window`, and the event handler on the `body` is watching the `Window` not the `body`. A regular event listener attached to the `body` using `addEventListener()`, however, would be run when the event bubbled through the `body` and not when it reaches the `Window` object.

查看 HTML 标准的时候，看到了[上述内容]([HTML Standard (whatwg.org)](https://html.spec.whatwg.org/multipage/sections.html#the-body-element))，比较陌生，算是知识盲区，决定写点东西，加深印象。

### 事件冒泡和捕获

回顾一下事件冒泡和捕获机制：事件冒泡是指事件从目标元素开始，逐级向上传播到父元素，直到根元素（通常是 `document` 或 `window`）。事件捕获是指事件从根元素开始，逐级向下传播到目标元素。默认情况下，大多数事件都是冒泡的。

#### 事件流的三个阶段

在事件流中有三个阶段：

1. **捕获阶段（Capture Phase）**：事件从祖先元素向目标元素传播。
2. **目标阶段（Target Phase）**：事件到达目标元素。
3. **冒泡阶段（Bubble Phase）**：事件从目标元素向祖先元素传播。

也就是说，默认情况下，所有事件都会经过捕获阶段和冒泡阶段，只是事件处理程序通常在冒泡阶段注册，因此人们更熟悉事件在冒泡阶段被触发的情况。默认情况下，事件处理程序在冒泡阶段触发，而不是捕获阶段。

考虑以下代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Event Capture Example</title>
    <style>
        div { padding: 20px; border: 1px solid black; }
    </style>
</head>
<body>
    <div id="outer">
        Outer
        <div id="inner">
            Inner
        </div>
    </div>

    <script>
        const outer = document.getElementById('outer');
        const inner = document.getElementById('inner');

        // 捕获阶段的事件处理程序
        outer.addEventListener('click', function(event) {
            console.log('Outer div capture');
        }, true);

        inner.addEventListener('click', function(event) {
            console.log('Inner div capture');
        }, true);

        // 冒泡阶段的事件处理程序
        outer.addEventListener('click', function(event) {
            console.log('Outer div bubble');
        }, false);

        inner.addEventListener('click', function(event) {
            console.log('Inner div bubble');
        }, false);
    </script>
</body>
</html>
```

然后是点击 div 后的输出：

```console
Outer div capture
Inner div capture
Inner div bubble
Outer div bubble
```

当点击 `inner`div 时，会历经以下三个阶段：

- 捕获阶段：
  - 事件从 `window` 开始，经过 `document`、`html`、`body`、`#outer`，最后到达 `#inner`。
  - `#outer` 的捕获处理程序被触发，输出 `Outer div capture`。
  - `#inner` 的捕获处理程序被触发，输出 `Inner div capture`。
- 目标阶段：
  - 事件到达目标元素 `#inner`，此时没有特定的捕获或冒泡处理程序，仅仅是事件的目标阶段。
- 冒泡阶段：
  - 事件从 `#inner` 冒泡到 `#outer`，再到 `body`、`html`、`document`，最后到 `window`。
  - `#inner` 的冒泡处理程序被触发，输出 `Inner div bubble`。
  - `#outer` 的冒泡处理程序被触发，输出 `Outer div bubble`。

无论是捕获阶段还是冒泡阶段， 调用以下方法都会终止后续的事件传递：

+ `stopPropagation()`：阻止事件继续捕获/冒泡到其他元素，但仍会在当前元素的其他事件处理程序中继续传播；
+ `stopImmediatePropagation()`：阻止事件继续捕获/冒泡到其他元素，同时阻止当前元素上剩下的其他事件处理程序被调用。

## 错误事件的冒泡顺序

当一个 `error` 事件在 `body` 元素的子元素上被触发时，事件会按照以下顺序冒泡：

1. 首先，触发目标元素（`body` 的子元素）的 `onerror` 事件处理程序。
2. 事件冒泡到父元素，触发 `body` 元素的 `onerror` 事件处理程序。
3. 继续冒泡，触发 `html` 元素的 `onerror` 事件处理程序。
4. 事件最终冒泡到 `document` 和 `window`。

### body `onerror` 的特殊性

`body` 元素上的 `onerror` 事件处理程序实际上是监听 `window` 对象上的错误事件，而不是 `body` 本身的错误事件。这意味着当事件冒泡到 `window` 时，才会触发 `body` 元素上的 `onerror` 事件处理程序。

而使用 `addEventListener` 在 `body` 元素上绑定一个常规的事件处理程序，当事件冒泡到 `body` 时，这个处理程序就会被触发，而不需要等到事件冒泡到 `window` 对象。

## 一个验证的例子

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>body onerror Example</title>
  </head>
  <body>
    <div id="child">Child</div>

    <script>
      // Using onerror on the body
      document.body.onerror = function () {
        console.log("Error handler on body (watching window)");
      };

      // Using addEventListener on the body
      document.body.addEventListener("error", function () {
        console.log("Error event listener on body");
      });

      // window.onerror = function () {
      //   console.log("Error handler on window");
      // };

      // Using addEventListener on the window
      window.addEventListener("error", function () {
        console.log("Error event listener on window");
      });

      // Triggering an error event on the child div
      document
        .getElementById("child")
        .dispatchEvent(new Event("error", { bubbles: true }));
    </script>
  </body>
</html>
```

1. 事件触发目标是 `#child` 元素，首先会触发 `#child` 的事件处理程序（如果有的话）。
2. 事件冒泡到 `body` 元素，触发通过 `addEventListener` 绑定在 `body` 上的事件处理程序。
3. 事件继续冒泡到 `html` 元素，触发 `html` 上的事件处理程序（如果有的话）。
4. 最后，事件冒泡到 `window` 对象，触发通过 `onerror` 绑定在 `body` 上的事件处理程序。

当然，这样验证其实比较麻烦，比较直观的是：

```js
console.log(window.onerror === document.body.onerror)
// true
```

