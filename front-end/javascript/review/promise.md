想要知道 promise 对象有没有被回收掉，可以在控制台使用 `queryObjects(Constructor)` ：

- `queryObjects(Promise)`。返回 `Promise` 的所有实例。
- `queryObjects(HTMLElement)`：返回所有 HTML 元素。

`queryObjects(Promise)` 做的是就是先手动执行一次垃圾回收，然后输出当前页面内存里还存在的 Promise 对象。

