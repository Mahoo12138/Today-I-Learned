# CSS 自定义属性（CSS Variable）

> 原文链接：[谈谈一些有趣的CSS题目（13）-- 引人瞩目的 CSS 自定义属性（CSS Variable） · Issue #58 · chokcoco/iCSS (github.com)](https://github.com/chokcoco/iCSS/issues/58)

[CSS 自定义属性](https://drafts.csswg.org/css-variables/)，顾名思义，也就是由网页的作者或用户定义的实体，用来指定文档中的特定变量；

常称作**CSS 变量**，但是，更准确的说法，应该称之为 **CSS 自定义属性**；

```css
// 声明一个变量：
:root{
  --bgColor:#000;
}
```

> `:root` 伪类匹配文档树的根元素；应用到HTML，`:root` 即表示为`<html>`元素，除了优先级更高外，相当于 html 标签选择器；

可通过["CSS Variables" | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/?search=CSS Variables)查看浏览器具体支持；

## CSS 变量的层叠与作用域

CSS 变量在局部定义的变量会覆盖祖先元素的定义，也就是作用域：

> 在 CSS 中，一个元素的实际属性是由其自身属性以及其祖先元素的属性层叠得到的，CSS 变量也支持层叠的特性，当一个属性没有在当前元素定义，则会转而使用其祖先元素的属性。在当前元素定义的属性，将会覆盖祖先元素的同名属性。

```css
:root{
  --mainColor:red;
}

div{
  --mainColor:blue;
  color:var(--mainColor);
}
```

> 注意的是 **CSS 变量并不支持 !important 声明**

## CSS 变量的组合

CSS 变量也可以进行组合使用：

```css
:root{
  --word:"this";
  --word-second:"is";
  --word-third:"CSS Variable";
}

div::before{
  content:var(--word)' 'var(--word-second)' 'var(--word-third);
}
```

## CSS 变量与计算属性 calc( )

CSS 变量可以结合 CSS3 新增的函数 calc( ) 一起使用：

```css
:root{
  --margin: 10px;
}

div{
  text-indent: calc(var(--margin)*10)
}
```

## CSS 变量的用途

### 1、代码更加符合 DRY（Don‘t repeat yourself）原则

现在 CSS 也能像SASS，LESS中一样使用通过定义变量，避免重复定义属性：

```css
:root{
  --mainColor:#fc0;
}
// 多个需要使用到的 --mainColor 的地方
.div1{
  color: var(--mainColor);
}
.div2{
  color: var(--mainColor);
}
```

### 2、精简代码，减少冗余，响应式媒体查询的好帮手

一般而言，使用媒体查询的时候，我们需要将要响应式改变的属性全部重新罗列一遍：

```css
.main {
	width: 1000px;
	margin-left: 100px;
}
@media screen and (min-width:1480px) {
	.main {
		width: 800px;
		margin-left: 50px;
	}
}
```

CSS 变量的出现让媒体查询更加的简单，只需改变修改变量定义即可：

```css
:root { 
  --mainWidth:1000px;
  --leftMargin:100px;
}

.main {
  width: var(--mainWidth);
  margin-left: var(--leftMargin);
}

@media screen and (min-width:1480px) {
	:root { 
	  --mainWidth:800px;
	  --leftMargin:50px;
	}
}
```

### 3、方便的从 JS 中读/写，统一修改

```js
:root{
  --testMargin:75px;
}

//  读取
var root = getComputedStyle(document.documentElement);
var cssVariable = root.getPropertyValue('--testMargin').trim();

console.log(cssVariable); // '75px'

// 写入
document.documentElement.style.setProperty('--testMargin', '100px');
```

## 与传统 LESS 、SASS 等预处理器变量比较

相较于传统的 LESS 、SASS 等预处理器变量，CSS 变量的优点在于:

1. CSS 变量的**动态性**，能在页面运行时更改，而传统预处理器变量编译后无法更改
2. CSS 变量能够继承，能够组合使用，**具有作用域**
3. **配合 Javascript 使用**，可以方便的从 JS 中读/写