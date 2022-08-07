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



## 媒体元素



## 原生拖放



## NotificationAPI





## PageVisibilityAPI





## StreamAPI



## 计时API



## Web组件



## WebCryptographyAPI



