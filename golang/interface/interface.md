接口（interface）定义了一个对象的行为规范，只定义规范不实现，由具体的对象来实现规范的细节。
interface（接口）是一种较为常见的特性，很多语言都有接口特性。 Go语言的 interface 是**非侵入式的**，不像 Java 的 interface 实现需要显示的声明。
Go语言提倡面向接口编程。

## 接口类型

在Go语言中接口（interface）是一种类型，一种抽象的类型。
interface是一组method的集合，接口做的事情就像是定义一个协议（规则），不关心对方是什么类型，只关心对方能做什么。这是duck-type programming的一种体现，只要一个物体能像鸭子一样叫那我们就可以称它为鸭子；只要一个软件能存储和查询数据我们就可以称它为数据库；只要一台机器有洗衣服和甩干的功能我们就可以称它为洗衣机。

## 接口的定义

Go语言中每个接口由**数个方法**（零个或多个）组成，接口的定义格式如下：

```go
type 接口类型名 interface{
    方法名1( 参数列表1 ) 返回值列表1
    方法名2( 参数列表2 ) 返回值列表2
    …
}
```

其中：

- 接口名：使用`type`将接口定义为自定义的类型名。Go语言的接口在命名时，一般会在单词后面添加`er`，如有写操作的接口叫`Writer`，有字符串功能的接口叫`Stringer`等。接口名最好要能突出该接口的类型含义。
- 方法名：当方法名首字母是大写且这个接口类型名首字母也是大写时，这个方法可以被接口所在的包（package）之外的代码访问。
- 参数列表、返回值列表：参数列表和返回值列表中的参数变量名可以省略。

## 实现接口的条件

一个对象只要全部实现了接口中的方法，那么就实现了这个接口。换句话说，接口就是一个**需要实现的方法列表**。

## 接口类型变量

那实现了接口有什么用呢？

声明一个接口类型的变量，其能够存储所有实现了该接口的实例。

## 值接收者和指针接收者实现接口的区别

使用值接收者实现接口和使用指针接收者实现接口有什么区别呢？接下来我们通过一个例子看一下其中的区别。

我们有一个`Mover`接口和一个`dog`结构体。

```go
type Mover interface {
	move()
}

type dog struct {}
```

### 值接收者实现接口

```go
func (d dog) move() {
	fmt.Println("狗会动")
}
```

此时实现接口的是`dog`类型：

```go
func main() {
	var x Mover
	var wangcai = dog{} // 旺财是dog类型
	x = wangcai         // x可以接收dog类型
	var fugui = &dog{}  // 富贵是*dog类型
	x = fugui           // x可以接收*dog类型
	x.move()
}
```

从上面的代码中我们可以发现，使用值接收者（`func (d dog)`）实现接口之后，不管是 dog 结构体还是其结构体指针 `*dog` 类型的变量都可以赋值给该接口变量。

因为Go语言中有**对指针类型变量求值的语法糖**，dog 指针`fugui`内部会自动求值`*fugui`。

### 指针接收者实现接口

同样的代码我们再来测试一下使用指针接收者有什么区别：

```go
func (d *dog) move() {
	fmt.Println("狗会动")
}
func main() {
	var x Mover
	var wangcai = dog{} // 旺财是dog类型
	x = wangcai         // x不可以接收dog类型
	var fugui = &dog{}  // 富贵是*dog类型
	x = fugui           // x可以接收*dog类型
}
```

此时实现`Mover`接口的是`*dog`类型，所以不能给`x`传入`dog`类型的 wangcai，此时 x 只能存储`*dog`类型的值。

## 类型与接口的关系

### 一个类型实现多个接口

一个类型可以同时实现多个接口，而接口间**彼此独立，不知道对方的实现**。 例如，狗可以叫，也可以动。我们就分别定义Sayer 接口和 Mover 接口：

```go
// Sayer 接口
type Sayer interface {
	say()
}

// Mover 接口
type Mover interface {
	move()
}
```

dog 既可以实现 Sayer 接口，也可以实现 Mover 接口。

### 多个类型实现同一接口

Go语言中不同的类型还可以实现同一接口 首先我们定义一个`Mover`接口，它要求必须有一个`move`方法。并且一个接口的方法，不一定需要由一个类型完全实现，接口的方法可以通过在类型中**嵌入其他类型或者结构体**来实现。

## 接口嵌套

接口与接口间可以通过嵌套创造出新的接口。

```go
// Sayer 接口
type Sayer interface {
	say()
}

// Mover 接口
type Mover interface {
	move()
}

// 接口嵌套
type animal interface {
	Sayer
	Mover
}
```

## 空接口

Go语言中接口分为两种类型，分别是包含一组的方法的接口和空接口。在**src/runtime/runtime2.go**文件中分别使用iface和eface两个结构体来描述。

### 空接口的定义

空接口是指没有定义任何方法的接口。因此任何类型都实现了空接口。类似 Java 中的 Object 类。

空接口类型的变量**可以存储任意类型的变量**。

### 空接口的应用

#### 空接口作为函数的参数

使用空接口实现可以**接收任意类型**的函数参数。

```go
// 空接口作为函数参数
func show(a interface{}) {
	fmt.Printf("type:%T value:%v\n", a, a)
}
```

#### 空接口作为map的值

使用空接口实现可以**保存任意值**的字典。

```go
// 空接口作为map值
var studentInfo = make(map[string]interface{})
studentInfo["name"] = "娃哈哈"
studentInfo["age"] = 18
studentInfo["married"] = false
fmt.Println(studentInfo)
```

## 类型断言

空接口可以存储任意类型的值，那我们如何获取其存储的具体数据呢？

### 接口值

一个接口的值（简称接口值）是由**一个具体类型**和**具体类型的值**两部分组成的。这两部分分别称为接口的**动态类型**和**动态值**。

我们来看一个具体的例子：

```go
var w io.Writer
w = os.Stdout
w = new(bytes.Buffer)
w = nil
```

想要判断空接口中的值这个时候就可以使用类型断言，其语法格式：

```go
x.(T)
```

其中：

- x：表示类型为`interface{}`的变量
- T：表示断言`x`可能是的类型。

该语法返回两个值，第一个是`x`转化为`T`类型后的变量，第二个值是一个布尔值，若为`true`则表示断言成功，为`false`则表示断言失败。

```go
func main() {
	var x interface{}
	x = "Hello"
	v, ok := x.(string)
	if ok {
		fmt.Println(v)
	} else {
		fmt.Println("类型断言失败")
	}
}
```

## 接口的底层原理

```go
type iface struct {
	tab  *itab
	data unsafe.Pointer
}

type itab struct {
	inter *interfacetype // 接口定义的类型信息
	_type *_type 		// 接口实际指向值得类型信息
	hash  uint32 		// copy of _type.hash. Used for type switches.
	_     [4]byte
	fun   [1]uintptr 	// 接口方法实现列表，即函数地址列表，按字典序排序
}

type eface struct {
	_type *_type 		// 类型
	data  unsafe.Pointer // 底层数据的指针
}

type _type struct {
	size       uintptr  // 存储了类型需要占用的内存空间，主要在初始化时内存分配使用
	ptrdata    uintptr 	// size of memory prefix holding all pointers
	hash       uint32 	// 用于判断类型相等
	tflag      tflag 	// 类型的 Tags
	align      uint8 	// 结构体内对齐
	fieldAlign uint8 	// 结构体作为 field 时的对齐
	kind       uint8 	// 类型编号，定义域 runtime/typekind.go
	// function for comparing objects of this type
	// (ptr to object A, ptr to object B) -> ==?
	equal func(unsafe.Pointer, unsafe.Pointer) bool
	// gcdata stores the GC type data for the garbage collector.
	// If the KindGCProg bit is set in kind, gcdata is a GC program.
	// Otherwise it is a ptrmask bitmap. See mbitmap.go for details.
	gcdata    *byte
	str       nameOff
	ptrToThis typeOff
    
    // nameOff 和 typeOff 类型是 int32 ，这两个值是链接器负责嵌入的，相对于可执行文件的元信息的偏移量。
    // 元信息会在运行期，加载到 runtime.moduledata 结构体中 (src/runtime/symtab.go)。
    // runtime 提供了一些 helper 函数，这些函数能够帮你找到相对于 moduledata 的偏移量，比如 resolveNameOff 
    // (src/runtime/type.go) and resolveTypeOff (src/runtime/type.go)
}
```

iface 和 eface 都是用 interface 声明。但是由于空接口在Go语言中非常常见，所以使用特殊类型实现。

_type 结构体相对较为简单，并没有太多可说之处；itab除了 _type 字段外多了 interfacetype。

_interfacetype 从字面上来说可以轻易得知它代表的是当前的接口类型，那么 _type 对应的则必然是接口所指向值的类型信息，

hash 则是 _type.hash 的拷贝，fun 数组持有组成该 interface 虚函数表的函数的指针，所以 fun 数组保存的元素数量和具体类型相关联而无法设置成固定大小。

```go
type interfacetype struct {
	typ     _type
	pkgpath name
	mhdr    []imethod
}

type imethod struct {
	name nameOff
	ityp typeOff
}
```

interfacetype 定义于**src/runtime/type.go**文件中，由三个字段组成，除了 typ 这个Go语言类型的 runtime 表示，还有pkgpath 和 mhdr 两个字段，其主要作用就是 interface 的公共描述，类似的还有 maptype、arraytype、chantype 等，这些都在 *type.go* 文件中由定义，可以理解成 Go语言类型的 runtime 外在的表现信息。

### 变量是如何转变成 interface 的

在上一部分内容中我们已经了解了interface的数据结构，接下来让我们通过下面的代码来了解它们时如何被初始化的

```go
func main(){
	var temp myinterface = MyStruct{ID:1}
	temp.Func1()

}
type myinterface interface {
	Func1() string
	Func2() string
}

type MyStruct struct {
	ID int64
	ptr *int64
}
//go:noinline
func (m MyStruct) Func1() string {
	return fmt.Sprintf("Func1 implement")
}
//go:noinline
func (m MyStruct) Func2() string {
	return fmt.Sprintf("Func2 implement")
}
```

使用 *go tool compile -N -S -l test.go* 查看生成的汇编代码。在此我们只需要关心 **var temp myinterface = MyStruct{ID:1}** 这一行代码的细节，其他暂时忽略。生成的汇编代码如下

```assembly
0x0024 00036 (test.go:8)        PCDATA  $0, $0
        0x0024 00036 (test.go:8)        PCDATA  $1, $1
        0x0024 00036 (test.go:8)        XORPS   X0, X0
        0x0027 00039 (test.go:8)        MOVUPS  X0, ""..autotmp_1+48(SP)
        0x002c 00044 (test.go:8)        MOVQ    $1, ""..autotmp_1+48(SP)
        0x0035 00053 (test.go:8)        PCDATA  $0, $1
        0x0035 00053 (test.go:8)        LEAQ    go.itab."".MyStruct,"".myinterface(SB), AX
        0x003c 00060 (test.go:8)        PCDATA  $0, $0
        0x003c 00060 (test.go:8)        MOVQ    AX, (SP)
        0x0040 00064 (test.go:8)        PCDATA  $0, $1
        0x0040 00064 (test.go:8)        PCDATA  $1, $0
        0x0040 00064 (test.go:8)        LEAQ    ""..autotmp_1+48(SP), AX
        0x0045 00069 (test.go:8)        PCDATA  $0, $0
        0x0045 00069 (test.go:8)        MOVQ    AX, 8(SP)
        0x004a 00074 (test.go:8)        CALL    runtime.convT2I(SB)
        0x004f 00079 (test.go:8)        PCDATA  $0, $1
        0x004f 00079 (test.go:8)        MOVQ    24(SP), AX
        0x0054 00084 (test.go:8)        MOVQ    16(SP), CX
        0x0059 00089 (test.go:8)        PCDATA  $1, $2
        0x0059 00089 (test.go:8)        MOVQ    CX, "".temp+32(SP)
        0x005e 00094 (test.go:8)        PCDATA  $0, $0
        0x005e 00094 (test.go:8)        MOVQ    AX, "".temp+40(SP)

```

将上述过程分成三个部分

**1. 分配空间**

```assembly
MOVQ    $1, ""..autotmp_1+48(SP)
...
LEAQ    ""..autotmp_1+48(SP), AX
MOVQ    AX, 8(SP)
```

$1 对应的是 MyStruct 的 ID，被存储在当前栈帧的自底向上+48偏移量的位置,。后续编译器可以根据它的存储位置来用地址对其进行引用。

**2. 创建 itab**

```assembly
LEAQ    go.itab."".MyStruct,"".myinterface(SB), AX
MOVQ    AX, (SP)
```

看上去编译器已经为提前创建了必需的 itab 来表示 iface，并且通过全局符号提供给我们使用。编译器这么做的原因不言而喻，毕竟不管在运行时创建了多少 iface<myinterface,MyStruct>，只需要一个 itab，从 itab 内的定义也可以看出其并不会和运行时所初始化的变量由任何关系。 在本文中并不会继续深入了解 **go.itab."".MyStruct,"".myinterface**符号 ，感兴趣的同学看[这篇文章](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fcch123%2Fgo-internals%2Fblob%2Fmaster%2Fchapter2_interfaces%2FREADME.md) ，非常的深入细致

**3. 分配数据**

```assembly
CALL    runtime.convT2I(SB)
MOVQ    24(SP), AX
MOVQ    16(SP), CX
```

在1、2中我们看到了解到目前栈顶（SP）保存着 `go.itab."".MyStruct,"".myinterface` 的地址，`8(sp)` 则保存着变量的地址。上面两个指针会作为参数传给 `convT2I` 函数，此函数会创建并返回 interface。 **src/runtime/iface.go**

```go
func convT2I(tab *itab, elem unsafe.Pointer) (i iface) {
	t := tab._type
	if raceenabled {
		raceReadObjectPC(t, elem, getcallerpc(), funcPC(convT2I))
	}
	if msanenabled {
		msanread(elem, t.size)
	}
	x := mallocgc(t.size, t, true)
	typedmemmove(t, x, elem)
	i.tab = tab
	i.data = x
	return
}
```

上述代码做了4件事情：

1. 它创建了一个 iface 的结构体 i。
2. 它将我们刚给 i.tab 赋的值赋予了 itab 指针。
3. 它在堆上分配了一个 `i.tab._type` 的新对象 `i.tab._type`，然后将第二个参数 elem 指向的值拷贝到这个新对象上。
4. 将最后的 interface 返回。 现在我们终于得到了完整的 interface

### 动态派发实现

下面是第一行实例化的汇编代码

```assembly
MOVQ    $1, ""..autotmp_1+48(SP)
LEAQ    go.itab."".MyStruct,"".myinterface(SB), AX
MOVQ    AX, (SP)
LEAQ    ""..autotmp_1+48(SP), AX
MOVQ    AX, 8(SP)
CALL    runtime.convT2I(SB)
MOVQ    24(SP), AX
MOVQ    16(SP), CX
MOVQ    CX, "".temp+32(SP)
MOVQ    AX, "".temp+40(SP)
```

接着是对方法间接调用的汇编代码

```assembly
MOVQ    "".temp+32(SP), AX
MOVQ    24(AX), AX
MOVQ    "".temp+40(SP), CX
MOVQ    CX, (SP)
CALL    AX
```

AX中保存的是itab的指针,实际上是指向go.itab."".MyStruct,"".myinterface的指针.对其解饮用并offset 24个字节,上面itab的结构体定义我们可以得知此时指向的itab.fun . 并且我们已经知道了fun[0]实际上指向的是main.(MyStruct).Func1的指针. 因为方法本身没有参数,所以在入参的时候只需要传入receiver,并通过CALL指令即可完成函数调用.

如果我们修改代码为如下形式

```go
temp.Func2()
```

这是再查看汇编代码,则和最初的有所不同

```assembly
MOVQ    "".temp+32(SP), AX
MOVQ    32(AX), AX
MOVQ    "".temp+40(SP), CX
MOVQ    CX, (SP)
CALL    AX
```

轻易可以得知其获取到的函数指针相对第一次的增加了8字节的偏移,这个很容易理解,因为上面提到过fun字段是接口方法实现列表是按照字典序排序的.

> [《Go语言原来这么简单》 -- 接口 - 掘金 (juejin.cn)](https://juejin.cn/post/7060471869085843487)
>
> [深入理解golang中的接口 - 掘金 (juejin.cn)](https://juejin.cn/post/6861944186271498254)
