## 事件流

**IE 事件流被称为事件冒泡**，这是因为事件被定义为从最具体的元素（文档树中最深的节点）开始触发，然后向上传播至没有那么具体的元素（文档）。

 **Netscape Communicator 团队提出了另一种名为事件捕获的事件流**。事件捕获的意思是最不具体的节点应该最先收到事件，而最具体的节点应该最后收到事件。   

DOM2 Events 规范规定事件流分为 3 个阶段：事件捕获、到达目标和事件冒泡。

+ 事件捕获最先发生，为提前拦截事件提供了可能。

+ 然后，实际的目标元素接收到事件。

+ 最后一个阶段是冒泡，最迟要在这个阶段响应事件。  

## 事件处理程序

+ 作为事件处理程序执行的代码可以访问全局作用域中的一切；
+ 在 HTML 中定义的事件处理程序，会创建一个函数来封装属性的值。函数有一个局部变量 event 对象实例；
+ 该函数的作用域通过`with`被扩展了，document 和元素自身的成员都可以被当成局部变量来访问；

在 HTML 中指定事件处理程序有一些问题：

+ 时机问题：事件处理程序的代码可能在HTML元素定义的后面；
+ 对事件处理程序作用域链的扩展在不同浏览器中可能导致不同的结果，访问无限定的对象成员可能导致错误；
+ HTML 与 JavaScript 强耦合。如需要修改事件处理程序，则必须在 HTML 和 JavaScript 两处都修改代码；  

---

在 JavaScript 中指定事件处理程序的传统方式是把一个函数赋值给（ DOM 元素的）一个事件处理程
序属性（DOM0 方式）。  

+ 以这种方式添加事件处理程序是注册在事件流的冒泡阶段的；

DOM2 Events 为事件处理程序的赋值和移除定义了两个方法： `addEventListener()`和`removeEventListener()`，这两个方法暴露在所有 DOM 节点上；

+ 与 DOM0 方式类似，这个事件处理程序同样在被附加到的元素的作用域中运行；
+ 使用 DOM2方式的主要优势是**可以为同一个事件添加多个事件处理程序**；
+  只能使用 removeEventListener()并传入与添加时同样的参数来移除（匿名函数无法移除）；

---

IE 实现了与 DOM 类似的方法，即 `attachEvent()`和 `detachEvent()`；

注意， attachEvent()的第一个参数是"onclick"，而不是 DOM 的 addEventListener()方法的"click"  

事件处理程序的作用域：

+ DOM0方式时，事件处理程序中的 this 值等于目标元素。
+ attachEvent()时，事件处理程序是在全局作用域中运行的，因此 this 等于 window。  

## 事件对象

所有事件对象都会包含下列的这些公共属性和方法：

 + bubbles：布尔值，只读，表示事件是否冒泡；
 + cancelable：布尔值，只读，表示是否可以取消事件的默认行为；
 + currentTarget：元素，只读，**当前事件处理程序所在的元素**；
 + defaultPrevented：布尔值，只读，true 表示已经调用 preventDefault()方法（ DOM3 Events 中新增）；
 + detail：整数，只读，事件相关的其他信息；
 + eventPhase：整数，只读，表示调用事件处理程序的阶段： 1 代表捕获阶段， 2 代表到达目标， 3 代表冒泡阶段；
+ preventDefault()：函数，只读，用于取消事件的默认行为。**只有事件对象的 cancelable 属性为 true 才可以调用这个方法**；
+ stopImmediatePropagation()：函数 只读 用于取消所有后续事件捕获或事件冒泡，并阻止调用任何后续事件处理程序（ DOM3 Events 中新增）；
+ stopPropagation()：函数 只读 用于取消所有后续事件捕获或事件冒泡。只有 bubbles 为 true 才可以调用这个方法；
+ target：元素，只读，**事件目标**，即真正触发了事件的元素；
+ trusted：布尔值 只读 true 表示事件是由浏览器生成的。 false 表示事件是开发者通过 JavaScript 创建的（ DOM3 Events 中新增）；
+ type：字符串，只读，被触发的事件类型；
+ View：AbstractView，只读，与事件相关的抽象视图。等于事件所发生的 window 对象

在事件处理程序内部， this 对象始终等于 currentTarget 的值，而 target 只包含事件的实际目标；

event 对象只在事件处理程序执行期间存在，一旦执行完毕，就会被销毁。  

---

与 DOM 事件对象不同， IE 事件对象可以基于事件处理程序被指定的方式以不同方式来访问；

+ 使用 DOM0 方式指定的，则 event 对象只是 window 对象的一个属性；

+ 如果事件处理程序是使用 attachEvent()指定的，则 event 对象会作为唯一的参数传给处理函数；
+ 使用 attachEvent() 时， event 对象仍然是 window 对象的属性（像 DOM0 方式那样），只是出
  于方便也将其作为参数传入  

基于触发的事件类型不同， event 对象中包含的属性和方法也不一样：

+ cancelBubble：布尔值，读/写，默认为 false，设置为 true 可以取消冒泡（与 DOM 的 stopPropagation()方法相同）；
+ returnValue：布尔值，读/写，默认为 true，设置为 false 可以取消事件默认行为（与 DOM 的 preventDefault()方法相同）；
+ srcElement：元素，只读，事件目标（与 DOM 的 target 属性相同）；
+ type：字符串，只读，触发的事件类型；

由于事件处理程序的作用域取决于指定它的方式，因此 this 值并不总是等于事件目标。为此，更好的方式是**使用事件对象的 srcElement 属性代替 this**。  

## 事件类型

DOM3 Events 定义了如下事件类型：
 + 用户界面事件（ UIEvent）：涉及与 BOM 交互的通用浏览器事件。
 + 焦点事件（ FocusEvent）：在元素获得和失去焦点时触发。
 + 鼠标事件（ MouseEvent）：使用鼠标在页面上执行某些操作时触发。
 + 滚轮事件（ WheelEvent）：使用鼠标滚轮（或类似设备）时触发。
 + 输入事件（ InputEvent）：向文档中输入文本时触发。
 + 键盘事件（ KeyboardEvent）：使用键盘在页面上执行某些操作时触发。
 + 合成事件（ CompositionEvent）：在使用某种 IME（ Input Method Editor，输入法编辑器）输入
字符时触发。  

### 用户界面事件  

+ 在 window 对象上， load 事件会在整个页面（包括所有外部资源如图片、 JavaScript 文件和 CSS 文件）加载完成后触发；
+ 根据 DOM2 Events， load 事件应该在 document 而非 window 上触发。可是为了向后兼容，所有浏览器都在 window 上实现了 load 事件；
+ unload 事件会在文档卸载完成后触发。 unload 事件一般是在从一个页面导航到另一个页面时触发，**最常用于清理引用，以避免内存泄漏**；

### 焦点事件

+ 焦点事件中的两个主要事件是 focus 和 blur，focusin 和 focusout  则是相应的冒泡版事件；
+ 当焦点从页面中的一个元素移到另一个元素上时，会依次发生如下事件。
  1. focuscout 在失去焦点的元素上触发。
  2. focusin 在获得焦点的元素上触发。
  3. blur 在失去焦点的元素上触发。
  4. DOMFocusOut 在失去焦点的元素上触发。
  5. focus 在获得焦点的元素上触发。
  6. DOMFocusIn 在获得焦点的元素上触发。  

### 鼠标和滚轮事件

+ 页面中的所有元素都支持鼠标事件。除了 mouseenter 和 mouseleave，所有鼠标事件都会冒泡；

+ 4 个鼠标事件永远会按照如下顺序触发：
  1. mousedown
  2. mouseup
  3. click
  4. mousedown
  5. mouseup
  6. click
  7. dblclick  

+ 滚轮事件只有一个事件 mousewheel，反映的是鼠标滚轮或带滚轮的类似设备上滚轮的交互；
+ mousewheel 事件的 event 对象包含鼠标事件的所有标准信息，此外还有一个名为 wheelDelta 的新属性，当鼠标滚轮向前滚动时，wheelDelta 每次都是+120，反之则是-120 ；  
+ 客户端坐标是事件发生时鼠标光标在客户端视口中的坐标，而页面坐标是事件发生时鼠标光标在页面上的坐标；在页面没有滚动时， pageX 和 pageY 与 clientX 和 clientY 的值相同；
+ 可以通过 event 对象的 screenX 和 screenY 属性获取鼠标光标在屏幕上的坐标；  
+ shiftKey、 ctrlKey、 altKey 和 metaKey 会在各自对应的修饰键被按下时包含布尔值 true ；
+ 对鼠标事件来说， detail 包含一个数值，表示在给定位置上发生了多少次单击；

### 键盘和输入事件

当用户按下键盘上的某个字符键时，首先会触发 keydown 事件，然后触发 keypress 事件，最后
触发 keyup 事件。  

+ DOM3 Events 废弃了 keypress 事件，而推荐 textInput 事件；
+ keydown 和 keypress 事件会在文本框出现变化之前触发，而 keyup 事件会在文本框出现变化之后触发；
+ DOM3 Events 也支持一个名为 location 的属性，该属性是一个数值，表示是在哪里按的键；
+ event 对象的 getModifierState()方法可检测 Shift、 Control、 Alt、 AltGraph 或 Meta 修饰键是否被锁住；
+ DOM3 Events 规范增加了一个名为 textInput 的事件，其在字符被输入到可编辑区域时触发，用于替代 可以keypress 事件：
  + keypress 会在任何可以获得焦点的元素上触发，而 textInput 只在可编辑区域上触发；  
  + textInput 只在新字符被插入时才会触发，而 keypress 对任何可能影响文本的键都会触发（包括退格键）；

+ event 对象上还有一个名为 inputMethod 的属性，用于判断向控件中输入文本的手段；

### 合成事件

合成事件是 DOM3 Events 中新增的，用于处理通常使用 IME 输入时的复杂输入序列；

+ compositionstart，在 IME 的文本合成系统打开时触发，表示输入即将开始；
+ compositionupdate，在新字符插入输入字段时触发；
+ compositionend，在 IME 的文本合成系统关闭时触发，表示恢复正常键盘输入；

### 变化事件

变化事件已经被 Mutation Observers 所取代  

### HTML5 事件

如何避免默认的上下文菜单起作用。结果就出现了 contextmenu 事件，以专门用于表示何时该显示上下文菜单，从而允许开发者取消默认的上下文菜单并提供自定义菜单；

beforeunload 事件会在 window 上触发，用意是给开发者提供阻止页面被卸载的机会； 

window 的 load 事件会在页面完全加载后触发，而 DOMContentLoaded 事件会在 DOM 树构建完成后立即触发；

Firefox 和 Opera 开发了一个名为往返缓存（ bfcache， back-forward cache）的功能，此旨在使用浏览器“前进”和“后退”按钮时加快页面之间的切换。

这个缓存不仅存储页面数据，也存储 DOM 和JavaScript 状态，实际上是把整个页面都保存在内存里。如果页面在缓存中，那么导航到这个页面时就不会触发 load 事件。  

HTML5 增加了 hashchange 事件，用于在 URL 散列值（ URL 最后#后面的部分）发生变化时通知开发者。onhashchange 事件处理程序必须添加给window；

### 设备事件

+ 苹果公司在移动 Safari 浏览器上创造了 orientationchange 事件，以方便开发者判断用户的设备是处于垂直模式还是水平模式。  
+ DeviceOrientationEvent 规范定义的事件。如果可以获取设备的加速计信息，而且数据发生了变化，这个事件就会在 window 上触发；
+ devicemotion 事件。这个事件用于提示设备实际上在移动，而不仅仅是改变了朝向。  

### 触摸及手势事件

WebKit 也为 Android 定制了很多专有事件，成为了事实标准，并被纳入 W3C 的 Touch Events 规范；

+ touchstart：手指放到屏幕上时触发（即使有一个手指已经放在了屏幕上）。

+ touchmove：手指在屏幕上滑动时连续触发。在这个事件中调用 preventDefault() 可以阻止滚动；

只有在两个手指同时接触事件接收者时，这些事件才会触发。在一个元素上设置事件处理程序，意味着两个手指必须都在元素边界以内才能触发手势事件：

+ gesturestart：一个手指已经放在屏幕上，再把另一个手指放到屏幕上时触发。
+ gesturechange：任何一个手指在屏幕上的位置发生变化时触发。
+ gestureend：其中一个手指离开屏幕时触发。

## 内存与性能

“过多事件处理程序”的解决方案是使用事件委托。事件委托利用事件冒泡，可以只使用一个事件处理程序来管理一种类型的事件。  

使用事件委托，只要给所有元素共同的祖先节点添加一个事件处理程序；

+ document 对象随时可用，任何时候都可以给它添加事件处理程序 ；
+ 节省 DOM 引用，也可以节省时间；
+ 减少页面的内存，提升性能；

除了通过事件委托来限制这种连接之外，还应该及时删除不用的事件处理程序；

被 innerHTML 删除的元素上如果有事件处理程序，就不会被垃圾收集程序正常清
理；

在事件处理程序中删除按钮会阻止事件冒泡；只有事件目标仍然存在于文档中时，事
件才会冒泡。  

最好在 onunload 事件处理程序中趁页面尚未卸载先删除所有事件处理程序。  

## 模拟事件

任何时候，都可以使用 document.createEvent()方法创建一个 event 对象，创建 event 对象之后，需要使用事件相关的信息来初始化；  

事件模拟的最后一步是触发事件。为此要使用 dispatchEvent()方法，  

DOM3 增加了自定义事件的类型。自定义事件不会触发原生 DOM 事件，但可以让开发者定义自己的 事 件 。 要 创 建 自 定 义 事 件 ， 需 要 调 用 createEvent("CustomEvent") 。 返 回 的 对 象 包 含 initCustomEvent()方法  
