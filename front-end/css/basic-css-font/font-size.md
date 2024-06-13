# Web 字体渲染之 font-size

`font-size` 不一定等于字体实际占用的高度，而且不同字体实际占用的高度也并不相同。

![](times-and-arial-font-size-comparison.png)

如上图设置 `font-size: 100px` 时，Times 和 Arial 两个字体渲染结果实际高度都超过了 100px，分别为 111px 和 112px。

Web 渲染过程中，字体实际占用的高度是由字体的度量决定的。字体度量（Font Metrics）指的是描述字体形态的一系列参数，这些参数决定了一款字体的高矮胖瘦、字距行距等视觉呈现。这些度量数据连同其他的元数据一起被保存在字体文件的 [Font Tables](https://learn.microsoft.com/en-us/typography/opentype/spec/otff#font-tables) 中，你可以使用[这个网站](https://fontdrop.info/)查看 Font Tables：上传字体文件，选择下方的 Data 选项卡就可以看到所有 Font Tables 及其中的元数据。

众多度量参数中，决定字体渲染高度的两个主要参数是 `ascender` 和 `descender`，中文分别称为上升部和下降部。

上升部和下降部是西文字体设计中的两个概念，如果你还对学习英语字母书写时使用的四线格有印象，它可以帮助我们直观地理解上升部和下降部：四线格中第一线到第三线之间可以理解为上升部，第三线到第四线之间可以理解为下降部。（需要注意的是这里只是方便理解，实际的字体设计中一个字母并不会像四线格写法一样完全填满上升部或下降部。）

![](alphabets-written-in-four-line-form.jpg)

> 四线格可以帮助我们直观的理解上升部、下降部和基线的概念。

正如四线格中第一线和第四线限制了所有字母的高度，字体渲染时占用的高度也对应地等于上升部高度 + 下降部高度，这一高度可以保证容纳绝大多数字符（少数字符高度可能超过上升部高度 + 下降部高度，超出部分会正常渲染，但不会额外占用高度）。

对应到字体度量中即 `ascender + |descender|`，你可以在 hhea(Horizontal Header Table) 中找到这两个度量的值。

以 Arial 字体为例，`ascender` 和 `descender` 的度量值分别为 `1854` 和 `-434`：

![](hhea-of-arial.png)

> 由于历史原因，字体中一般有三组 `ascender`、`descender` 度量值，除了 hhea 中的一组，另外两组保存在 OS/2(OS/2 and Windows Metrics Table) 中，名称分别为 `sTypoAscender`、`sTypoDescender` 和 `usWinAscent`、`usWinDescent`。虽然 [W3C 对度量的使用给出了建议](https://www.w3.org/TR/css-inline-3/#ascent-descent)，但不同浏览器在不同系统下仍会使用不同的度量：一般在 Mac 下会使用 `ascender`、`descender`，而 Windows 下会使用 `usWinAscent`、`usWinDescent`。不同浏览器在不同系统下的具体表现这里不展开讨论。

根据上面的定义可以知道：Arial 字体渲染时实际占用的高度为 `1854 + |-434| = 2288`。这个值的单位是 unit，可以理解为字体的网格，即 Arial 字体渲染时占用 2288 个网格。到这里，距离得到字体渲染高度就只差最后一步：确定网格的尺寸。这就涉及到另一个字体度量：`unitPerEm`。

`unitPerEm` 这个度量表示了字号与网格数的映射关系，我们可以通过这个度量值求出不同字号下的网格尺寸。比如当 `unitPerEm` 为 1000 时，`font-size: 20px` 对应的网格尺寸就是 `20px / 1000 = 0.02px`，而 `font-size: 100px` 对应的网格尺寸就是 `0.1px`。`unitPerEm` 的度量值可以在 head(Font Header Table) 中找到。仍然以 Arial 字体为例，其 `unitPerEm` 为 `2048`。

![](hhea-of-arial.png)

根据上面的对应关系和度量值，我们可以计算出 `font-size: 100px` 时 Arial 字体的网格尺寸为 `100px / 2048 = 0.048828125px`，进而可以得到字体渲染的实际高度为 `0.048828125px * 2288 = 111.71875px`，实际渲染时四舍五入为 `112px`。至此，我们算是解决了文章开头的第二个问题。

而要回答为什么字体渲染高度不等于 `font-size`，我们还要从 `unitPerEm` 这个度量说起。在上面的计算中逻辑中，很容易发现 `unitPerEm` 是造成 `font-size` 不等于实际渲染高度的关键。如果我们在计算网格尺寸时直接使用上升部与下降部网格数之和，最终就可以得到与 `font-size` 相等的字体高度。那么这个 `unitPerEm` 究竟是做什么用的？

从字面意思上不难理解 `unitPerEm` 表示每个 em 包含的网格数，那么这个 em 又是什么呢？这又要追溯到金属活字排印时代了。在金属活字排印中，[em 是一个计量单位](https://zh.wikipedia.org/wiki/Em_(%E5%AD%97%E4%BD%93%E6%8E%92%E5%8D%B0%E5%AD%A6))，它表示字体中大写 M 的宽度及所用的尺寸。由于字母 M 在所有字母中占用最大的面积，且具有合适的长宽比，所以字母 M 所在字模的尺寸被用来当作基准尺寸。根据上面的定义，在金属活字排印中所有字模的高度都为 em，而宽度都小于等于 em，因此~~左右~~所有字母都可以容纳在一个 em * em 的正方形中（下图中 c 所标注的长度就是 em），这个正方形也被称为 [Em Square](https://designwithfontforge.com/zh-CN/The_EM_Square.html)。

![](metal-type.svg)
em 最重要的作用就是确定字号，em 的实际长度就对应当前的字号。根据这个规则，20pt 字号对应字模的 em 就是 20pt。可以看到，金属活字排印时期字体实际占用的高度等于 em（因为字模的高度就是 em），又因为 em 在每个字号下都等于字号，所以字体的高度是与字号相等的。

进入到数码排印时代，em 被继承下来用来定义字号，`unitPerEm` 被用来定义 em 与网格的关系。而与金属活字排印不同，数码字体中的字形可以超出 Em Square 的范围，排版引擎不能继续使用 em 来确定字体高度，所以转而使用上升部 + 下降部。这样，字号只与 em 相关，而实际渲染的字体高度则与 em 没有直接关系，最终造成了字体渲染高度与字号无关的结果。

传统的字体与排印技术因计算机的引入焕发了新的生机，许多之前不可能出现的字体设计和排印效果在计算机的帮助下被轻松实现，解锁更多能力的同时也对使用者提出了更高的要求。Web 字体渲染技术作为数码排印技术的一个分支，也有许多内容值得研究学习。这篇文章研究了 `font-size` 背后的机制，至于不同字号混排、行高、对齐等内容，会在后面的文章做进一步的研究。



## 相关页面

+ [Web 字体渲染之 font-size](https://www.zjy.name/web-font-render-font-size/)