# 实现  Function.prototype.bind

[`Function`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function) 实例的 **`bind()`** 方法创建一个新函数，这点是跟 `apply` 和 `call` 不一样的地方，它会调用原始函数并将其 `this` 关键字设置为给定的值，同时，还可以传入一系列指定的参数，这些参数会插入到调用新函数时传入的参数的前面。

例如，以下几行代码执行结果是一致的：

- `fn.call(context, 1, 2, 3, 4)`
- `fn.apply(context, [1, 2, 3, 4])`
- `fn.bind(context, 1, 2)(3, 4)`

`bind()` 函数创建一个新的_绑定函数_（bound function）。调用绑定函数通常会执行其所包装的函数，也称为_目标函数_（target function）。绑定函数将绑定时传入的参数（包括 `this` 的值和前几个参数）提前存储为其内部状态。

```js
var obj = {
    name: '若川',
};
function original(a, b){
    console.log(this.name);
    console.log([a, b]);
    return false;
}
var bound = original.bind(obj, 1);
var boundResult = bound(2); // '若川', [1, 2]

console.log(boundResult); // false
console.log(original.bind.name); // 'bind'
console.log(original.bind.length); // 1
console.log(original.bind().length); // 2 返回 original 函数的形参个数
console.log(bound.name); // 'bound original'

console.log((function(){}).bind().name); // 'bound '
console.log((function(){}).bind().length); // 0
```

+ 传给`bind()`的其他参数接收处理了，`bind()`之后返回的函数的参数也接收处理了，类似[[ch4|柯里化]]了。
+ `bind()`后的`name`为`bound + 空格 + 调用bind的函数名`。如果是匿名函数则是`bound + 空格`。
+ `bind`函数形参（即函数的`length`）是`1`。`bind`后返回的`bound`函数形参不定，根据绑定的函数原函数（`original`）形参个数确定。

基于上述特点，我们就可以简单模拟实现一个简版`bindFn`：

```js
Function.prototype.bindFn = function bind(thisArg){
    // 只有函数能调用 bind 方法
    if(typeof this !== 'function'){
        throw new TypeError(this + 'must be a function');
    }
    var self = this;
    var args = [].slice(arguments, 1);
    var bound = function() {
        // bind 返回的函数的参数转成数组
        var boundArgs = [].slice.call(arguments);
        // apply 修改 this 指向，把两个函数的参数合并传给 self 函数，并执行且返回执行结果
        return self.apply(thisArg, args.concat(boundArgs))
    }
    return bound;
}
```

我们知道函数是可以用`new`来实例化的。那么`bind()`返回值函数会是什么表现呢：

```js
var obj = {
    name: '若川',
};
function original(a, b){
    console.log('this', this); // original {}
    console.log('typeof this', typeof this); // object
    this.name = b;
    console.log('name', this.name); // 2
    console.log('this', this);  // original {name: 2}
    console.log([a, b]); // 1, 2
}
var bound = original.bind(obj, 1);
var newBoundResult = new bound(2);
console.log(newBoundResult, 'newBoundResult'); // original {name: 2}
```

从上述代码中，可以看出`this`指向了`new bound()`生成的新对象。

+ `bind`原先指向`obj`的失效了，其他参数有效。
+ `new bound`的返回值是以`original`原函数构造器生成的新对象。`original`原函数的`this`指向的就是这个新对象。 

也就是说，在调用 `new` 构造新的对象时，无视了 `bind` 的原本的逻辑，然后保持以`bind`调用的函数作为构造函数执行 `new` 逻辑；

这就需要了解 [[front-end/interview/bytedance/2#手写题：实现 new 方法|new]] 做了什么：

> 1. 创建了一个全新的对象。
> 2. 这个对象会被执行`[[Prototype]]`（也就是`__proto__`）链接。
> 3. 生成的新对象会绑定到函数调用的 this。
> 4. 通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
> 5. 如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，那么`new`表达式中的函数调用会自动返回这个新的对象。

总之，`bound`函数被`new`调用时，`bind`内部要模拟实现`new` 实现的操作：

```js
// 第三版 实现new调用
Function.prototype.bindFn = function bind(thisArg){
    if(typeof this !== 'function'){
        throw new TypeError(this + ' must be a function');
    }
    // 存储调用bind的函数本身
    var self = this;
    // 去除thisArg的其他参数 转成数组
    var args = [].slice.call(arguments, 1);
    var bound = function(){
        // bind返回的函数 的参数转成数组
        var boundArgs = [].slice.call(arguments);
        var finalArgs = args.concat(boundArgs);
        // new 调用时，其实 this instanceof bound 判断也不是很准确
        // es6 new.target就是解决这一问题的。
        if(this instanceof bound){
            // 这里是实现上文描述的 new 的第 1, 2, 4 步
            // 1.创建一个全新的对象
            // 2.并且执行[[Prototype]]链接
            // 4.通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
            // self可能是ES6的箭头函数，没有prototype，所以就没必要再指向做prototype操作。
            if(self.prototype){
                // ES5 提供的方案 Object.create()
                // bound.prototype = Object.create(self.prototype);
                // 但 既然是模拟ES5的bind，那浏览器也基本没有实现Object.create()
                // 所以采用 MDN ployfill方案 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create
                function Empty(){}
                Empty.prototype = self.prototype;
                bound.prototype = new Empty();
            }
            // 这里是实现上文描述的 new 的第 3 步
            // 3.生成的新对象会绑定到函数调用的`this`。
            var result = self.apply(this, finalArgs);
            // 这里是实现上文描述的 new 的第 5 步
            // 5.如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，
            // 那么`new`表达式中的函数调用会自动返回这个新的对象。
            var isObject = typeof result === 'object' && result !== null;
            var isFunction = typeof result === 'function';
            if(isObject || isFunction){
                return result;
            }
            return this;
        }
        else{
            // apply 修改 this 指向，把两个函数的参数合并传给self函数
            // 并执行self函数，返回执行结果
            return self.apply(thisArg, finalArgs);
        }
    };
    return bound;
}
```

上文注释中提到`this instanceof bound`也不是很准确，`ES6 new.target`很好的解决这一问题，我们举个例子：

```js
function Student(name){
    if(this instanceof Student){
        this.name = name;
        console.log('name', name);
    }
    else{
        throw new Error('必须通过new关键字来调用Student。');
    }
}
var student = new Student('若');
var notAStudent = Student.call(student, '川'); // 不抛出错误，且执行了。
console.log(student, 'student', notAStudent, 'notAStudent');

function Student2(name){
    if(typeof new.target !== 'undefined'){
        this.name = name;
        console.log('name', name);
    }
    else{
        throw new Error('必须通过new关键字来调用Student2。');
    }
}
var student2 = new Student2('若');
var notAStudent2 = Student2.call(student2, '川');
console.log(student2, 'student2', notAStudent2, 'notAStudent2'); // 抛出错误
```

---
## 如何判断函数是正常调用还是 new 调用

1. 使用 `instanceof` 运算符来判断 `this` 是否是函数的实例：

   ```js
   function MyFunction() {
     if (this instanceof MyFunction) {
       console.log('Called with new');
     } else {
       console.log('Called without new');
     }
   }
   ```

2. 在 ES6 中引入了 `new.target`，它可以更直接地判断函数是如何被调用。如果函数是通过 `new` 关键字调用的，`new.target` 将指向该函数；如果函数不是通过 `new` 调用的，`new.target` 将是 `undefined`：

   ```js
   function MyFunction() {
     if (new.target) {
       console.log('Called with new');
     } else {
       console.log('Called without new');
     }
   }
   ```

---

上述的代码没有实现`bind`后的`bound`函数的`name`和`length`。面试官可能也发现了这一点继续追问，如何实现，或者问是否看过[`es5-shim`的源码实现`L201-L335`](https://github.com/es-shims/es5-shim/blob/master/es5-shim.js#L201-L335)。如果不限`ES`版本。其实可以用`ES5`的`Object.defineProperties`来实现：

```js
Object.defineProperties(bound, {
    'length': {
        value: self.length,
    },
    'name': {
        value: 'bound ' + self.name,
    }
});
```

## `es5-shim` 的源码实现 `bind` 说明

```js

var binder = function () {...}

bound = Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);
```

其中，是以 `Function` 构造方式生成形参`length $1, $2, $3`... 

## 总结一下

1. `bind`是`Function`原型链中的`Function.prototype`的一个属性，它是一个函数，修改`this`指向，合并参数传递给原函数，返回值是一个新的函数。  
2. `bind`返回的函数可以通过`new`调用，这时提供的`this`的参数被忽略，指向了`new`生成的全新对象。内部模拟实现了`new`操作符。  
3. `es5-shim`源码模拟实现`bind`时用 `Function`构造函数实现了`length`。

  

