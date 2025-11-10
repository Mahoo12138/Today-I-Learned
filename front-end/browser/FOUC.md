## 一、什么是 FOUC？

**FOUC (Flash of Unstyled Content)** 直译为"无样式内容闪烁"，是指网页在加载过程中，内容先以**无样式或错误样式**的状态短暂显示，随后**突然跳变**为正确样式的现象。

### 用户体验表现

- 页面先显示纯文本、错乱布局
- 短暂停顿后（通常几十到几百毫秒）
- 页面"闪一下"突然变成设计好的样式
- 可能伴随布局跳动、颜色突变、字体切换等

---

## 二、FOUC 产生的根本原因

### 1. 浏览器渲染机制

浏览器采用**渐进式渲染**策略：

```
HTML 解析 → DOM 构建 → CSSOM 构建 → 渲染树生成 → 布局 → 绘制
```

关键特性：

- **不会等待所有资源加载完才渲染**
- DOM 构建和 CSSOM 构建是**独立异步**进行的
- 一旦有可用样式就立即渲染，不等待所有 CSS

### 2. 渲染阻塞与非阻塞

**CSS 是渲染阻塞资源**：

```html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
```

- `<head>` 中的 CSS 会阻塞后续内容的渲染
- 但如果 CSS 加载延迟，浏览器可能先渲染部分内容

**JavaScript 的影响**：

```html
<head>
  <script src="app.js"></script> <!-- 阻塞 HTML 解析 -->
  <link rel="stylesheet" href="styles.css">
</head>
```

- `<script>` 会阻塞 HTML 解析
- 如果 JS 在 CSS 之前，可能导致样式应用延迟

---

## 三、常见 FOUC 场景

### 场景 1：`@import` 导致的 FOUC

```css
/* main.css */
@import url('reset.css');
@import url('fonts.css');

body { background: white; }
```

**问题**：

- `@import` 是串行加载，每个文件到达都触发重新渲染
- 浏览器可能先应用 `main.css` 的 `body` 样式
- 然后 `reset.css` 到达 → 重新渲染
- 再 `fonts.css` 到达 → 再次渲染

**表现**：页面经历多次样式闪烁

---

### 场景 2：外部 CSS 加载延迟

```html
<!DOCTYPE html>
<html>
<head>
  <title>Page</title>
  <link rel="stylesheet" href="https://slow-cdn.com/styles.css">
</head>
<body>
  <h1>Hello World</h1>
  <p>This is content...</p>
</body>
</html>
```

**问题**：

- 如果 `styles.css` 加载缓慢（网络慢、CDN 故障）
- 浏览器可能先显示无样式的 HTML
- CSS 到达后突然应用样式

---

### 场景 3：动态加载 CSS

```javascript
// JavaScript 动态插入样式表
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'dynamic.css';
document.head.appendChild(link);
```

**问题**：

- 页面先以现有样式渲染
- 动态 CSS 加载完成后样式突变

---

### 场景 4：Web 字体加载

```css
@font-face {
  font-family: 'CustomFont';
  src: url('custom.woff2');
}

body {
  font-family: 'CustomFont', sans-serif;
}
```

**问题**（FOIT/FOUT）：

- **FOIT (Flash of Invisible Text)**：字体加载期间文本不可见
- **FOUT (Flash of Unstyled Text)**：先显示系统字体，加载完切换到自定义字体
- 视觉上表现为字体突然变化

---

### 场景 5：CSS 在 `<body>` 中

```html
<body>
  <h1>Title</h1>
  <p>Content...</p>
  
  <link rel="stylesheet" href="late-styles.css">
  
  <footer>Footer</footer>
</body>
```

**问题**：

- 页面顶部内容先以默认样式渲染
- 遇到 `<link>` 时加载并应用样式
- 导致已渲染内容突然变化

---

### 场景 6：IE 浏览器特有问题

早期 IE（特别是 IE6-8）存在严重的 FOUC 问题：

```html
<style>
  @import url('styles.css');
</style>
```

在 IE 中，`<style>` 标签内的 `@import` 不会阻塞渲染，导致严重闪烁。

---

## 四、FOUC 的技术细节

### 1. 关键渲染路径

```
HTML 下载 → HTML 解析 → DOM 构建
                ↓
CSS 下载 → CSS 解析 → CSSOM 构建
                ↓
          渲染树构建 → 布局计算 → 绘制 → 显示
```

**FOUC 发生时机**：

- DOM 构建完成但 CSSOM 未完成 → 使用默认样式渲染
- CSSOM 后续完成 → 重新计算渲染树 → 重绘

### 2. 浏览器的优化策略

现代浏览器尝试减少 FOUC：

- **推测解析**：预扫描 HTML 提前发现 CSS/JS 资源
- **渲染延迟**：在 `<head>` 中的 CSS 未加载前延迟渲染
- **字体显示策略**：`font-display` 属性控制字体加载行为

### 3. Reflow 和 Repaint

FOUC 本质是触发了多次 Reflow/Repaint：

- **Reflow（重排）**：重新计算元素几何属性（布局跳动）
- **Repaint（重绘）**：重新绘制元素外观（颜色闪烁）

每次新 CSS 到达都可能触发一次 Reflow + Repaint。

---

## 五、如何检测 FOUC？

### 1. 肉眼观察

- 刷新页面多次，注意首屏加载瞬间
- 使用浏览器开发者工具的**网络限速**模拟慢速网络
### 2. 开发者工具

**Chrome DevTools**：

```
1. F12 → Network 标签
2. 设置限速（Slow 3G）
3. 勾选 "Disable cache"
4. Performance 标签录制页面加载
5. 查看 "Screenshots" 捕捉每一帧画面
````
### 3. 自动化测试

```javascript
// Puppeteer 示例
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 截取首次渲染
  await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'render1.png' });
  
  // 截取完全加载
  await page.goto('https://example.com', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'render2.png' });
  
  // 对比两张图片差异
  await browser.close();
})();
```

---

## 六、完整的解决方案

### 1. CSS 放在 `<head>` 中

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Page</title>
  
  <!-- 所有 CSS 都在 head 中 -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

**原理**：`<head>` 中的 CSS 会阻塞渲染，确保样式先加载。

---

### 2. 避免使用 `@import`


```css
/* 不推荐 */
@import url('reset.css');
@import url('layout.css');

/* 推荐：使用多个 <link> 标签 */
```

```html
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="layout.css">
```

**原理**：`<link>` 可以并行下载，`@import` 是串行。

---
### 3. 内联关键 CSS（Critical CSS）

```html
<head>
  <style>
    /* 首屏关键样式内联 */
    body {
      margin: 0;
      font-family: -apple-system, sans-serif;
    }
    .header {
      height: 60px;
      background: #333;
    }
    /* ... 其他首屏必需样式 ... */
  </style>
  
  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="full.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="full.css"></noscript>
</head>
```

**工具**：

- [Critical](https://github.com/addyosmani/critical)
- [Penthouse](https://github.com/pocketjoso/penthouse)

---

### 4. 资源预加载

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```

---

### 5. 优化字体加载

```css
@font-face {
  font-family: 'CustomFont';
  src: url('custom.woff2') format('woff2');
  font-display: swap; /* 关键！*/
}
```

**`font-display` 选项**：

- `auto`：浏览器默认行为
- `block`：短暂阻塞期，然后永久交换（可能 FOIT）
- `swap`：立即使用备用字体，加载完交换（轻微 FOUT，但无空白）
- `fallback`：极短阻塞，短暂交换期，超时则不交换
- `optional`：极短阻塞，根据连接速度决定是否使用

**推荐**：大多数情况使用 `font-display: swap`

---

### 6. JavaScript 放在底部或使用 defer/async

```html
<head>
  <link rel="stylesheet" href="styles.css">
  <!-- defer：异步下载，HTML 解析完后执行 -->
  <script src="app.js" defer></script>
</head>
```

或

```html
<body>
  <!-- 内容 -->
  
  <!-- 底部引入 -->
  <script src="app.js"></script>
</body>
```

---
### 7. 使用 CSS-in-JS（现代框架）

```javascript
// React 示例
import styled from 'styled-components';

const Button = styled.button`
  background: blue;
  color: white;
`;

// 样式和组件同时加载，不会闪烁
```

---

### 8. HTTP/2 或 HTTP/3

利用多路复用特性，并行加载多个 CSS 文件而无队头阻塞。

---
### 9. 服务端渲染（SSR）

```javascript
// Next.js 示例
export async function getServerSideProps() {
  return { props: { data: '...' } };
}

// 服务端已经应用了样式，客户端无需等待 CSS 加载
```

---
### 10. 构建优化

```javascript
// Webpack 配置
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
```

合并 CSS 文件，减少请求次数。

---
## 七、不同场景的最佳实践

### 静态网站

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Static Site</title>
  
  <!-- 内联关键 CSS -->
  <style>
    /* 首屏样式 */
  </style>
  
  <!-- 预加载字体 -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- 主样式表 -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 内容 -->
  <script src="app.js" defer></script>
</body>
</html>
```

---
### React/Vue 单页应用

```javascript
// 1. 代码分割
const LazyComponent = React.lazy(() => import('./Component'));

// 2. CSS Modules 或 CSS-in-JS
import styles from './App.module.css';

// 3. 服务端渲染
// Next.js, Nuxt.js 等框架自动处理
```

---
### WordPress 等 CMS

```php
// functions.php
function optimize_css_loading() {
    // 移除阻塞 CSS
    wp_dequeue_style('wp-block-library');
    
    // 内联关键 CSS
    add_action('wp_head', function() {
        echo '<style>' . file_get_contents('critical.css') . '</style>';
    }, 1);
}
add_action('wp_enqueue_scripts', 'optimize_css_loading', 100);
```

---
## 八、性能指标与监控

### 关键指标

- **FCP (First Contentful Paint)**：首次内容绘制
- **LCP (Largest Contentful Paint)**：最大内容绘制
- **CLS (Cumulative Layout Shift)**：累积布局偏移

FOUC 会严重影响这些指标，尤其是 CLS。
### 监控工具

```javascript
// Web Vitals 监控
import {getCLS, getFCP, getLCP} from 'web-vitals';

getCLS(console.log);
getFCP(console.log);
getLCP(console.log);
```

---
## 九、总结

### FOUC 的本质

样式加载与渲染时序不匹配，导致的**视觉体验问题**。

### 核心解决思路

1. **确保关键 CSS 尽早加载**（内联或预加载）
2. **避免串行加载**（不用 `@import`）
3. **优化资源加载顺序**（CSS 在 head，JS 在底部或 defer）
4. **使用现代技术**（HTTP/2、SSR、CSS-in-JS）

### 权衡取舍

- 内联 CSS 增加 HTML 体积，但减少请求
- 异步加载 CSS 可能引入轻微闪烁，但提升首屏速度
- 需根据具体场景选择最合适的策略