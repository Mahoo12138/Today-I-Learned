## DOM 的演进

DOM2 和 DOM3 Core 模块的目标是扩展 DOM API，满足 XML 的所有需求并提供更好的错误处理和特性检测；

+  DOM2 Core 仅在 DOM1 Core 基础上增加了一些方法和属性；
+ DOM3 Core 则除了增强原有类型，也新增了一些新类型；

### XML 命名空间  

XML 命名空间可以实现在一个格式规范的文档中混用不同的 XML 语言，而不必担心**元素命名冲突**；

严格来讲， XML 命名空间在 XHTML 中才支持， HTML 并不支持；

+ 可以使用 xmlns 给命名空间创建一个前缀，格式为“xmlns: 前缀”；
+ 如果文档中只使用一种 XML 语言，那么命名空间前缀其实是多余的；

---

在 DOM2 中， Node 类型包含以下**特定于命名空间的属性**：

+  localName，不包含命名空间前缀的节点名；
+ namespaceURI，节点的命名空间 URL，如果未指定则为 null；
+ prefix，命名空间前缀，如果未指定则为 null。  

DOM3 进一步增加了如下与命名空间相关的方法：

+ isDefaultNamespace(namespaceURI)，返回布尔值，表示 namespaceURI 是否为节点的默认命名空间；
+ lookupNamespaceURI(prefix)，返回给定 prefix 的命名空间 URI；
+ lookupPrefix(namespaceURI)，返回给定 namespaceURI 的前缀；

主要用于**通过元素查询前面和命名空间 URI，以确定元素与文档的关系** 

---

DOM2 在 Document 类型上新增了如下命名空间特定的方法：
+ createElementNS(namespaceURI, tagName)，以给定的标签名 tagName 创建指定命名空
间 namespaceURI 的一个新元素；
+ createAttributeNS(namespaceURI, attributeName)，以给定的属性名 attributeName
创建指定命名空间 namespaceURI 的一个新属性；
+ getElementsByTagNameNS(namespaceURI, tagName)，返回指定命名空间 namespaceURI
中所有标签名为 tagName 的元素的 NodeList。  

这些命名空间特定的方法**只在文档中包含两个或两个以上命名空间时才有用**。

---

DOM2 Core 对 Element 类型的更新主要**集中在对属性的操作上**。下面是新增的方法：
+ getAttributeNS(namespaceURI, localName)，取得指定命名空间 namespaceURI 中名为
localName 的属性；
+ getAttributeNodeNS(namespaceURI, localName)，取得指定命名空间 namespaceURI 中
名为 localName 的属性节点；
+ getElementsByTagNameNS(namespaceURI, tagName)，取得指定命名空间 namespaceURI
中标签名为 tagName 的元素的 NodeList；
+ hasAttributeNS(namespaceURI, localName)，返回布尔值，表示元素中是否有命名空间
namespaceURI 下名为 localName 的属性（注意， DOM2 Core 也添加不带命名空间的
hasAttribute()方法）；
+ removeAttributeNS(namespaceURI, localName)，删除指定命名空间 namespaceURI 中
名为 localName 的属性；
+ setAttributeNS(namespaceURI, qualifiedName, value)， 设置指定命名空间 namespaceURI
中名为 qualifiedName 的属性为 value；
+ setAttributeNodeNS(attNode)，为元素设置（添加）包含命名空间信息的属性节点 attNode。
**这些方法与 DOM1 中对应的方法行为相同，除 setAttributeNodeNS()之外都只是多了一个命名空间参数**  

---

NamedNodeMap 也增加了以下处理命名空间的方法。因为 NamedNodeMap 主要表示**属性**：

+ getNamedItemNS(namespaceURI, localName)，取得指定命名空间 namespaceURI 中名为
localName 的项；
+ removeNamedItemNS(namespaceURI, localName)，删除指定命名空间 namespaceURI 中
名为 localName 的项；
+ setNamedItemNS(node)，为元素设置（添加）包含命名空间信息的节点。

这些方法很少使用，因为**通常都是使用元素来访问属性**；

### 其他变化

DocumentType 新增了 3 个属性： publicId、 systemId 和 internalSubset。 

+ publicId、systemId 表示文档类型声明中有效但无法使用 DOM1 API 访问的数据；
+ internalSubset 用于访问文档类型声明中可能包含的额外定义； 

通常在网页中很少需要访问这些信息，XML 文档中稍微常用一些；

---

Document 类型的更新中唯一跟命名空间无关的方法是 `importNode()`。这个方法的目的**是从其他文档获取一个节点并导入到新文档，以便将其插入新文档**。  

importNode()方法跟 cloneNode()方法类似，同样接收两个参数：要复制的节点和表示是否同时
复制子树的布尔值，返回结果是适合在当前文档中使用的新节点  
DOM2 View 给 Document 类型增加了新属性 defaultView，是一个指向拥有当前文档的窗口（或窗格`<frame>`） 的指针。   

DOM2 Core 还针对 document.implementation 对象增加了两个新方法： `createDocumentType()`和 `createDocument()`。前者用于创建 DocumentType 类型的新节点，  后者用于创建新文档；

DOM2 HTML 模块也为 document.implamentation 对象添加了 createHTMLDocument()方法。
使用这个方法可以创建一个完整的 HTML 文档，包含`<html>`、 `<head>`、 `<title>`和`<body>`元素；

---

DOM3 新增了两个用于比较节点的方法： isSameNode()和 isEqualNode()；

+ 节点相同，意味着引用同一个对象；

+ 节点相等，意味着节点类型相同，拥有相等的属性（nodeName、 nodeValue 等）；

DOM3 也增加了给 DOM 节点附加额外数据的方法，用于给节点追加数据；`setUserData()`方法接收 3 个参数：键、值、处理函数；

处理函数接收 5 个参数：表示操作类型的数值（ 1 代表复制，2 代表导入， 3 代表删除， 4 代表重命名）、数据的键、数据的值、源节点和目标节点。  

`setUserData()`的处理函数会在包含数据的节点被复制、删除、重命名或导入其他文档的时候执行，可以在这时候决定如何处理用户数据；  

---

DOM2 HTML 给 HTMLIFrameElement（即`<iframe>`，内嵌窗格）类型新增了一个属性，叫 `contentDocument`。这个属性包含代表子内嵌窗格中内容的 document 对象的指针；

+ contentDocument 属性是 Document 的实例，拥有所有文档属性和方法；

## 样式

HTML 中的样式有 3 种定义方式：外部样式表（通过`<link>`元素）、文档样式表（使用`<style>`元
素）和元素特定样式（使用 `style` 属性）。 **DOM2 Style 为这 3 种应用样式的机制都提供了 API** ；

+ 任何支持 style 属性的 HTML 元素在 JavaScript 中都会有一个对应的 style 属性；
+ HTML style 属性中的 CSS 属性在 JavaScript style 对象中都有对应的属性；
+ float 是 JavaScript 的保留字，所以不能用作属性名； DOM2 Style 规定它在 style 对象中对应的属性应该是 cssFloat；
+ 在标准模式下，所有尺寸都必须包含单位，否则会被忽略；

DOM2 Style 规范也在 style 对象上定义了一些属性和方法，提供了元素 style 属性的信息并支持修改；

DOM2 Style在 document.defaultView 上增加了 getComputedStyle() 方法，用于取得元素和伪元素（如":after"）的计算样式；

---

CSSStyleSheet 类型表示 CSS 样式表，包括使用`<link>`元素和通过`<style>`元素定义的样式表。
注意，这两个元素本身分别是 `HTMLLinkElement` 和 `HTMLStyleElement`。  

CSSStyleSheet类型继承StyleSheet，后者可用作非 CSS样式表的基类；

document.styleSheets 表示文档中可用的样式表集合；

CSSRule 类型表示样式表中的一条规则。这个类型也是一个通用基类，很多类型都继承它，但其中最常用的是表示样式信息的 CSSStyleRule；

+ DOM 规定，可以使用 insertRule()方法向样式表中添加新规则；
+ 从样式表中删除规则的 DOM 方法是 deleteRule()；

---

**偏移尺寸**（ offset dimensions），包含元素在屏幕上占用的所有视觉空间。元素在页
面上的视觉空间由其高度和宽度决定，包括所有内边距、滚动条和边框（但不包含外边距）。

 4 个属性用于取得元素的偏移尺寸，offsetHeight，offsetLeft，offsetTop，offsetWidth；

offsetLeft 和 offsetTop 是相对于包含元素的，包含元素保存在 offsetParent 属性中；offsetParent 不一定是 parentNode。  

要确定一个元素在页面中的偏移量，可以把它的 offsetLeft 和 offsetTop 属性分别与 offsetParent
的相同属性相加，一直加到根元素。  

一般来说，包含在`<div>`元素中所有元素都以`<body>`为其 offsetParent；

---

元素的**客户端尺寸**（ client dimensions）包含元素内容及其内边距所占用的空间。

+ clientWidth：内容区宽度加左、右内边距宽度；

+ clientHeight：内容区高度加上、下内边距高度；

客户端尺寸实际上就是元素内部的空间，因此不包含滚动条占用的空间；

这两个属性最常用于确定浏览器视口尺寸，即检测 document.documentElement 的 clientWidth 和 clientHeight；

---

滚动尺寸（ scroll dimensions），提供了元素内容滚动距离的信息。`<html>`无须任何代码就可以自动滚动，而其他元素则需要使用 CSS 的 overflow 属性令其滚动。滚动尺寸相关的属性有如下 4 个。scrollHeight，scrollLeft，scrollTop，scrollWidth；

浏览器在每个元素上都暴露了 getBoundingClientRect()方法，返回一个 DOMRect 对象，包含6 个属性： left、 top、 right、 bottom、 height 和 width；

## 遍历

DOM2 Traversal and Range 模块定义了两个类型 NodeIterator 和 TreeWalker  用于辅助顺序遍历 DOM 结构， 从某个起点开始执行对 DOM 结构的深度优先遍历；

 可以通过 `document.createNodeIterator()` 方法创建其实例：

+ whatToShow 参数是一个位掩码，通过应用一个或多个过滤器来指定访问哪些节点；

+ filter 参数可以用来指定自定义 NodeFilter 对象，或者一个作为节点过滤器的函数；  
  + NodeFilter 对象只有一个方法 `acceptNode()`，如果给定节点应该访问就返回 NodeFilter.FILTER_ACCEPT，否则返回 NodeFilter.FILTER_SKIP；

要创建一个简单的遍历所有节点的 NodeIterator，可以使用以下代码：
```js
let iterator = document.createNodeIterator(document, NodeFilter.SHOW_ALL, null, false);
```

NodeIterator 的两个主要方法是 `nextNode()` 和 `previousNode()`；

以下面的 HTML 片段为例：

```html
<div id="div">
    <p><b>Hello</b> world!</p>
    <ul>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
    </ul>
</div>
```

假设想要遍历`<div>`元素内部的所有元素，那么可以使用如下代码：

```js
let div = document.getElementById("div");
let iterator = document.createNodeIterator(div, NodeFilter.SHOW_ELEMENT,null, false);
let node = iterator.nextNode();
while (node !== null) {
    console.log(node.tagName); // 输出标签名
    node = iterator.nextNode();
} 
```

如果只想遍历`<li>`元素，可以传入一个过滤器，比如：
```js
let div = document.getElementById("div1");
let filter = function(node) {
    return node.tagName.toLowerCase() == "li" ?
        NodeFilter.FILTER_ACCEPT :
    NodeFilter.FILTER_SKIP;
};
let iterator = document.createNodeIterator(div, NodeFilter.SHOW_ELEMENT,
                                           filter, false);  
```

---

TreeWalker 是 NodeIterator 的高级版。除了包含同样的 nextNode()、 previousNode()方法，TreeWalker 还添加了如下在 DOM 结构中向不同方向遍历的方法。
+ parentNode()，遍历到当前节点的父节点。
+ firstChild()，遍历到当前节点的第一个子节点。
+ lastChild()，遍历到当前节点的最后一个子节点。
+ nextSibling()，遍历到当前节点的下一个同胞节点。
+ previousSibling()，遍历到当前节点的上一个同胞节点。  

TreeWalker 对 象 要 调用 document.createTreeWalker() 方法来创建 ，

+ 节点过滤器（ filter）除了可以返回 NodeFilter.FILTER_ACCEPT 和 NodeFilter.FILTER_SKIP，还可以返回 NodeFilter.FILTER_REJECT。  
+ NodeFilter.FILTER_REJECT 则表示跳过该节点以及该节点的整个子树；
+  firstChild()，nextSibling()，currentNode  

## 范围

DOM2 在 Document 类型上定义了一个 `createRange()` 方法，暴露在 document 对象上。使用这个方法可以创建一个 DOM 范围对象；

通过范围选择文档中某个部分最简单的方式，就是使用 

+ `selectNode()`：选择整个节点，包括其后代节点；
+ `selectNodeContents()`：只选择节点的后代；

要创建复杂的范围，需要使用 `setStart()` 和 `setEnd()` 方法；

+ setStart()，参照节点会成为 startContainer，而偏移量会赋值给 startOffset；
+ setEnd()，参照节点会成为 endContainer，而偏移量会赋值给 endOffset；
