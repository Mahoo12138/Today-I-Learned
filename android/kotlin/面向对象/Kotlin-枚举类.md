# 枚举类

使用 `enum`关键字在类头中的`class`关键字进行标识，枚举类中的每一个枚举常量都是一个对象，并且它们之间用逗号分隔：

```kotlin
enum class State {  
    NORMAL,
    NO_DATA,
    NO_INTERNET,
    ERROR,
    OTHER  
}
```

## 枚举常量

每一个枚举都是枚举类的实例，它们都是需要被初始化的：

```kotlin
enum class Color(var argb : Int){    
	RED(0xFF0000),
	WHITE(0xFFFFFF),
	BLACK(0x000000),
	GREEN(0x00FF00)
}
```

### 匿名类

要实现枚举常量的匿名类，则必须提供一个抽象方法。且该方法定义在枚举类内部。而且必须在枚举变量的后面。

枚举变量之间使用逗号（`,`）分割开。但是最后一个枚举变量必须使用分号结束。不然定义不了抽象方法。

```kotlin
enum class ConsoleColor(var argb : Int){    
	RED(0xFF0000) {        
		override fun print() {            
			println("我是枚举常量 RED ")        
		}    
	},    
	WHITE(0xFFFFFF){        
		override fun print() {
			println("我是枚举常量 WHITE ")
		}
	};    
	abstract fun print()
}
```

## 枚举类的使用

每个枚举常量都包含两个属性：`name（枚举常量名）`和`ordinal（枚举常量位置）`，且提供了`values()`和`valueOf()`方法来检测指定的名称与枚举类中定义的任何枚举常量是否匹配。