## CSS 多列布局
定义了多栏布局的模块，可支持在布局中建立列（column）的数量，以及内容如何在列之间流动（flow）、列之间的间距（gap）大小，以及列的分隔线（column rules）。

### column-count 
描述元素的列数，类似的，还有 `column-width` 使用宽度代替具体列数；

### column-gap
设置元素列之间的间隔大小，Flexible Box以及 Grid layouts 都可以使用；

### column-rule 
规定了列与列之间的直线，该包括三个属性：width，style 和 color，可单独设置；

### column-span 
其值被设置为all时，可以让一个元素跨越所有的列；

## CSS 计数器


### counter-increment
将计数器增加给定值

### counter-reset
用于将计数器重置为给定值

### 读取计数器
+ 不包含父级上下文的编号使用 `counter()`;
+ 包含父级上下文和嵌套内容的编号时，则使用 `counters()`; 


### 反向计数器
在 `counter-reset` 属性中将计数器的名称使用 `reversed()` 函数包裹来创建