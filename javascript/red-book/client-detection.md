## 能力检测
能力检测的关键是理解两个重要概念：
+ 首先，应该先检测最常用的方式；
+ 其次是必须检测切实需要的特性；

能力检测最有效的场景是检测能力是否存在的同时，验证其是否能够展现出预期的行为。

如尝试检测某个对象是否可以排序：
```javascript
// 不要这样做！错误的能力检测，只能检测到能力是否存在
function isSortable(object) {
return !!object.sort;
}
```

简单地测试到一个属性存在并不代表这个对象就可以排序。更好的方式是检测 sort 是不是函数：
```javascript
// 好一些，检测 sort 是不是函数
function isSortable(object) {
return typeof object.sort == "function";
}
```

进行能力检测时应该尽量使用 `typeof` 操作符；

### 浏览器分析

**1. 可以按照能力将浏览器归类**；

如果你的应用程序需要使用特定的浏览器能力，那么最好集中检测所有能力，而不是等到用的时候再重复检测；

**2. 对浏览器特性进行检测与已知特性对比，确认用户使用浏览器类型**；

这样可以获得比用户代码嗅探更准确的结果。*但未来的浏览器版本可能不适用于这套方案*；
```javascript
// 测试 chrome 对象及其 webstore 属性
// Opera 的某些版本有 window.chrome，但没有 window.chrome.webstore
// 所有版本的 Chrome 都支持
this.isChrome_Gte1 = !!window.chrome && !!window.chrome.webstore;

isChrome() { return this.isChrome_Gte1; }
```

随着浏览器的变迁及发展，可以不断调整底层检测逻辑，但主要的 API 可以保持不变；

## 用户代理检测
用户代理检测通过浏览器的用户代理字符串确定使用的是什么浏览器。
用户代理字符串包含在每个HTTP 请求的头部，在 JavaScript 中可以通过 `navigator.userAgent` 访问；

### 浏览器分析
想要知道自己代码运行在什么浏览器上，大部分开发者会分析 `window.navigator.userAgent` 返回的字符串值；

**1. 伪造用户代理**

实现 `window.navigator` 对象的浏览器（即所有现代浏览器）都会提供 userAgent 这个只读属性；

**2. 分析浏览器**

通过解析浏览器返回的用户代理字符串，可以极其准确地推断出下列相关的环境信息：
+ 浏览器
+ 浏览器版本
+ 浏览器渲染引擎
+ 设备类型（桌面/移动）
+ 设备生产商
+ 设备型号
+ 操作系统
+ 操作系统版本


## 软件与硬件检测

### 识别浏览器与操作系统

**1. navigator.oscpu**：字符串属性，通常对应用户代理字符串中操作系统/系统架构相关信息；

**2. navigator.vendor**：字符串属性，通常包含浏览器开发商信息；

**3. navigator.platform**：字符串属性，通常表示浏览器所在的操作系统；

**4. screen.colorDepth 和 screen.pixelDepth**：返回一样的值，即显示器每像素颜色的位深。
根据 CSS 对象模型（ CSSOM）规范：
`screen.colorDepth` 和 `screen.pixelDepth` 属性应该返回输出设备中每像素用于显示颜色的位数，不包含 alpha 通道。

Chrome 中这两个属性的值如下所示：
```javascript
console.log(screen.colorDepth); // 24
console.log(screen.pixelDepth); // 24
```
**5. screen.orientation**：返回一个 `ScreenOrientation` 对象，其中包含 Screen Orientation API 定义的屏幕信息；
其中有两个属性 angle 和 type，前者返回相对于默认状态下屏幕的角度，
后者返回以下 4 种枚举值之一：
+ portrait-primary
+ portrait-secondary
+ landscape-primary
+ landscape-secondary


根据规范，这些值的初始化取决于浏览器和设备状态；根据规范，这些值的初始化取决于浏览器和设备状态；

### 浏览器元数据

**1. Geolocation API**：一个对象，可以让浏览器脚本感知当前设备的地理位置。只在安全执行环境（通过 HTTPS 获取的脚本）中可用；
> 根据 Geolocation API 规范：
> 地理位置信息的主要来源是 GPS 和 IP 地址、射频识别（ RFID）、 Wi-Fi 及蓝牙 Mac 地址、GSM/CDMA 蜂窝 ID 以及用户输入等信息。

要 获 取 浏 览 器 当 前 的 位 置 ， 可 以 使 用 getCurrentPosition()方 法；方法也接收失败回调函数作为第二个参数，这个函数会收到一个 PositionError 对象，包含 code 和 message 两个属性；

第三个参数提供 PositionOptions 对象作为配置，
+ enableHighAccuracy：布尔值， true 表示返回的值应该尽量精确；
+ timeout：毫秒，表示在以 TIMEOUT 状态调用错误回调函数之前等待的最长时间；
+ maximumAge：毫秒，表示返回坐标的最长有效期，默认值为 0；

**2. Connection State 和 NetworkInformation API**：浏览器会跟踪网络连接状态并以两种方式暴露这些信息：连接事件和 navigator.onLine 属性；
+ 在设备连接到网络时，浏览器会记录这个事实并在 window 对象上触发 online 事件；
+ 断开网络连接后，浏览器会在 window 对象上触发 offline 事件；


任何时候，都可以通过 `navigator.onLine` 属性来确定浏览器的联网状态；

**到底怎么才算联网取决于浏览器与系统实现；**

navigator 对象还暴露了 NetworkInformation API，可以通过 navigator.connection 属性使用。

这个 API **提供了一些只读属性**，并为连接属性变化事件处理程序定义了一个事件对象

**3. Battery Status API**：浏览器可以访问设备电池及充电状态的信息。 `navigator.getBattery()` 方法会返回一个包装了 `BatteryManager` 对象的 Promise 实例。

对象包含四个只读属性：charging，chargingTime，dischargingTime，level；
这个 API 还提供了 4 个事件属性：
+ onchargingchange
+ onchargingtimechange
+ ondischargingtimechange
+ onlevelchange

## 硬件
浏览器检测硬件的能力相当有限，
1. 处理器核心数 navigator.hardwareConcurrency 属性返回浏览器支持的逻辑处理器核心数量，包含表示核心
数的一个整数值（如果核心数无法确定，这个值就是 1）。关键在于，这个值表示浏览器可以并行执行的
最大工作线程数量，不一定是实际的 CPU 核心数。
2. 设备内存大小
navigator.deviceMemory 属性返回设备大致的系统内存大小，包含单位为 GB 的浮点数（舍入
为最接近的 2 的幂： 512MB 返回 0.5， 4GB 返回 4）。
3. 最大触点数
navigator.maxTouchPoints 属性返回触摸屏支持的最大关联触点数量，包含一个整数值。