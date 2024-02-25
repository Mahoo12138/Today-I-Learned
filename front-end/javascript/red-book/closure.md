## 闭包

```js
window.identity = 'The Window';
let object = {
    identity: 'My Object',
    getIdentity () {
        return this.identity;
    }
};
```

因为赋值表达式的值是函数本身， this 值不再与任何对象绑定，所以：

```js
(object.getIdentity = object.getIdentity)(); // 'The Window'
```

## IIFE

```js
let divs = document.querySelectorAll('div');
// 达不到目的！
for (var i = 0; i < divs.length; ++i) {
    divs[i].addEventListener('click', function() {
        console.log(i);
    });
}
```

虽然循环体结束了，但是`addEventListener`内部的匿名函数执行时 i 的值都是最后的索引，而且循环体外部也能获取到该值；

以往的操作是，借助**IIFE**执行函数表达式，即将匿名函数改成一个带参函数，类似一个闭包将索引保存到匿名函数外部作用域：

```js
for (var i = 0; i < divs.length; ++i) {
    divs[i].addEventListener('click', (function(frozenCounter) {
        return function() {
            console.log(frozenCounter);
        };
    })(i));
}
```

块级作用域变量 ，则直接使用`let`声明：

```js
for (let i = 0; i < divs.length; ++i) {}
```

但是将`let i;`声明在循环块级作用域外部，也就等价于使用`var`了；

> 立即调用的函数表达式如果不在包含作用域中将返回值赋给一个变量，则其包含的所有变量都
> 会被销毁；

## 私有变量

+ 把所有私有变量和私有函数都定义在构造函数中；
+ 创建一个能够访问这些私有成员的特权方法；

原理是定义在构造函数中的特权方法是一个闭包，具有访问构造函数中定义的所有变量和函数的能力；

### 静态私有变量

创建了一个包含构造函数及其方法的 IIFE 私有作用域，内部包含私有变量和函数，还有构造函数和以及在其原型上的公有方法：

```js
(function() {
    // 私有变量和私有函数
    let privateVariable = 10;
    function privateFunction() {
        return false;
    }
    // 构造函数
    MyObject = function() {};
    // 公有和特权方法
    MyObject.prototype.publicMethod = function() {
        privateVariable++;
        return privateFunction();
    };
})();
```

不使用关键字声明的变量会创建在全局作用域中，即 MyObject 为全局变量，可在这个私有作用域外部被访问。

在严格模式下给未声明的变量赋值会导致错误；

### 模块模式

模块模式是在单例对象基础上加以扩展，使其通过作用域链来关联私有变量和特权方法。  

匿名函数返回一个对象，在匿名函数内部，定义私有变量和私有函数；之后，创建一个要通过匿名函数返回的对象字面量，对象字面量中只包含可以公开访问的属性和方法：

```js
let singleton = function() {
    // 私有变量和私有函数
    let privateVariable = 10;
    function privateFunction() {
        return false;
    }
    // 特权/公有方法和属性
    return {
        publicProperty: true,
        publicMethod() {
            privateVariable++;
            return privateFunction();
        }
    };
}();
```

### 模块增强模式

即将**模块模式**返回的对象增强，使实例满足某种特定类型，则不能直接返回对象字面量，而是使用 `new`：

```js
let singleton = function() {
    // 私有变量和私有函数...
    
    // 创建对象
    let object = new CustomType();
    
    // 添加特权/公有属性和方法...
    // 返回对象
    return object;
}();
```

