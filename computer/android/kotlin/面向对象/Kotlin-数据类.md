# 数据类

在`class`关键字之前，使用 `data` 关键字声明数据类：

```kotlin
data class Preson(var name : String,val sex : Int, var age : Int)
```

+ 构造函数中必须存在至少一个参数，并且必须使用`val`或`var`修饰；
+ 数据类不能是抽象、开放、密封或者内部的；
+ 数据类是可以实现接口的，如(序列化接口)，同时也是可以继承其他类的，如继承自一个密封类。

## 解构声明

