## Flex 子项的三个核心属性

```css
flex-grow
flex-shrink
flex-basis
```

这三个可以分开写，也可以一起简写属性：

```css
flex: <flex-grow> <flex-shrink> <flex-basis>;
flex: 1 0 auto;
```

## **`flex-grow`**：**放大比例**

- 定义：在父容器有剩余空间时，**当前子项可以放大的比例**
- 类型：`number`（非负整数）
- 默认值：`0`（不放大）

```css
.flex1 { flex-grow: 1 }
.flex2 { flex-grow: 2 }
```

如果还有 300px 空间，`.flex1` 会拿到 100px，`.flex2` 拿到 200px（按 1:2 分）。

## **`flex-shrink`**：**缩小比例**

- 定义：当容器空间不足时，**当前子项可以缩小的比例**，如果设为 `0`，则**不会被压缩**。
- 类型：`number`（非负整数）
- 默认值：`1`（可缩小）

```css
.flex1 { flex-shrink: 1 }
.flex2 { flex-shrink: 2 }
```

如果总空间不够，`.flex2` 会比 `.flex1` 缩得更多。

## **`flex-basis`**：**初始尺寸**

- 定义：在分配空间之前，子项的**初始主轴尺寸**
- 类型：`length`（如 `100px`、`auto`）
- 默认值：`auto`，表示使用内容本身或 `width`/`height`

```css
.item {
  flex-basis: 200px;
}
```

在 `flex-grow` 或 `flex-shrink` 起作用之前，**浏览器用 `flex-basis` 来决定每个子项的起始尺寸**，这就是「基准尺寸」，后续所有伸缩都是以这个为基础来“加”或“减”的。

### 举个例子

假设容器宽度是 `600px`，里面有两个子项：

```html
<div class="container">
  <div class="item a">A</div>
  <div class="item b">B</div>
</div>

<style>
.container {
  display: flex;
  width: 600px;
}

.item {
  flex-shrink: 0;
  flex-grow: 1;
  flex-basis: 200px;
}
</style>
```

浏览器的处理流程如下：

步骤 1️⃣：确定每个子项的初始宽度

- `flex-basis: 200px`，所以每项初始是 200px
- 总初始宽度 = 200 + 200 = 400px

步骤 2️⃣：计算剩余空间

- 容器宽度是 600px，总初始宽度 400px，剩余 200px

步骤 3️⃣：按 `flex-grow: 1` 比例分配剩余空间

- A 和 B 各得 100px

最终宽度

- A = 200px + 100px = 300px
- B = 200px + 100px = 300px