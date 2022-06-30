## Selectors API
Selectors API 是 W3C 推荐标准，规定了浏览器原生支持的 CSS 查询 API；
Selectors API Level 1 核心是两个方法： 
+ `querySelector()`
+ `querySelectorAll()`

Selectors API Level 2 规范在 Element 类型上新增了更多方法，比如 `matches()`、 `find()` 和 `findAll()`；

### querySelector()  

querySelector()方法接收 CSS 选择符参数，返回匹配该模式的第一个后代元素，如果没有匹配项则返回 null；

### querySelectorAll() 

返回的是一个 NodeList 的**静态实例**，这样的底层实现避免了使用 NodeList 对象可能造成的性能问题；

### matches()

接收一个 CSS 选择符参数，如果元素匹配则该选择符返回 true，否则返回 false；

## 元素遍历

Element Traversal API 为 DOM 元素添加了 5 个属性：
 + `childElementCount`，返回子元素数量（不包含文本节点和注释）；
 + `firstElementChild`，指向第一个 Element 类型的子元素（ Element 版 firstChild）；
 + `lastElementChild`，指向最后一个 Element 类型的子元素（ Element 版 lastChild）；
 + `previousElementSibling` ， 指 向 前 一 个 Element 类 型 的 同 胞 元 素 （ Element 版
previousSibling）；
 + `nextElementSibling`，指向后一个 Element 类型的同胞元素（ Element 版 nextSibling）。

## HTML5

HTML5 代表着与以前的 HTML 截然不同的方向。在所有以前的 HTML 规范中，从未出现过描述
JavaScript 接口的情形；

### CSS 类扩展  

`getElementsByClassName() `接收一个参数，即包含一个或多个类名的字符串，返回类名中
包含相应类的元素的 NodeList。**如果提供了多个类名，则顺序无关紧要**；

要操作类名，可以通过 `className` 属性实现添加、删除和替换；

classList 是一个新的集合类型 DOMTokenList 的实例。  提供 add(value)，contains(value)，remove(value)，toggle(value)方法进行操作；

### 焦点管理

+ `document.activeElement`，始终包含当前拥有焦点的 DOM 元素； 
+ 默认情况下， `document.activeElement` 在页面刚加载完之后会设置为 document.body；
+ `document.hasFocus()`方法，该方法返回布尔值，表示文档是否拥有焦点；

### HTMLDocument 扩展  

+ `document.readState` 返回 loading / complete，以判断文档是否加载完毕；
+ 标准模式下 `document.compatMode` 的值是"**CSS1Compat**"，而在混杂模式下，
  `document.compatMode` 的值是"**BackCompat**" ；
+ HTML5 增加了 `document.head` 属性，指向文档的`<head>`元素；

### 字符集属性

+ characterSet 属性表示文档实际使用的字符集；

### 自定义数据属性

+ HTML5 允许给元素指定非标准的属性，但要使用前缀 data-以便告诉浏览器；
+ 定义了自定义数据属性后，可以通过元素的 dataset 属性来访问。 
+ **dataset** 属性是一个 `DOMStringMap` 的实例，其中通过 data-后面的字符串作为键来访问；

### 插入标记

+ 在读取 innerHTML 属性时，会返回元素所有后代的 HTML 字符串，包括元素、注释和文本节点；
+ 在写入 innerHTML 时，则会根据提供的字符串值以新的 DOM 子树替代元素中原来包含的所有节点；
+ 实际返回的文本内容会因浏览器而不同，若不包含任何 HTML 标签，则直接生成一个文本节点；
+ 在所有现代浏览器中，通过 innerHTML 插入的`<script>`标签是不会执行的；

---

+ 读取 outerHTML 属性时，会返回调用**它的元素**（及所有后代元素）的 HTML 字符串；
+ 在写入outerHTML 属性时，调用它的元素会被传入的 HTML 字符串经解释之后生成的 DOM 子树取代；  

---

+ `insertAdjacentHTML()`和 `insertAdjacentText()`；
+ 这两个方法最早源自 IE，它们都接收两个参数：要插入标记的位置和要插入的 HTML 或文本； 
+ insertAdjacentHTML()和 insertAdjacentText()。这两
  个方法最早源自 IE，它们都接收两个参数：要插入标记的位置和要插入的 HTML 或文本；
  + "beforebegin"，插入当前元素前面，作为前一个同胞节点；
  + "afterbegin"，插入当前元素内部，作为新的子节点或放在第一个子节点前面；
  + "beforeend"，插入当前元素内部，作为新的子节点或放在最后一个子节点后面；
  + "afterend"，插入当前元素后面，作为下一个同胞节点；
  

### scrollIntoView()

`scrollIntoView()`方法存在于所有 HTML 元素上，可以滚动浏览器窗口或容器元素以便包含元
素进入视口。这个方法的参数如下：

 + `alignToTop` 是一个布尔值：
   + **true**：窗口滚动后元素的顶部与视口顶部对齐。
   + **false**：窗口滚动后元素的底部与视口底部对齐。

 + `scrollIntoViewOptions` 是一个选项对象：
   + **behavior**：定义过渡动画，可取的值为"smooth"和"auto"，默认为"auto"。
   + **block**：定义垂直方向的对齐，可取的值为"start"、 "center"、 "end"和"nearest"，默
     认为 "start"。
   + **inline**：定义水平方向的对齐，可取的值为"start"、 "center"、 "end"和"nearest"，默
     认为 "nearest"。

 + 不传参数等同于 alignToTop 为 true；


## 专有扩展

### children 属性

+ children 属性是一个 HTMLCollection，只包含元素的 Element 类型的子节点；

+ 如果元素的子节点类型全部是元素类型，那 children 和 childNodes 中包含的节点应该是一样的；

### contains()方法

+ 如果目标节点是被搜索节点的后代， contains()返回 true，否则返回 false  ；
+ 使用 DOM Level 3 的 compareDocumentPosition()方法也可以确定节点间的关系；

### 插入标记  

+ innerText 属性对应元素中包含的所有文本内容，无论文本在子树中哪个层级；
+ 设置 innerText 会移除元素之前所有的后代节点，完全改变 DOM 子树；
+ 因为设置 innerText 只能在容器元素中生成一个文本节点，所以为了保证一定是文本节点，就必
  须进行 HTML 编码；

### outerText 属性  

+ 要读取文本值时，outerText 与 innerText 实际上会返回同样的内容；
+ 在写入文本值时，outerText 不止会移除所有后代节点，而是会替换整个元素；
+ 本质上，这相当于用新的文本节点替代 outerText 所在的元素；
+ 此时，原来的元素会与文档脱离关系，因此也无法访问。

### 滚动  

+ `scrollIntoViewIfNeeded(alingCenter)` 会在元素不可见的情况下，将其滚动到窗口或包含窗口中，使其可见；

+ 如果已经在视口中可见，则这个方法什么也不做。

+ 如果将可选的参数 alingCenter 设置为 true，则浏览器会尝试将其放在视口中央。   
