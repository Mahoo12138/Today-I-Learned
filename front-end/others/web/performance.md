# 浅谈前端性能指标

## Web Vitals 核心指标

Google 推出了 Web Vitals， 定义了指标集，旨在简化和统一衡量网站质量的指标。在 Web Vitals 指标中，Core Web Vitals 是其中最核心的部分，包含三个指标：

### LCP

LCP（Largest Contentful Paint）是根据页面开始加载的时间报告，可视区域内最大的内容元素（例如图片或文本块）完成渲染的计算时间，用于测验加载性能，衡量网站初次载入速度。 我们应该控制该值在**2.5 秒**以内

最大其实就是指元素的尺寸大小，这个大小不包括可视区域之外或者是被裁剪的不可见的溢出。也不包括元素的 Margin / Padding / Border 等。

计算包括在内的元素有：

- img 标签元素；
- 内嵌在`<svg>`元素内的`<image>`元素；
- `video` 标签元素的封面元素；
- 通过 `url()` 函数加载的带有背景图像的元素；
- 包含文字节点的块级元素 或 行内元素；

一般网页是分批加载的，因此所谓最大元素也是随着时间变化的，浏览器在在绘制第一帧时分发一个`largest-contentful-paint`类型`PerformanceEntry`对象，随着时间的渲染，当有更大的元素渲染完成时，就会有另一个`PerformanceEntry`对象报告。

利用 `PerformanceObserver` 构造函数创建一个**性能检测对象**，可以通过以下代码打印采集数据：

```javascript
let observer = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log("LCP candidate:", entry.startTime, entry);
  }
});
observer.observe({ type: "largest-contentful-paint", buffered: true });

// PerformanceObserver 接受一个回调函数作为参数
// 回调函数会在每次性能条目（PerformanceEntry）被捕获时被调用

// 回调函数中使用了一个 for 循环来遍历传入的性能条目列表（entryList.getEntries()）。
// 在循环中，每个性能条目都会被打印到控制台上，包括了 LCP 候选项的开始时间和完整条目对象。

// observer.observe() 方法，将观察者绑定到了 largest-contentful-paint 类型的性能条目上
// 并设置 buffered: true 以确保可以获取到已经发生的 LCP 事件，而不仅仅是后续发生的事件
```

一般来说，通过上面的代码，最新的`largest-contentful-paint`条目的`startTime`就是 LCP 值。

### FID

FID（First Input Delay）首次输入延迟时间，主要为了测量页面加载期间响应度，测量*交互性*。为了提供良好的用户体验，页面的 FID 应为**100 毫秒**或更短。

测量用户第一次与页面交互（单击链接、点按按钮等等）到浏览器对交互作出响应，并实际能够开始处理事件处理程序所经过的时间。FID 只关注不连续操作对应的输入事件，例如点击，轻触，按键等。一般只考虑测量首次输入的延迟。FID 只考虑事件处理过程的延迟，不考虑事件处理花费的时间或者事件处理完成更新页面花费的时间。

和上面类似，创建 PerformanceObserver 对象监听 first-input 类型的条目，并获取条目的`startTime`和`processingStart`时间戳的差值作为结果

```js
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    const delay = entry.processingStart - entry.startTime;
    console.log("FID candidate:", delay, entry);
  }
}).observe({ type: "first-input", buffered: true });
```

### CLS

CLS（Cumulative Layout Shift）累积布局偏移，测量*视觉稳定性*。为了提供良好的用户体验，页面的 CLS 应保持在 **0.1** 或更少。

CLS 是测量整个页面生命周期内发生的所有意外布局偏移中最大一连串的*布局偏移分数*。

每当一个可见元素从一个已渲染帧变更到另一个已渲染帧时，就是发生了布局偏移。

所谓一连串布局偏移，是指一个或者多个的布局偏移，这些偏移相隔少于 1 秒，总持续时间最大为 5 秒。

而最大一连串就是所有的一连串布局偏移中偏移累计分数最大的一连串。

具体这个分数是怎么算的呢，首先偏移前后的两个已渲染帧的总的叠加大小（只算可视区域内，重合部分只算一次），占可视区域的百分比，称为影响分数，例如有个元素一开始占可视区域的 50%，然后下一帧往下偏移可视区域的 25%，那么这个元素的影响分数就是 0.75。然后取不稳定元素在一帧中的最大偏移距离（水平或垂直取最大）占对应可视区域（取水平对应宽度，垂直对应高度）的比例，称为距离分数，例如刚刚的例子，距离分数就是 0.25。

距离分数和影响分数相乘就是偏移分数（例如上面例子相乘就是 0.75 \* 0.25 = 0.1875）。

常见的影响 CLS 分数的有：

- 没有指定具体尺寸的图片或视频
- 自定义字体引发的实际呈现出更大或更小的字体
- 动态插入的内容，例如广告等

值得一提的是，布局偏移并不都是不好的，更改元素的起始位置是网页应用用常见的事。布局偏移只有在用户不期望其发生的才是不好的。比如用户自己发起的布局偏移就是没有问题，这些 CLS 不计算在内，CLS 计算的是意外的布局偏移。在用户交互 500 毫秒内发生的布局偏移会带有**hadRecentInput**标志，CLS 计算会把这些偏移在计算中排除。

js 测量 CLS 的原理是，创建一个`PerformanceObserver`对象来侦听意外偏移`layout-shift`条目：

```js
let clsValue = 0;
let clsEntries = [];

let sessionValue = 0;
let sessionEntries = [];

new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    // 只将不带有最近用户输入标志的布局偏移计算在内。
    if (!entry.hadRecentInput) {
      const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

      // 如果条目与上一条目的相隔时间小于 1 秒且
      // 与会话中第一个条目的相隔时间小于 5 秒，那么将条目
      // 包含在当前会话中。否则，开始一个新会话。
      if (
        sessionValue &&
        entry.startTime - lastSessionEntry.startTime < 1000 &&
        entry.startTime - firstSessionEntry.startTime < 5000
      ) {
        sessionValue += entry.value;
        sessionEntries.push(entry);
      } else {
        sessionValue = entry.value;
        sessionEntries = [entry];
      }

      // 如果当前会话值大于当前 CLS 值，
      // 那么更新 CLS 及其相关条目。
      if (sessionValue > clsValue) {
        clsValue = sessionValue;
        clsEntries = sessionEntries;

        // 将更新值（及其条目）记录在控制台中。
        console.log("CLS:", clsValue, clsEntries);
      }
    }
  }
}).observe({ type: "layout-shift", buffered: true });
```

### web-vitals 库

上面介绍了三个核心指标简单的 js 测量代码，但是现实情况往往要复杂许多，例如要考虑页面通过往返缓存恢复时，API 不会报告指标相关的条目，而且 API 不考虑 iframe 的元素的问题等等。

在特殊复杂的页面中，单纯用这种检查方式，结果往往不准。

所以我们可以使用一些第三库，它已经帮我们把复杂的处理做了，例如使用官方的 web-vitals 库

```bash
$ npm install web-vitals
```

具体使用：

```javascript
import { getLCP, getFID, getCLS } from "web-vitals";

getCLS((metric) => console.log("cls: " + metric.value));
getFID((metric) => console.log("fid: " + metric.value));
getLCP((metric) => console.log("lcp: " + metric.value));
```

## 前端性能监控 API——Performance

先简单了解下这个 API，直接打印这个对象看下

```js
console.log(window.performance);
```

这些属性有些是还处于实验性阶段，有些平时比较少用到，常用的有例如

### memory

主要是和内存相关，显示此刻的内存占用情况，图中可以发现其有三个属性

- `jsHeapSizeLimit`：上下文内可用堆的最大体积
- `totalJSHeapSize`：当前 js 堆栈总内存大小
- `usedJSHeapSize`：当前被使用的内存大小，不能大于`totalJSHeapSize`，大于就可能有内存泄漏。

### navigation

表示出现在当前浏览上下文的 navigation 类型，图中可以发现其有两个属性

- `redirectCount`：重定向的次数，表示当前页重定向了几次
- `type`：表示页面打开类型，可选值有 0、1、2、255
  - 0：通过常规的导航访问页面，例如点击链接
  - 1：通过刷新（包括用 js 调用的刷新）访问页面
  - 2：通过前进或者后退按钮访问页面
  - 255：除了以上的方式访问页面

### timing

因为我们本次讲的是性能，所以其实我们重点要看的就是 timing。

它统计了从浏览器从网址开始导航到 `window.onload`事件触发的一系列关键的时间点，具体看下图

![timing](D:\Workbench\每日学习\others_resources\timing.webp)

- `navigationStart`：表示在同一浏览上下文中上一个文档终止时的时间戳。如果没有以前的文档，这个值将与`fetchStart`相同；

* `unloadEventStart`：表示窗口中的前一个网页（与当前页面同域）unload 的时间戳。如果没有前一个网页，或者前一个网页和当前页面不是同域，则返回值为 0；
* `unloadEventEnd`：表示当 unload 事件结束时的时间戳。 果没有前一个网页，或者前一个网页和当前页面不是同域，则返回值为 0；
* `redirectStart`：表示当第一个 HTTP 重定向开始时的时间戳。如果没有重定向，或者其中一个重定向不是同域，则返回值为 0。
* `redirectEnd`：表示当最后一个 HTTP 重定向完成时，即接收到 HTTP 响应的最后一个字节时的时间戳。如果没有重定向，或者其中一个重定向不是同域，则返回值为 0。
* `fetchStart`：表示当浏览器准备好使用 HTTP 请求获取文档时的时间戳。这个时刻是发生在检查任何应用程序缓存之前。
* `domainLookupStart`：表示当 DNS 域名查询开始时的时间戳。如果使用了持久连接，或者信息存储在缓存或本地资源中（即无 DNS 查询），则该值将与 fetchStart 相同。
* `domainLookupEnd`：表示当 DNS 域名查询完成时的时间戳。如果使用了持久连接，或者信息存储在缓存或本地资源中（即无 DNS 查询），则该值将与 fetchStart 相同。
* `connectStart`：表示 HTTP TCP 开始建立连接的时间戳。如果传输层报告了一个错误，并且重新开始建立连接，则给出最后一次建立连接的开始时间戳。如果使用持久连接，则该值与 fetchStart 相同。
* `connectEnd`：表示 HTTP TCP 完成建立连接（完成握手）的时间戳。如果传输层报告了一个错误，并且重新开始建立连接，则给出最后建立连接的结束时间。如果使用持久连接，则该值与 fetchStart 相同。当所有安全连接握手或 SOCKS 身份验证都被终止时，该连接被视为已打开。
* `secureConnectionStart`：表示当安全连接握手（HTTPS 连接）开始时的时间戳。如果没有安全连接，则返回 0。
* `requestStart`：表示浏览器发送请求从服务器或本地缓存中获取实际文档的时间戳。如果传输层在请求开始后失败，并且连接重新打开，则此属性将被设置为与新请求对应的时间。
* `responseStart`：表示当浏览器从服务器的缓存或本地资源接收到响应的第一个字节时的时间戳。
* `responseEnd`：表示当浏览器从服务器、缓存或本地资源接收到响应的最后一个字节时或者当连接被关闭时(如果这是首先发生的)的时间戳。
* `domLoading`：表示当解析器开始工作，也就是开始渲染 dom 树的时间戳。这时 document.readyState 变为'loading'，相应的 readystatechange 事件被抛出。
* `domInteractive`：表示解析器完成解析 dom 树的时间戳，这时 document.readyState 变为'interactive'，相应的 readystatechange 事件被抛出。这时候只是解析完成 DOM 树，还没开始加载网页内的资源。
* `domContentLoadedEventStart`：表示 DOM 解析完成后，网页内的资源开始加载的时间戳。就在解析器发送 DOMContentLoaded 事件之前。
* `domContentLoadedEventEnd`：表示 DOM 解析完成后，网页内的资源加载完成的时间戳。即在所有需要尽快执行的脚本(按顺序或不按顺序)被执行之后。
* `domComplete`：表示当解析器完成它在主文档上的工作时，也就是 DOM 解析完成，且资源也准备就绪的时间。document.readyState 变为'complete'，相应的 readystatechange 事件被抛出。
* `loadEventStart`：表示当为当前文档发送 load 事件时，也就是 load 回调函数开始执行的时间。如果这个事件还没有被发送，它将返回 0。
* `loadEventEnd`：表示当 load 事件的回调函数执行完毕的时间，即加载事件完成时。如果这个事件还没有被发送，或者还没有完成，它将返回 0。

借助这个 performance.timing 里面的各个时间戳，我们可以获取到

- DNS 解析耗时 : performance.timing.domainLookupEnd - performance.timing.domainLookupStart
- TCP 连接耗时 : performance.timing.connectEnd - performance.timing.connectStart
- SSL 连接耗时 : performance.timing.connectEnd - performance.timing.secureConnectionStart
- request 耗时 : performance.timing.responseEnd - performance.timing.responseStart
- 解析 DOM 树耗时 : performance.timing.domComplete - performance.timing.domInteractive
- domready 时间 : performance.timing.domContentLoadedEventEnd - performance.timing.fetchStart
- onload 时间 : performance.timing.loadEventEnd - performance.timing.fetchStart

### performance 方法

- `performance.getEntries()` ： 以对象数组的方式返回所有资源的数据，包括 css，img，script，xmlhttprequest，link 等等。这个数组就是性能缓存区存储的数据。

  例如我们看图中展开的一条 script 数据，其 duration 属性代表该资源的所需的总时间，和 NetWork Tab 中 对应资源的 Timing 时间差不多。

- `performance.getEntriesByType(type:string)` : 和上面的 getEntries 方法类似，不过是多了一层类型的筛选。

- `performance.getEntriesByName(name: string, type?:string)` : 同上，多了一层名字的筛选，也可以传第二个参数再加一层类型的筛选。

- `performance.now()` ： 返回当前时间与`performance.timing.navigationStart`的时间差。

  通过打印 `performance.now() + performance.timing.navigationStart` 和 `Date.now()` 的值可以发现前者的数据会更精准一些：

  ```js
  console.log(
    performance.now() + performance.timing.navigationStart,
    Date.now()
  );
  // 1706705883056.4 1706705879695
  ```

## 其他重要指标

除了以上的 Web Vitals 核心关键指标之外，还有其他的一些重要指标，例如

- TTFB（Time to First Byte）
- FCP（First Contentful Paint）
- FP（First Paint）
- SI（Speed Index）
- TTI（Time to Interactive）
- TBT（Total Blocking Time）

接下来我们逐步分析下这几个指标：

### TTFB

首包时间，资源请求到获取第一个字节之间的时间，包括以下阶段的总和

- 重定向时间
- Service Worker 启动时间（如果适用）
- DNS 查询
- 连接和 TLS 协商
- 请求，直到响应的第一个字节到达

计算方式为

```javascript
console.log(
  "TTFB：" +
    (performance.timing.responseStart - performance.timing.navigationStart)
);
```

也可以用 `PerformanceObserver` 采集

```typescript
new PerformanceObserver((entryList) => {
  const [pageNav] = entryList.getEntriesByType("navigation");
  console.log(`TTFB: ${pageNav.responseStart}`);
}).observe({
  type: "navigation",
  buffered: true,
});
```

或者用 web-vitals 库

```typescript
import { getTTFB } from "web-vitals";

// 当 TTFB 可用时立即进行测量和记录。
getTTFB(console.log);
```

### FCP

首屏时间，首次内容绘制的时间，指页面从开始加载到页面内容的**任何部分**在屏幕上完成渲染的时间。

计算方式

```typescript
console.log(
  "FCP：" + performance.getEntriesByName("first-contentful-paint")[0].startTime
);
```

上面代码可能不好确定调用时机，可以采用 `PerformanceObserver` 来监听采集

```typescript
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntriesByName("first-contentful-paint")) {
    console.log("FCP candidate:", entry.startTime, entry);
  }
}).observe({ type: "paint", buffered: true });
```

或者用 web-vitals 库

```javascript
import { getFCP } from "web-vitals";

// 当 FCP 可用时立即进行测量和记录。
getFCP(console.log);
```

### FP

白屏时间，首次渲染的时间点。FP 和 FCP 有点像，但 FP 一定先于 FCP 发生，例如一个页面加载时，第一个 DOM 还没绘制完成，但是可能这时页面的背景颜色已经出来了，这时 FP 指标就被记录下来了。而 FCP 会在页面绘制完第一个 DOM 内容后记录。

计算方式

```typescript
console.log("FP：" + performance.getEntriesByName("first-paint")[0].startTime);
```

上面代码可能不好确定调用时机，可以采用 `PerformanceObserver` 来监听采集

```typescript
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntriesByName("first-paint")) {
    console.log("FP:", entry.startTime, entry);
  }
}).observe({ type: "paint", buffered: true });
```

### SI

速度指数衡量页面加载期间内容的视觉显示速度，也就是页面填充快慢的指标。

良好的 SI 应该控制在**3.4**以内。

### TTI

可交互时间，指标测量页面从开始加载到主要子资源完成渲染，并能够快速、可靠地响应用户输入所需的时间。

良好的 TTI 应该控制在**5**秒以内。

### TBT

总阻塞时间，也就是从 FCP 到 TTI 之间的时间。

## 性能测试工具

像上面提到 SI、TTI、TBT 指标想通过代码来测量是比较困难的，测量出来也是不准的。

所以我们一般需要借助一些性能测试工具。

### Lighthouse

Lighthouse 是谷歌官方开发的性能分析工具，目前已经嵌入到 chrome 开发者工具的选项卡中，不需要额外安装，可以直接使用。

切换到 Lighthouse Tab ，点击 Generate report 可以直接生成报告，其中包含 FCP、TTI、SI、TBT、LCP、CLS 六个指标数据，但是无法测试 FID。

还有总的性能评分，以及 SEO 的分数和一些其他的优化建议等等，总的来说报告数据算是很齐全的。

### PageSpeed Insights 性能测试网站

[PageSpeed Insights]([PageSpeed Insights (web.dev)](https://pagespeed.web.dev/?utm_source=psi&utm_medium=redirect))

这是一个输入网址就可以测试性能的网站，基本该有的指标数据都有，包括 Lighthouse 暂不支持的 FID。

可以选择全球各地进行性能测试，同样提供详细的检查结果报告，包括清晰的瀑布图数据，以及相关的优化建议。

有个问题就是这个网站测试要排队，往往要等一会才出结果。
