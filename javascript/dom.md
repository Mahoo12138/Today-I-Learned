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

