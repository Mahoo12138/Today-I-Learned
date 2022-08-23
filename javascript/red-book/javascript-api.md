## Atomics与SharedArrayBuffer

多个上下文访问**SharedArrayBuffer**时，如果同时对缓冲区执行操作，就可能出现资源争用问题；

**AtomicsAPI**通过强制同一时刻只能对缓冲区执行一个操作，可以让多个上下文安全地读写一个**SharedArrayBuffer**；

+ 原子操作的本质会排斥操作系统或计算机硬件通常会自动执行的优化；
+ 原子操作也让并发访问内存变得不可能；

---

SharedArrayBuffer与ArrayBuffer具有同样的API：

+ ArrayBuffer必须在不同执行上下文间切换；
+ SharedArrayBuffer则可以被任意多个执行上下文同时使用；

传统JavaScript操作对于并发内存访问导致的资源争用没有提供保护，

在底层，这些方法都会从SharedArrayBuffer中某个位置读取值，Atomics对象上暴露了用于执行线程安全操作的一套静态方法；

在底层，这些方法都会从SharedArrayBuffer中某个位置读取值，然后执行算术或位操作，最后再把计算结果写回相同的位置。

这些操作的原子本质意味着上述读取、修改、写回操作会按照顺序执行，不会被其他线程中断。

浏览器的JavaScript编译器和CPU架构本身都有权限重排指令以提升程序执行效率。

正常情况下，JavaScript的单线程环境是可以随时进行这种优化的。但多线程下的指令重排可能导致资源争用，而且极难排错。

---

AtomicsAPI通过两种主要方式解决了这个问题。

+ **所有原子指令相互之间的顺序永远不会重排**；
+ 使用原子读或原子写保证所有指令（包括原子和非原子指令）**都不会相对原子读/写重新排序**；

这意味着位于原子读/写之前的所有指令会在原子读/写发生前完成，而位于原子读/写之后的所有指令会在原子读/写完成后才会开始；

除了读写缓冲区的值，Atomics.load() 和 Atomics.store() 还可以构建“代码围栏”。JavaScript引擎保证非原子指令可以相对于 load() 或 store() 本地重排，但这个重排不会侵犯原子读/写的边界；

---

为了保证连续、不间断的先读后写，AtomicsAPI 提供了两种方法

+ Atomics.exchange() 执行简单的交换，以保证其他线程不会中断值的交换；
+ compareExchange()方法只在目标索引处的值与预期值匹配时才会执行写操作；

如果没有某种锁机制，多线程程序就无法支持复杂需求，Atomics API 提供了模仿 Linux Futex（ 快速用户空间互斥量， fast user-space mutex）的方法：Atomics.wait()和 Atomics.notify() ；

Atomics API 还提供了 Atomics.isLockFree()方法，在高性能算法中可以用来确定是否有必要获取锁；

## 跨上下文消息

跨文档消息，有时候也简称为 XDM（ cross-document messaging），是一种在不同执行上下文（如不同工作线程或不同源的页面）间传递信息的能力；

XDM 的核心是 postMessage() 方法；

```js
let iframeWindow = document.getElementById("myframe").contentWindow;
iframeWindow.postMessage("A secret", "http://www.wrox.com");
```

如果源匹配，那么消息将会交付到内嵌窗格；否则， postMessage()什么也不做。  

接收到 XDM 消息后， window 对象上会触发 message 事件。  事件对象包括：

+ data：作为第一个参数传递给 postMessage()的字符串数据。
+ origin：发送消息的文档源，例如"http://www.wrox.com"。
+ source：发送消息的文档中 window 对象的代理。  

## EncodingAPI

Encoding API 主要用于实现字符串与定型数组之间的转换。规范新增了 4 个用于执行转换的全局类：TextEncoder、 TextEncoderStream、 TextDecoder 和 TextDecoderStream。  

Encoding API 提供了两种将字符串转换为定型数组二进制格式的方法：**批量编码和流编码** ；

+ 批量指的是 JavaScript 引擎会同步编码整个字符串，通过 TextEncoder 的实例完成的；
+ TextEncoderStream 其实就是 TransformStream 形式的 TextEncoder。将解码后的文本流通过管道输入流编码器会得到编码后文本块的流。

## FileAPI与BlobAPI

FileReader 类型表示一种异步文件读取机制，progress 事件每 50 毫秒就会触发一次；

blob 表示二进制大对象（ binary larget object），是 JavaScript 对不可修改二进制数据的封装类型。  

Blob 对象有一个 size 属性和一个 type 属性，还有一个 slice()方法用于进一步切分数据。  

要创建对象 URL，可以使用 window.URL.createObjectURL()方法并传入 File 或 Blob 对象。

拖放文件会触发 drop 事件。被放置的文件可以通过事件的 event.dataTransfer.files 属性读到 ；

## 媒体元素

HTML5 新增了两个与媒体相关的元素，即`<audio>`和`<video>`，从而为浏览器提
供了嵌入音频和视频的统一解决方案；

使用`<audio>`和`<video>`的 `play()` 和 `pause()`方法，可以手动控制媒体文件的播放；

这两个媒体元素都有一个名为 canPlayType()的方法，该方法接收一个格式/编解码器字符串，返回一个字符串值： "probably"、 "maybe"或""（空字符串）；

`<audio>`元素还有一个名为 Audio 的原生 JavaScript 构造函数，创建 Audio 的新实例就会开始下载指定的文件。下载完毕后，可以调用 play() 来播放音频。  

## 原生拖放

HTML5 在 IE 的拖放实现基础上标准化了拖放功能。所有主流浏览器都根据 HTML5 规范实现了原生的拖放。

在某个元素被拖动时，会（按顺序）触发以下事件：dragstart，drag，dragend；

拖动开始后，大多数浏览器此时会创建元素的一个半透明副本，始终跟随在光标下方。  

在把某个元素拖动到无效放置目标上时，会看到一个特殊光标（圆环中间一条斜杠）表示不能放下。  

通过覆盖 dragenter 和 dragover 事件的默认行为，可以把任何元素转换为有效的放置目标；

在 Firefox 中，放置事件的默认行为是导航到放在放置目标上的 URL。  

event 的属性中的 dataTransfer 对象，用于从被拖动元素向放置目标传递字符串数据：

+ dataTransfer 对象有两个主要方法： getData()和 setData()；
+ HTML5 已经将其扩展为允许任何 MIME 类型；

在从文本框拖动文本时，浏览器会调用 setData()并将拖动的文本以"text"格式存储起来。  在拖动链接或图片时，浏览器会调用 setData()并把 URL 存储起来；

dataTransfer 对象不仅可以用于实现简单的数据传输，还可以用于确定能够对被拖动元素和放置目标执行什么操作。  

可以使用两个属性： dropEffect 与 effectAllowed：

+ dropEffect 属性可以告诉浏览器允许哪种放置行为，除非同时设置 effectAllowed，否则 dropEffect 属性也没有用  ；
+ effectAllowed 属性表示对被拖动元素是否允许 dropEffect，必须在 ondragstart 事件处理程序中设置这个属性；

默认情况下，图片、链接和文本是可拖动的，这意味着无须额外代码用户便可以拖动它们；

HTML5 在所有 HTML 元素上规定了一个 draggable 属性，表示元素是否可以拖动；

## NotificationAPI

Notifications API 用于向用户显示通知。  

Notifications API 在 Service Worker 中非常有用。渐进 Web 应用（ PWA， Progressive Web Application）通过触发通知可以在页面不活跃时向用户显示消息，看起来就像原生应用。 

 默认会开启两项安全措施：

+ 通知只能在运行在安全上下文的代码中被触发；
+ 通知必须按照每个源的原则明确得到用户允许。  

一旦拒绝，就无法通过编程方式挽回，因为不可能再触发授权提示；

Notifications API 提供了 4 个用于添加回调的生命周期方法：
+ onshow 在通知显示时触发；
+ onclick 在通知被点击时触发；
+ onclose 在通知消失或通过 close()关闭时触发；
+ onerror 在发生错误阻止通知显示时触发。  

## PageVisibilityAPI

Web 开发中一个常见的问题是开发者不知道用户什么时候真正在使用页面。  Page Visibility API 旨在为开发者提供页面对用户是否可见的信息。  

document.visibilityState 值，表示下面 4 种状态之一。
+ 页面在后台标签页或浏览器中最小化了；
+ 页面在前台标签页中；
+ 实际页面隐藏了，但对页面的预览是可见的（例如在 Windows 7 上，用户鼠标移到任务栏图标上会显示网页预览）；
+ 页面在屏外预渲染；

visibilitychange 事件，该事件会在文档从隐藏变可见（或反之）时触发；

document.hidden 布尔值，表示页面是否隐藏  

## StreamAPI

Web 应用如何消费有序的小信息块而不是大块信息？  

+ 大块数据可能不会一次性都可用；
+ 大块数据可能需要分小部分处理；

Stream API 直接解决的问题是处理网络请求和读写磁盘。  

+ 可读流：数据在内部从底层源进入流，然后由**消费者（ consumer）**进行处理；
+ 可写流： **生产者（ producer）**将数据写入流，数据在内部传入底层**数据槽（sink）**。
+ 转换流：由两种流组成，可写流用于接收数据（可写端），可读流用于输出数据（可读端）。这
  两个流之间是**转换程序（ transformer）**，可以根据需要检查和修改流内容；

所有流都会为已进入流但尚未离开流的块提供一个内部队列；

+ 流不能允许其内部队列无限增大，因此会使用**反压（ backpressure）**通知流入口停止发送数据；
+ 这个策略定义了内部队列可以占用的最大内存，即**高水位线（ high water mark）；**  

一个 `ReadableStreamDefaultReader` 的实例，可以通过流的 getReader()方法获取。调用这个方法会获得
流的锁，保证只有这个读取器可以从流中读取值：  

数据写入流，可以通过流的 `getWriter()`方法获取 `WritableStreamDefaultWriter` 的实例。

+ 在向流中写入数据前，生产者必须确保写入器可以接收值；

转换流用于组合可读流和可写流 ，数据块在两个流之间的转换是通过 `TransformStream` 的实例的 `transform()` 方法完成的；

流可以通过管道连接成一串。最常见的用例是使用 `pipeThrough()`方法把 `ReadableStream` 接入 TransformStream。  

## 计时API

+ `window.performance.now()` 这个方法返回一个微秒精度的浮点值，采用相对度量，即在执行上下文创建时从 0 开始计时；
  + 不同上下文之间如果没有共享参照点则不可能直接比较；
  + performance.timeOrigin 属性返回计时器初始化时全局系统时钟的值；
+ 在一个执行上下文中被记录的所有性能条目可以通过 `performance.getEntries()` 获取  
  + 返回的集合代表浏览器的**性能时间线**（ performance timeline）  
+ User Timing API 用于记录和分析自定义性能条目；
  + 即使用 `performance.mark()` 方法，  在计算开始前和结束后各创建一个自定义性能条目可以计算时间差。
  + 最新的标记（ mark）会被推到 `getEntriesByType()`返回数组；
  + 由 `performance.measure()` 方法生成   **PerformanceMeasure**（性能度量）条目，对应由名字作为标识的两个标记之间的持续时间； 
+ Navigation Timing API 提供了高精度时间戳，用于度量当前页面加载速度：
  + 浏览器会在导航事件发生时自动记录 PerformanceNavigationTiming 条目；
  + `const [performanceNavigationTimingEntry] = performance.getEntriesByType('navigation');  `
+ Resource Timing API 提供了高精度时间戳，用于度量当前页面加载时请求资源的速度：
  + 浏览器会在加载资源时自动记录 PerformanceResourceTiming；
  + 这个对象会捕获大量时间戳，用于描述资源加载的速度；

## Web组件

Web 组件指的是一套用于增强 DOM 行为的工具，包括影子 DOM、自定义
元素和 HTML 模板。

一直缺少基于 HTML 解析构建 DOM 子树，然后在需要时再把这个子树渲染出
来的机制：

+ 使用 innerHTML 把标记字符串转换为 DOM 元素；
+ 使用 `document.createElement()`构建每个元素；

使用 `DocumentFragment` 可以一次性添加所有子节点，最多只会有一次布局重排；

```js
const fragment = new DocumentFragment();
fragment.appendChild(document.createElement('p'));
```

脚本执行可以推迟到将 DocumentFragment 的内容实际添加到 DOM 树；

---

**影子 DOM**（ shadow DOM） Web 组件可以将一个完整的 DOM 树作为
节点添加到父 DOM 树；

影子 DOM 与 HTML 模板很相似，因为它们都是类似 document 的结构，影子 DOM 的内容会实际渲染到页面上，而 HTML 模板的内容不会；

+ 把 CSS 限制在使用它们的 DOM 上：这正是影子 DOM 最初的使用场景；

影子 DOM 是通过 attachShadow()方法创建并添加给有效 HTML 元素的。

+ 容纳影子 DOM 的元素被称为影子宿主（ shadow host）；

+ 影子 DOM 的根节点被称为影子根（ shadow root）；

## WebCryptographyAPI

Web Cryptography API 描述了一套密码学工具，规范了 JavaScript 如何以安全和符合惯例的方式实现加密；

+ `crypto.getRandomValues()` 在全局 Crypto 对象上访问，把随机值写入作为参数传给它的定型数组 ；
+ 通过 `window.crypto.subtle` 访问 SubtleCrypto 对象，用于执行常见的密码学功能，如加密、散列、签名和生成密钥；
+ 使用 `SubtleCrypto.generateKey()`方法可以生成随机 CryptoKey；
+ 如果密钥是可提取的，那么就可以在 CryptoKey 对象内部暴露密钥原始的二进制内容；
+ 使用 SubtleCrypto 对象可以通过可配置的属性从已有密钥获得新密钥；
+ 通过 SubtleCrypto 对象可以使用公钥算法用私钥生成签名，或者用公钥验证签名；
+ SubtleCrypto 对象支持使用公钥和对称算法加密和解密消息；
