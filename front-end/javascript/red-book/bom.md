## window 对象

+ ECMAScript 中的 Global 对象
+ 浏览器窗口的 JavaScript 接口  

通过 var 声明的所有全局变量和函数都会变成 window 对象的属性和方法；

### 窗口关系

+ top 对象始终指向最上层（最外层）窗口，即浏览器窗口本身；
+ parent 对象则始终指向当前窗口的父窗口；
+ self 对象，它是终极 window 属性，始终会指向 window；

### 窗口位置与像素比

+ screenLeft 和 screenTop 属性，表示窗口相对于屏幕左侧和顶部的位置；
+ moveTo(absolute position) 和 moveBy(relative position) 方法移动窗口；

### 窗口大小

+ outerWidth 和 outerHeight 返回浏览器窗口自身的大小；
+ innerWidth 和 innerHeight 返回浏览器窗口中页面视口的大小；
+ resizeTo() 和 resizeBy() 方法调整窗口大小； 

浏览器窗口自身的精确尺寸不好确定，但可以确定页面视口的大小，如下：
```js
let pageWidth = window.innerWidth, pageHeight = window.innerHeight;
if (typeof pageWidth != "number") {
    if (document.compatMode == "CSS1Compat"){
        pageWidth = document.documentElement.clientWidth;
        pageHeight = document.documentElement.clientHeight;
    } else {
        pageWidth = document.body.clientWidth;
        pageHeight = document.body.clientHeight;
    }
}
```

### 视口位置

+ 度量文档相对于视口滚动距离的属性有两对，返回相等的值： window.pageXoffset/window.scrollX 和 window.pageYoffset/window.scrollY；
+ scroll()、 scrollTo() 和 scrollBy() 方法滚动页面；它们都接收一个 ScrollToOptions 字典，除了提供偏移值，还可以通过 behavior 属性告诉浏览器是否平滑滚动；

### 导航与打开新窗口  

+ window.open() 方法可以用于导航到指定 URL，也可以用于打开新浏览器窗口；接收 4个参数：要加载的 URL、目标窗口、特性字符串和表示新窗口在浏览器历史记录中是否替代当前加载页面的布尔值；

在某些浏览器中，每个标签页会运行在独立的进程中。如果一个标签页打开了另一个，而 window
对象需要跟另一个标签页通信，那么标签便不能运行在独立的进程中。在这些浏览器中，可以将新打开
的标签页的 opener 属性设置为 null，表示新打开的标签页可以运行在独立的进程中。  

### 系统对话框  

alert()、 confirm() 和 prompt() 方法，可以让浏览器调用系统对话框向用户显示消息；

这些对话框都是同步的模态对话框，即它们显示的时候，代码会停止执行，它们消失以后，代码才会恢复执行；

+ 警告框（ alert）通常用于向用户显示一些他们无法控制的消息；
+ 确认框，调用 confirm()来显示。确认框跟警告框类似，都会向用户显示消息，确认框有两个按钮；
+ 提示框，通过调用 prompt()方法来显示。提示框的用途是提示用户输入消息。  

另外两种对话框： find()和 print()。这两种对话框都是异步显示的，即控制权会立即返回给脚本。分别是浏览器菜单上选择“查找”（ find）和“打印”（ print） ；

很多浏览器针对这些系统对话框添加了**特殊功能**：

+ 网页中的脚本生成了两个或更多系统对话框，则除第一个之外，**所有后续的对话框上都会显示一个复选框**，如果用户选中则会禁用后续的弹框，直到页面刷新；
+ 如果用户选中了复选框并关闭了对话框，在页面刷新之前，**所有系统对话框**（警告框、确认框、提
  示框）**都会被屏蔽**  ；

## location 对象 

+ 提供了当前窗口中加载文档的信息，以及通常的导航功能；
+ 既 是 window 的 属 性 ， 也 是 document 的 属 性；
+ 还保存了把 URL 解析为离散片段后能够通过属性访问的信息  

---

URLSearchParams  ：可以检查和修改查询字符串，实例上暴露了 get()、set() 和 delete()等方法；大多数支持 URLSearchParams 的浏览器也支持将 URLSearchParams 的实例用作可迭代对象；

通过修改 location 对象修改浏览器的地址，会立即启动导航到新 URL 的操作，同时在浏览器历史记录中增加一条记录：

```js
location.assign("http://www.xxx.com");
```

如果给 location.href 或 window.location 设置一个 URL，也会以同一个 URL 值调用 assign() 方法：

```js
window.location = "http://www.xxx.com";
location.href = "http://www.xxx.com";
```

**除了 hash 之外**，只要修改 location 的一个属性，就会导致页面重新加载新 URL ；

修改 hash 的值会在浏览器历史中增加一条新记录，单击“后退”按钮时，就会导航到前一个页面。如果不希望增加历史记录，可以使用 replace() 方法；

reload() 方法能重新加载当前显示的页面，传入可选参数 true，表示强制从服务器加载；

脚本中位于 reload()调用之后的代码可能执行也可能不执行，这取决于网络延迟和系统资源等因素；  

## navigator 对象  

navigator 对 象 实 现 了 NavigatorID 、 NavigatorLanguage 、 NavigatorOnLine 、NavigatorContentUtils 、NavigatorStorage 、 NavigatorStorageUtils 、 NavigatorConcurrentHardware、 NavigatorPlugins 和NavigatorUserMedia 接口定义的属性和方法；

### 检测插件  

。。。

### 注册处理程序  

现代浏览器支持 navigator 上的（在 HTML5 中定义的） registerProtocolHandler()方法。这个方法可以把一个网站注册为处理某种特定类型信息应用程序；

必须传入 3 个参数：要处理的协议（如"mailto"或"ftp"）、处理该协议的 URL，以及应用名称；

## screen 对象  

window 的另一个属性 screen 对象，是为数不多的几个在编程中很少用的 JavaScript 对象；

用于保存客户端能力信息，也就是浏览器窗口外面的客户端显示器的信息，比如像素宽度和像
素高度  ；

## history 对象  

history 对象表示当前窗口首次使用以来用户的导航历史记录；

出于安全考虑，这个对象不会暴露用户访问过的 URL，但可以通过它在不知道实际 URL 的情况下前进和后退  

### 导航

+ go() 方法可以在用户历史记录中沿任何方向导航，可以前进也可以后退，参数为整数，表示步数；
+ go()有两个简写方法： back()和 forward() ；
+ history 对象还有一个 length 属性，表示历史记录中有多个条目；

### 历史状态管理 

hashchange 会在页面 URL 的散列变化时被触发，开发者可以在此时执行某些操作。而状态管理 API 则可以让开发者改变浏览器 URL 而不会加载新页面；

 history.pushState() 接收 3 个参数：一个 state 对象、一个新状态的标题和一个（可选的）相对 URL：

```js
let stateObject = {foo:"bar"};
history.pushState(stateObject, "My title", "baz.html");
```

因为 pushState() 会创建新的历史记录，所以也会相应地启用“后退”按钮；

页面初次加载时没有状态。因此点击“后退”按钮直到返回最初页面时， event.state 会为 null；  

state 对象应该只包含可以被序列化的信息。因此，DOM 元素之类并不适合放到状态对象里保存；