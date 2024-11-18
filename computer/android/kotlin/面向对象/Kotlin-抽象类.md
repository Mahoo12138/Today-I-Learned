# 抽象类

抽象类需要用`abstract`修饰，其中有抽象方法，也可以包含抽象属性：

```kotlin

abstract class Person(var name: String, var age: Int){  
	abstract var addr: String
	abstract val weight: Float
	
	abstract fun doEat()
	abstract fun doWalk()
	
	fun doSwim() {
		println("I am Swimming ... ")
	}
	open fun doSleep() {
		println("I am Sleeping ... ")
	}
}
```

+ 抽象类或者抽象函数不用手动添加`open`关键字，默认就是`open`类型；
+ 抽象类可以有具体实现的函数，这样的函数默认是`final`的（不能被覆盖）。如果想要被覆盖，需要手工加上`open`关键字；
