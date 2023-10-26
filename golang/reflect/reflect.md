## 为何需要反射?

需要编写一个函数能够处理一类并不满足普通公共接口的类型的值：

+ 可能是因为它们并没有确定的表示方式；
+ 或在我们设计该函数的时候这些类型可能还不存在；

总之，就是**没有办法来检查未知类型的表示方式**。这就是我们需要反射的原因。

> 反射机制允许我们在程序运行时检查变量的类型结构、值、方法等，同时还能动态修改变量值、调用方法等。

## reflect.Type 和 reflect.Value

反射是由 reflect 包提供的，其中定义了两个重要的类型，Type 和 Value。

+ 一个 `reflect.Type` 表示一个 Go 类型，它是一个接口，且满足 `fmt.Stringer` 接口；
+ 一个 `reflect.Value` 可以装载任意类型的值，也满足 `fmt.Stringer` 接口。

函数 `reflect.TypeOf` 接受任意的 `interface{}` 类型，并以 `reflect.Type` 形式返回其动态类型；

+ 返回的是一个动态类型的接口值，总是返回具体的类型；

  ```go
  var w io.Writer = os.Stdout
  fmt.Println(reflect.TypeOf(w)) // "*os.File"
  ```

函数 `reflect.ValueOf` 接受任意的 `interface{}` 类型，并返回一个装载着其动态值的 `reflect.Value`；

+ 返回的结果也是具体的类型，但是 `reflect.Value` 也可以持有一个接口值；

  ```go
  v := reflect.ValueOf(3) // a reflect.Value
  fmt.Println(v)          // "3"
  fmt.Printf("%v\n", v)   // "3"
  
  // 除非 Value 持有的是字符串，否则 String 方法只返回其类型
  fmt.Println(v.String()) // NOTE: "<int Value>"
  ```

+ 逆操作是 `reflect.Value.Interface` 方法。它返回一个 interface{} 类型，装载着与 reflect.Value 相同的具体值：

  ```go
  v := reflect.ValueOf(3) // a reflect.Value
  x := v.Interface()      // an interface{}
  i := x.(int)            // an int
  fmt.Printf("%d\n", i)   // "3"
  ```

> reflect.Value 和 interface{} 都能装载任意的值。
>
> 所不同的是，一个空的接口隐藏了值内部的表示方式和所有方法，因此只有我们知道具体的动态类型才能使用类型断言来访问内部的值，内部值我们没法访问。

`reflect.Value`和`reflect.Type`都有一个`Kind()`方法，返回一个`reflect.Kind`类型的变量。与`reflect.Type`的区别是：**`Kind`指代的底层类型，而`Type`是静态声明的类型**。

## 通过 reflect.Value 修改值

一个变量就是一个可寻址的内存空间，里面存储了一个值，并且存储的值可以通过内存地址来更新。

对于以下的声明语句：

```Go
x := 2                   // value   type    variable?
a := reflect.ValueOf(2)  // 2       int     no
b := reflect.ValueOf(x)  // 2       int     no
c := reflect.ValueOf(&x) // &x      *int    no
d := c.Elem()            // 2       int     yes (x)
```

其中 a 对应的变量不可取地址。因为 a 中的值仅仅是整数 2 的拷贝副本。b 中的值也同样不可取地址。c 中的值还是不可取地址，它只是一个指针`&x`的拷贝。

实际上，所有通过`reflect.ValueOf(x)`返回的`reflect.Value`都是不可取地址的。

但是对于 d，它是 c 的**解引用方式生成**的，指向另一个变量，因此是可取地址的。我们可以通过调用`reflect.ValueOf(&x).Elem()`，来获取任意变量 x 对应的可取地址的 Value。

我们可以通过调用`reflect.Value`的`CanAddr`方法来判断其是否可以被取地址：

```Go
fmt.Println(a.CanAddr()) // "false"
fmt.Println(b.CanAddr()) // "false"
fmt.Println(c.CanAddr()) // "false"
fmt.Println(d.CanAddr()) // "true"
```

要从变量对应的可取地址的`reflect.Value`来访问变量需要三个步骤。第一步是调用`Addr()`方法，它返回一个 Value，里面保存了指向变量的指针。

然后是在 Value 上调用`Interface()`方法，也就是返回一个`interface{}`，里面包含指向变量的指针。最后，如果我们知道变量的类型，我们可以使用类型的断言机制将得到的`interface{}`类型的接口强制转为普通的类型指针。这样我们就可以通过这个普通指针来更新变量了：

```Go
x := 2
d := reflect.ValueOf(&x).Elem()   // d refers to the variable x
px := d.Addr().Interface().(*int) // px := &x
*px = 3                           // x = 3
fmt.Println(x)                    // "3"
```

或者，不使用指针，而是通过调用可取地址的`reflect.Value`的`reflect.Value.Set`方法来更新对应的值：

```Go
d.Set(reflect.ValueOf(4))
fmt.Println(x) // "4"
```

Set 方法将在运行时执行和编译时进行类似的可赋值性约束的检查，对一个不可取地址的`reflect.Value`调用 Set 方法也会导致 panic 异常。

很多用于基本数据类型的Set方法：`SetInt`、`SetUint`、`SetString`和`SetFloat`等



## 获取结构体字段标签

使用结构体成员标签用于设置对应 JSON 对应的名字。其中 json 成员标签让我们可以选择成员的名字和抑制零值成员的输出。





## 显示一个类型的方法集

可使用`reflect.Type`来打印任意值的类型和枚举它的方法：

```go
func Print(x interface{}) {
    v := reflect.ValueOf(x)
    t := v.Type()
    fmt.Printf("type %s\n", t)

    for i := 0; i < v.NumMethod(); i++ {
        methType := v.Method(i).Type()
        fmt.Printf("func (%s) %s%s\n", t, t.Method(i).Name,
            strings.TrimPrefix(methType.String(), "func"))
    }
}
```

## 一些忠告

反射是一个强大并富有表达力的工具，但是它应该被小心地使用，原因有三：

+ 基于反射的代码是比较脆弱的。对于每一个会导致编译器报告类型错误的问题，在反射中都有与之相对应的误用问题，不同的是编译器会在构建时马上报告错误，而**反射则是在真正运行到的时候才会抛出`panic`异常**，可能是写完代码很久之后了，而且程序也可能运行了很长的时间。
+ 即使对应类型提供了相同文档，但是**反射的操作不能做静态类型检查**，而且大量反射的代码通常难以理解。总是需要小心翼翼地为每个导出的类型和其它接受`interface{}`或`reflect.Value`类型参数的函数维护说明文档。
+ 基于反射的代码通常比正常的代码运行速度慢一到两个数量级。对于一个典型的项目，大部分函数的性能和程序的整体性能关系不大，所以当反射能使程序更加清晰的时候可以考虑使用。