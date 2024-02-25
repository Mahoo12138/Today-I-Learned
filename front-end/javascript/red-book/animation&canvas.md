### requestAnimationFrame  

Firefox 4 率先在浏览器中为 JavaScript 动画增加了一个名为 mozRequestAnimationFrame()方法的 API。  

+ 定时动画的问题在于无法准确知晓循环之间的延时。  

+ 如果同时运行多个动画，可能需要加以限流；

+ 无论 setInterval()还是 setTimeout()都是不能保证时间精度的，因为他们的第二个参数只能保证何时会把代码添加到浏览器的任务队列，不能保证添加到队列就会立即运行  。  

Mozilla 的 Robert O’Callahan 一直在思考这个问题，并提出了一个独特的方案。他指出，浏览器知道 CSS 过渡和动画应该什么时候开始，并据此计算出正确的时间间隔，到时间就去刷新用户界面。  

他给出的方案是创造一个名为 mozRequestAnimationFrame() 的新方法，用以通知浏览器某些 JavaScript 代码要执行动画了；

requestAnimationFrame()方法接收一个参数，此参数是一个要在重绘屏幕前调用的函数。这个函数就是修改 DOM 样式以反映下一次重绘有什么变化的地方。

  

与 setTimeout()类似， requestAnimationFrame()也返回一个请求 ID，可以用于通过另一个方法 cancelAnimationFrame()来取消重绘任务。  

### requestAnimationFrame 节流  

支持这个方法的浏览器实际上会暴露出作为钩子的回调队列。所谓钩子（ hook），就是浏览器在执行下一次重绘之前的一个点。  

通过 requestAnimationFrame()递归地向队列中加入回调函数，可以保证每次重绘最多只调用一次回调函数。这是一个非常好的节流工具。  

配合计时器，可以限制实际的操作执行间隔，而 requestAnimationFrame 控制在浏览器的哪个渲染周期中执行。  

## 画布 Canvas

要在画布上绘制图形，首先要取得绘图上下文。  

2D 上下文的坐标原点(0, 0)在 \<canvas> 元素的左上角；2D 上下文有两个基本绘制操作：填充和描边。

