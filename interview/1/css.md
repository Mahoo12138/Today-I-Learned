# 圣杯布局和双飞翼布局的理解和区别，并用代码实现

作用：圣杯布局和双飞翼布局解决的问题是一样的，就是两边顶宽，中间自适应的三栏布局，中间栏要在放在文档流前面以优先渲染。

区别：三栏都使用左浮动，左栏使用 `margin-left: -100%` 偏移到左侧，右栏使用 `margin-right: 2x0px` 偏移到右侧；
区别在于圣杯布局使用父容器的 padding 做防遮挡，而双飞翼在中间容器内创建子容器，使用 margin 做防遮挡：

+ 圣杯布局，为了中间 div 内容不被遮挡，将中间 div 设置了左右 padding-left 和 padding-right 后，将左右两个 div 用相对布局 position: relative 并分别配合 right 和 left 属性，以便左右两栏 div 移动后不遮挡中间 div。

+ 双飞翼布局，为了中间 div 内容不被遮挡，直接在中间 div 内部创建子 div 用于放置内容，在该子 div 里用 margin-left 和margin-right 为左右两栏 div 留出位置。