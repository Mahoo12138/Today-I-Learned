## 节点层级  

 DOM 中总共有 12 种节点类型，这些类型都继承一种基本类型；

### Node 类型

所有 DOM 节点类型都实现了 Node 接口，即所有类型都共享其中的基本属性和方法；

每个节点都有 `nodeType` 属性，表示该节点的类型。节点类型由定义在 Node 类型上的 12 个数值
常量表示；

浏览器并不支持所有节点类型。开发者最常用到的是元素节点和文本节点；

每个节点都有一个 childNodes 属性，其中包含一个 NodeList 的实例。  NodeList 并不是 Array 的实例，但类似于 Array；NodeList 是**实时的活动对象**，而不是第一次访问时所获得内容的快照；

#### 操纵节点  

+ `appendChild()`，用于在 childNodes 列表末尾添加节点；
+ 使用 `insertBefore()`方法，把节点放到 childNodes 中的特定位置而不是末尾；
+ `replaceChild()`方法接收两个参数：要插入的节点和要替换的节点，用于替换节点； 
+ 要移除节点而不是替换节点，可以使用 `removeChild()` 方法；

并非所有节点类型都有子节点，如果在不支持子节点的节点上调用这些方法，则会导致抛出错误；

+ `cloneNode()`，会返回与调用它的节点一模一样的节点。 该方法接收一个布尔值参数，表示**是否深复制**。在传入 true 参数时，会进行深复制，复制节点及其整个子 DOM 树。如果传入 false，则只会复制调用该方法的节点。复制返回的节点属于文档所有，但尚未指定父节点，所以可称为**孤儿节点**（ orphan）。
+ `normalize()`，这个方法唯一的任务就是处理文档子树中的文本节点；

### Document 类型  

在浏览器中，文档对象 document 是 `HTMLDocument` 的实例（ `HTMLDocument` 继承 `Document`），表示整个 HTML 页面。 document 是 window 对象的属性，因此是一个全局对象。

Document 类型的节点中，**子节点可以是 DocumentType（最多一个）、 Element（最多一个）**等；

document 作为 HTMLDocument 的实例，还有一些标准 Document 对象上所没有的属性：

+ `title`，包含 \<title> 元素中的文本，通常显示在浏览器窗口或标签页的标题栏；修改 title 属性并不会改变\<title>元素；
+ `URL` 包含当前页面的完整 URL（地址栏中的 URL）， `domain` 包含页面的域名，而 `referrer` 包含链接到当前页面的那个页面的 URL。  

只有 domain 属性是可以设置的，且只能设置同域的域名；

---

+ `getElementById()` 和 `getElementsByTagName()` 就是 Document 类型提供的获取某个或某组元素的引用的方法；
+ 对 `HTMLCollection` 对象而言，中括号既可以接收数值索引，也可以接收字符串索引。而在后台，
  数值索引会调用 `item()`，字符串索引会调用 `namedItem()`；
+   HTMLDocument 上还定义 `getElementsByName()`方法，该方法会返回具有给定 name 属性的所有元素；
+   

---

+ 在页面渲染期间通过 `document.write()` 可向文档中输出内容；在页面加载完之后再调用 `document.write()`，则输出的内容会重写整个页面；
+ `open()`和 `close()` 方法分别用于打开和关闭网页输出流。在调用 write()和 writeln()时，这两
  个方法都不是必需的；



### Element 类型  

Element 表示 XML 或 HTML 元素，对外暴露出访问元素标签名、子节点和属性的能力；

`div.tagName` 实际上返回的是"DIV"而不是"div"。在 HTML 中，元素标签名始终以全大写表示； 先把标签名转换为全部小写后再比较，这是推荐的做法；

**所有 HTML 元素都通过 HTMLElement 类型表示**，包括其直接实例和间接实例。另外， HTMLElement
直接继承 Element 并增加了一些属性；

与属性相关的 DOM 方法主要有 3 个： getAttribute()、 setAttribute()和 removeAttribute()。  

注意，属性名不区分大小写，通过 DOM 对象访问的属性中有两个返回的值跟使用 getAttribute()取得的值不一样：

+ style：DOM 对象的属性访问返回 CSSStyleDeclaration；  
+ 事件处理程序：是一个 JavaScript 函数（未指定该属性则返回 null）；

Element 类型是唯一使用 `attributes` 属性的 DOM 节点类型。 attributes 属性包含一个 `NamedNodeMap` 实例，是一个类似 NodeList 的“实时”集合。  

attributes 属性最有用的场景是需要迭代元素上所有属性的时候；不同浏览器返回的 attributes 中的属性顺序也可能不一样。

### Text 类型

Text 节点由 Text 类型表示，包含按字面解释的纯文本，也可能包含转义后的 HTML 字符，但不含 HTML 代码；

修改文本节点还有一点要注意，就是 HTML 或 XML 代码（取决于文档类型）会被转换成实体编码，即小于号、大于号或引号会被转义；

一般来说一个元素只包含一个文本子节点。不过，也可以让元素包含多个文本子节点；

有一个方法可以合并相邻的文本节点，即 `normalize()`，是在 Node 类型中定义的（因此所有类型的节点上都有这个方法）。  

Text 类型定义了一个与 normalize()相反的方法——splitText()。这个方法可以在指定的偏移位置拆分 nodeValue，将一个文本节点拆分成两个文本节点。  

### Comment 类型

DOM 中的注释通过 Comment 类型表示，Comment 类型与 Text 类型继承同一个基类（ CharacterData），因此拥有除 `splitText()` 之外Text 节点所有的字符串操作方法；

此外，浏览器不承认结束的\</html>标签之后的注释。如果要访问注释节点，则必须确定它们是\<html>元素的后代；

### CDATASection 类型  

CDATASection 类型表示 XML 中特有的 CDATA 区块。 CDATASection 类型继承 Text 类型，因此拥有包括 splitText()在内的所有字符串操作方法；

CDATA 区块只在 XML 文档中有效，因此某些浏览器比较陈旧的版本会错误地将 CDATA 区块解析为 Comment 或 Element ；

### DocumentType 类型  

DocumentType 类型的节点包含文档的文档类型（ doctype）信息，  

+ `name` 是文档类型的名称；
+ `entities` 是这个文档类型描述的实体的 NamedNodeMap；
+ `notations` 是这个文档类型描述的表示法的 NamedNodeMap；

浏览器中的文档通常是 HTML 或 XHTML 文档类型，所以 entities 和 notations 列表为空。（这个对象只包含行内声明的文档类型。）无论如何，**只有 name 属性是有用的**；

### DocumentFragment 类型  

在所有节点类型中，`DocumentFragment` 类型是唯一一个在标记中没有对应表示的类型。 DOM 将
文档片段定义为 “轻量级” 文 档， 能够包含和操作节点， 却没有完整文档那样额外的消耗 。 

**不能直接把文档片段添加到文档**。相反，文档片段的作用是充当其他要被添加到文档的节点的仓库；

如果文档中的一个节点被添加到一个文档片段，则该节点会从文档树中移除，不会再被浏览器渲染；

### Attr 类型  

元素数据在 DOM 中通过 Attr 类型表示。 Attr 类型构造函数和原型在所有浏览器中都可以直接访问。技术上讲，属性是存在于元素 attributes 属性中的节点；

属性节点尽管是节点，却不被认为是 DOM 文档树的一部分。 Attr 节点很少直接被引用；

将属性作为节点来访问多数情况下并无必要。推荐使用 getAttribute()、removeAttribute()和 setAttribute()方法操作属性，而不是直接操作属性节点；  

## DOM 编程

+ 通过 innerHTML 属性创建的\<script>元素永远不会执行；
+ 应该把\<link>元素添加到\<head>元素而不是\<body>元素，这样才能保证所有浏览器都能正常运行；
+ 通过外部文件加载样式是异步的；因此，样式的加载和正执行的 JS 代码并没有先后顺序。一般也没有必要知道样式什么时候加载完成。 

理解 NodeList 对象和相关的 NamedNodeMap、 HTMLCollection，是理解 DOM 编程的关键。

这 3 个集合类型都是“实时的” ，在每次访问时更新集合；

```js
let divs = document.getElementsByTagName("div");
for (let i = 0; i < divs.length; ++i){
    let div = document.createElement("div");
    document.body.appendChild(div);
}
```

如上的例子，代码永远不会遍历结束，因为 i 和 divs.length 在同时递增；解决方法是再定义一个变量用于保存 divs.length：

```js
for (let i = 0, len = divs.length; i < len; ++i) {}
```

## MutationObserver

不久前添加到 DOM 规范中的 **MutationObserver 接口**，可以在 DOM 被修改时异步执行回调，该接口是为了取代废弃的 MutationEvent；

`MutationObserver` 的实例要通过调用 MutationObserver 构造函数并传入一个回调函数来创建：

```js
let observer = new MutationObserver(() => console.log('DOM was mutated!'));  
```

使用 `observe()` 方法把这个 observer 与 DOM 关联起来，方法接收两个必需的参数：

+ 要观察其变化的 DOM 节点；
+ 一个 `MutationObserverInit` 对象  ；

`MutationObserverInit` 对象用于控制观察哪些方面的变化， 是一个键/值对形式配置选项的字典。
例如，下面的代码会创建一个观察者（observer）并配置它观察\<body>元素上的属性变化：

```js
let observer = new MutationObserver(() => console.log('<body> attributes changed'));
observer.observe(document.body, { attributes: true }); 
```

+ 每次执行回调都会传入一个包含按顺序入队的 MutationRecord 实例的数组；
+ 传给回调函数的第二个参数是观察变化的 MutationObserver 的实例；
+ 默认情况下，只要被观察的元素不被垃圾回收；要提前终止执行回调，可以调用 `disconnect()` 方法：`observer.disconnect();  `
+ 多次调用 `observe()` 方法，可以复用一个 MutationObserver 对象观察多个不同的目标节点；
+ `disconnect()` 方法是一个“一刀切”的方案，调用它会停止观察所有目标；
+ 调用 `disconnect()` 并不会结束 `MutationObserver` 的生命。还可以重新使用这个观察者，再将它关联到新的目标节点；

MutationObserverInit 对象用于控制对目标节点的观察范围。粗略地讲，观察者可以观察的事
件包括属性变化、文本变化和子节点变化：

+ subtree：子树
+ attributes：属性
+ attributeFilter：哪些属性
+ attributeOldValue：记录旧的属性值
+ characterData：字符数据
+ characterDataOldValue：字符数据旧值
+ childList：修改子节点

在调用 observe()时， MutationObserverInit 对象中的属性必须至少有一项为 true（无论是直接设置这几个属性，还是通过设置 attributeOldValue 等属性间接导致它们的值转换为 true）。否则会抛出错误，因为没有任何变化事件可能触发回调。  

---

每次 MutationRecord 被添加到 MutationObserver 的记录队列时，仅当之前没有已排期的微任务回调时（队列中微任务长度为 0），才会将观察者注册的回调（在初始化 MutationObserver 时传入）作为微任务调度到任务队列上。这样可以保证记录队列的内容不会被回调处理两次。  

调用 `MutationObserver` 实例的 `takeRecords()` 方法可以清空记录队列，取出并返回其中的所
有 MutationRecord 实例。  

**将变化回调委托给微任务来执行可以保证事件同步触发**，同时避免随之而来的混乱。为MutationObserver 而实现的记录队列，可以保证即使变化事件被爆发式地触发，也不会显著地拖慢浏览器；

+ **MutationObserver 实例与目标节点之间的引用关系是非对称的**。 

  MutationObserver 拥有对要观察的目标节点的弱引用。因为是弱引用，所以不会妨碍垃圾回收程序回收目标节点；目标节点却拥有对 MutationObserver 的强引用。如果目标节点从 DOM 中被移除，随后被垃圾回收，则关联的 MutationObserver 也会被垃圾回收  

+ **记录队列中的每个 MutationRecord 实例至少包含对已有 DOM 节点的一个引用**

  如果变化是 childList 类型，则会包含多个节点的引用；
