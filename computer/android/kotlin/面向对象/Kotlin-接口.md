# 接口

使用`interface`作为接口的关键词，

和继承一样，也是使用冒号`:`来实现一个接口，如果要实现多个接口，使用逗号`,`分开。


## 接口中的属性

在接口中申明属性。接口中的属性要么是抽象的，要么提供访问器的实现。接口属性不可以有后备字段。而且访问器不可以引用它们。
### 作为抽象

即在实现类的类参数中重写属性：

```kotlin
interface InterfaceDemo {
	val num1: Int
	val num2: Int 
}
```


### 作为访问器

即手动方式去实现重写，并提供`get()`方法：

```kotlin
interface InterfaceDemo {     
	// 声明变量并提供默认值     
	// 注意： val num3: Int = 3  这种方式不提供，直接报错
	val num3: Int get() = 3
	val num4: Int
}

class Demo(override val num1: Int, override val num2: Int) : InterfaceDemo {  
  
    // 提供访问器实现  
    override val num3: Int get() = super.num3  
  
    // 手动赋值  
    override var num4: Int = 4  
  
    fun result() : Int{  
        return num3 + num4  
    }  
}
```


## 接口中的函数

不带函数体的函数可以省略大括号，且不用强制重写带函数体的函数就可以直接调用。