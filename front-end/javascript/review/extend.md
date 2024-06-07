# 继承

在`JavaScript`ES6之前，实现继承需要依赖原型、原型链和构造函数等等技术手段组合使用，在ES6之后，可以使用`Class`类继承(并没有真正的类，只是一个语法糖，实质依然是函数)。

继承的几种方式：

1. 原型链实现继承
2. 借用构造函数实现继承
3. 组合继承
4. 寄生组合继承
5. ES6 Class 继承

## 原型链实现继承

通过重写子类的原型，并将它指向父类的手段实现。这种方式实现的继承，创建出来的实例既是子类的实例，又是父类的实例。它有如下几种缺陷：

1. 不能向父类构造函数传参
2. 父类上的引用类型属性会被所有实例共享，其中一个实例改变时，会影响其他实例；

```js
function Animal() {
  this.colors = ['red','blue'];
}
function Dog(name) {
  this.name = name;
}
Dog.prototype = new Animal();

var dog1 = new Dog('旺财');
var dog2 = new Dog('钢镚');

dog2.colors.push('yellow');
console.log(dog1.colors); // ["red", "blue", "yellow"]
console.log(dog2.colors); // ["red", "blue", "yellow"]

console.log(dog1 instanceof Dog);   // true
console.log(dog1 instanceof Animal);// true
```

## 借用构造函数实现继承

借用构造函数实现继承，通过在子类中使用`call()`方法，实现借用父类构造函数并向父类构造函数传参的目的。但这种方法，无法继承父类原型对象上的属性和方法。

```js
function Animal(name) {
  this.name = name;
  this.colors = ['red','blue'];
}
Animal.prototype.eat = function() {
  console.log(this.name + ' is eating!');
}
function Dog(name) {
  Animal.call(this,name);
}

var dog1 = new Dog('旺财');
var dog2 = new Dog('钢镚');

dog2.colors.push('yellow');

console.log(dog1.colors); // ["red", "blue"]
console.log(dog2.colors); // ["red", "blue", "yellow"]

console.log(dog1 instanceof Dog);   // true
console.log(dog2 instanceof Animal);// false

console.log(dog1.eat()); // 报错
```

## 组合继承

组合继承是组合了原型链继承和借用构造函数继承这两种方法，它保留了两种继承方式的优点，但它并不是百分百完美的：

- 父类构造函数被调用多次。

```js
function Animal(name) {
  this.name = name;
  this.colors = ['red','blue'];
}
Animal.prototype.eat = function() {
  console.log(this.name + ' is eatting');
}
function Dog(name) {
  Animal.call(this,name);
}
Dog.prototype = new Animal(); // 第一次调用
var dog1 = new Dog('dog1');   // 第二次调用
var dog2 = new Dog('dog2');   // 第三次调用
dog1.colors.push('yellow');
console.log(dog1.name);  // 输出dog1
console.log(dog2.colors);// 输出['red','blue']
console.log(dog2.eat()); // 输出dog2 is eatting
```

## 寄生组合继承

寄生组合继承是在组合继承的基础上，采用`Object.create()`方法来改造实现

```js
function Animal(name) {
  this.name = name;
  this.colors = ['red','blue'];
}
Animal.prototype.eat = function() {
  console.log(this.name + ' is eatting');
}
function Dog(name) {
  Animal.call(this,name);
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
var dog1 = new Dog('dog1');
var dog2 = new Dog('dog2');
dog1.colors.push('yellow');
console.log(dog1.name);  // 输出dog1
console.log(dog2.colors);// 输出['red','blue']
console.log(dog2.eat()); // 输出dog2 is eatting
```

## ES6 Class 继承

```js
class Animal {
  constructor(name) {
    this.name = name;
    this.colors = ['red','blue'];
  }
  eat() {
    console.log(this.name + ' is eatting');
  }
}
class Dog extends Animal {
  constructor(name) {
    super(name);
  }
}
var dog1 = new Dog('dog1');
var dog2 = new Dog('dog2');

dog1.colors.push('yellow');
console.log(dog1.name);  // 输出dog1
console.log(dog2.colors);// 输出['red','blue']
console.log(dog2.eat()); // 输出dog2 is eatting
```