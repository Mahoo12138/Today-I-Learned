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

