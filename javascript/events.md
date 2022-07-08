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
+ 