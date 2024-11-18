# 继承类

## 超类(`Any`)

在`Kotlin`中，所有的类都是继承于`Any`类，这是个没有父类型的类。即当我们定义各类时，它默认是继承于`Any`这个超类的。

因为`Any`这个类只是给我们提供了`equals()`、`hashCode()`、`toString()`这三个方法。我们可以看看`Any`这个类的源码实现：

```kotlin
package kotlin  

public open class Any {  

    public open operator fun equals(other: Any?): Boolean  
  
    public open fun hashCode(): Int  
  
    public open fun toString(): String  
}
```

除了抽象类和接口默认是可被继承外，其他类默认是不可以被继承的（相当于默认都带有final修饰符）。而类中的方法也是默认不可以被继承的。
- 如果要继承一个类，需要使用`open`关键字修饰这个类;
- 如果要重写一个类的某个方法，这个方法也需要使用`open`关键字修饰；
## 构造函数

在 Kotlin 中可以有一个主构造函数，一个或者多个次构造函数。

### 主构造函数

主构造函数直接跟在类名后面，如下：  

```kotlin
open class Person constructor(var name: String, var age: Int) : Any() {
	//...
}
```

主构造函数中的属性可以是可变的（var）也可以是不变的（val）。如果主构造函数没有任何注解或者可见性修饰符，可以省略`constructor`关键字（属性默认是 val），而且 Koltin 中的类默认就是继承超类`Any`的，也可以省略。所以可以简化成如下：  

```kotlin
open class Person(name: String, age: Int) {
	//...
}
```

主构造函数不能包括任何代码。初始化代码可以放到以`init`关键字作为前缀的初始化块中：

```kotlin
open class Person constructor(var name: String, var age: Int){  
    init {  
        println("Student(name = $name, age = $age) created")  
    }  
}
```

主构造函数的参数可以在初始化块中使用，也可以在类体内申明的属性初始化器中使用。

### 次构造函数

我们也可以在类体中使用`constructor`申明次构造函数，次构造函数的参数不能使用 val 或者 var 申明。

```kotlin
class Student public constructor(name: String, age: Int) : Person(name, age) {  
    var grade: Int = 1  
  
    init {  
        println("Student(name = $name, age = $age) created")  
    }  
  
    constructor(name: String, age: Int, grade: Int) : this(name, age){  
        this.grade = grade  
    }  
}
```
## 重载与重写

当基类中的函数，没有用`open`修饰符修饰的时候，实现类中出现的函数的函数名不能与基类中没有用`open`修饰符修饰的函数的函数名相同，不管实现类中的该函数有无`override`修饰符修饰。

当一个类不是用`open`修饰符修饰时，这个类默认是`final`的。

继承时不想覆盖掉第一个基类的方法时，第二个基类的该方法可使用`final`修饰符修饰。

---

在基类中声明的属性，然后在其基类的实现类中重写该属性，该属性必须以`override`关键字修饰，并且其属性具有和基类中属性一样的类型。且可以重写该属性的值（`Getter`）。

当基类中属性的变量修饰符为`val`的使用，其实现类可以用重写属性可以用`var`去修饰。反之则不能。