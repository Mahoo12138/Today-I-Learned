# 密封类

密封类是用来表示受限的**类继承结构**， 使用关键字`sealed`进行声明：

```kotlin
sealed class BaseSealed {
    data class People(val name: String) : BaseSealed()
    object Student : BaseSealed()
}
```

一个密封类可以有子类，但是所有子类都必须在同一个文件中声明，作为密封类的本身，扩展密封类（间接继承）的子类的类可以放在任何地方，而不一定是在同一个文件中。

**密封类是不能被实例化的**，即本身是抽象的，但可有抽象成员。

## 受限的类继承结构

所谓受限的类继承结构，即当类中的一个值只能是有限的几种类型，而不能是其他的任何类型。这种受限的类继承结构从某种意义上讲，它相当于是枚举类的扩展。

但是，我们知道`Kotlin`的枚举类中的枚举常量是受限的，因为每一个枚举常量只能存在一个实例。和枚举类不同的地方在于，密封类的一个子类可以有可包含状态的多个实例。

也可以说成，密封类是包含了一组受限的类集合，因为里面的类都是继承自这个密封类的。但是其和其他继承类（`open`）的区别在，密封类可以不被此文件外被继承，有效保护代码。

## 密封类的使用

创建一个名为`Operation`的密封类，它包含四种操作：加法，减法，乘法和除法：

```kotlin
sealed class Operation {
	class Add(val value: Int) : Operation()
    class Substract(val value: Int) : Operation()
    class Multiply(val value: Int) : Operation()
    class Divide(val value: Int) : Operation()
}
```

密封类的一个好处，在于使用`when`表达式 的时候，如果能够验证语句覆盖了所有情况，就不需要为该语句再添加一个`else`子句了：

```kotlin
fun execute(x: Int, op: Operation) = when (op) {
	is Operation.Add -> x + op.value
	is Operation.Substract -> x - op.value
	is Operation.Multiply -> x * op.value
	is Operation.Divide -> x / op.value
}
```

