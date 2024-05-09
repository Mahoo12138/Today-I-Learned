# object 关键字

Kotlin 中有一个重要的关键字 `object`，其主要使用场景有以下三种：
## 对象表达式

对象表达式用于生成匿名类的对象，该匿名类可以直接从`Any`开始创建，也可以继承自某一父类，或者实现某一接口。

```kotlin
val helloWorld = object {
    val hello = "Hello"
    val world = "World"
    // object expressions extend Any, so `override` is required on `toString()`
    override fun toString() = "$hello $world"
}
```



## 伴生对象

**companion object 是一个对象，在类初始化时被实例化。** 伴生对象不是类的 static 方法，而是类的实例化对象，所以在其内部可以声明接口，方法也可以被重写，具备面向对象的所有特点。

```kotlin
class MyClass {
    companion object Factory {
        fun create(): MyClass = MyClass()
    }
}

val instance = MyClass.create()
```


### 诞生原因

伴生对象 (companion object) 的出现是为了解决 Java 静态方法 (static) 的反面向对象（Anti-OOP）的问题。我们知道 Java中，static 方法是无法声明为接口，无法被重写的。

用学术性话语来说，static 方法没有面向对象的 **消息传递** 和 **延迟绑定** 特性（[参考](https://stackoverflow.com/questions/4002201/why-arent-static-methods-considered-good-oo-practice)）。而为了满足Kotlin 一切皆对象的特性，以及提升与 Java 的兼容性，提出了**伴生对象**来代替 static 方法。

> 另外，如果想使用Java中的静态成员和静态方法的话，我们可以用：
> - **@JvmField** 注解：生成与该属性相同的静态字段
> - **@JvmStatic** 注解：在单例对象和伴生对象中生成对应的静态方法





## 对象声明

Kotlin 中没有静态属性和方法，但是也提供了实现类似单例的功能，使用`object`关键字声明一个`object` 对象。

```kotlin
object StringUtils{  
    val separator: String = """\"""  
    fun isDigit(value: String): Boolean{  
        for (c in value) {  
            if (!c.isDigit()) {  
                return false  
            }  
        }  
        return true  
    }  
}
```

## 总结

- 对象表达式 (Object expressions)，在它们使用的地方，是立即（immediately）执行（或初始化）
- 对象声明 (Object declarations)，会延迟（lazily）初始化；但第一次访问该对象时才执行
- 伴生对象（Companion Objects），当外部类被加载时初始化，跟 Java 静态代码框初始化相似
