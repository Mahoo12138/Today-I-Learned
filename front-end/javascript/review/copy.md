## 浅拷贝、深拷贝

### 浅拷贝的几种实现

`Object.assign()`会拷贝原始对象中的所有属性到一个新对象上，如果属性为对象，则拷贝的是对象的地址，改变对象中的属性值，新拷贝出来的对象依然会受影响。

使用`ES6`的 `...`扩展运算符。

### 深拷贝几种实现