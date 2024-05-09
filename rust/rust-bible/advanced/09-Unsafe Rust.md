---
title: Unsafe Rust
---

# Unsafe Rust

## 简介

### 为何会有 unsafe

几乎每个语言都有  `unsafe`  关键字，但 Rust 语言使用  `unsafe`  的原因可能与其它编程语言还有所不同。

#### 过强的编译器

说来尴尬，`unsafe`  的存在主要是因为 Rust 的静态检查太强了，但是强就算了，它还很保守，这就会导致当编译器在分析代码时，一些正确代码会因为编译器无法分析出它的所有正确性，结果将这段代码拒绝，导致编译错误。

这种保守的选择确实也没有错，毕竟安全就是要防微杜渐，但是对于使用者来说，就不是那么愉快的事了，特别是当配合 Rust 的所有权系统一起使用时，有个别问题是真的棘手和难以解决。

举个例子，在之前的自引用章节中，我们就提到了相关的编译检查是很难绕过的，如果想要绕过，最常用的方法之一就是使用  [[05-循环引用与自引用#结构体自引用|unsafe 和 Pin]]。

好在，当遇到这些情况时，我们可以使用  `unsafe`  来解决。此时，你需要替代编译器的部分职责对  `unsafe`  代码的正确性负责，例如在正常代码中不可能遇到的空指针解引用问题在  `unsafe`  中就可能会遇到，我们需要自己来处理好这些类似的问题。

#### 特定任务的需要

至于  `unsafe`  存在的另一个原因就是：它必须要存在。原因是计算机底层的一些硬件就是不安全的，如果 Rust 只允许你做安全的操作，那一些任务就无法完成，换句话说，我们还怎么跟 C++ 干架？

Rust 的一个主要定位就是系统编程，众所周知，系统编程就是底层编程，往往需要直接跟操作系统打交道，甚至于去实现一个操作系统。而为了实现底层系统编程，`unsafe`  就是必不可少的。

在了解了为何会有  `unsafe`  后，我们再来看看，除了这些必要性，`unsafe`  还能给我们带来哪些超能力。

### unsafe 的超能力

使用  `unsafe`  非常简单，只需要将对应的代码块标记下即可:

```rust
fn main() {
  let mut num = 5;
  let r1 = &num as *const i32;
  unsafe {
    println!("r1 is: {}", *r1);
  }
}
```

上面代码中, `r1`  是一个裸指针(raw pointer)，由于它具有破坏 Rust 内存安全的潜力，因此只能在  `unsafe`  代码块中使用，如果你去掉  `unsafe {}`，编译器会立刻报错。

言归正传， `unsafe`  能赋予我们 5 种超能力，这些能力在安全的 Rust 代码中是无法获取的：

- 解引用裸指针，就如上例所示
- 调用一个  `unsafe`  或外部的函数
- 访问或修改一个可变的[[07-全局变量#静态变量|静态变量]]
- 实现一个  `unsafe`  特征
- 访问  `union`  中的字段

在本章中，我们将着重讲解裸指针和 FFI 的使用。

### unsafe 的安全保证

曾经在  `reddit`  上有一个讨论还挺热闹的，是关于  `unsafe`  的命名是否合适，总之公有公理，婆有婆理，但有一点是不可否认的：虽然名称自带不安全，但是 Rust 依然提供了强大的安全支撑。

首先，`unsafe`  并不能绕过 Rust 的借用检查，也不能关闭任何 Rust 的安全检查规则，例如当你在  `unsafe`  中使用**引用**时，该有的检查一样都不会少。

因此  `unsafe`  能给大家提供的也仅仅是之前的 5 种超能力，在使用这 5 种能力时，编译器才不会进行内存安全方面的检查，最典型的就是使用**裸指针**(引用和裸指针有很大的区别)。

### 谈虎色变？

在网上充斥着这样的言论：`千万不要使用 unsafe，因为它不安全`，甚至有些库会以没有  `unsafe`  代码作为噱头来吸引用户。事实上，大可不必，如果按照这个标准，Rust 的标准库也将不复存在！

Rust 中的  `unsafe`  其实没有那么可怕，虽然听上去很不安全，但是实际上 Rust 依然提供了很多机制来帮我们提升了安全性，因此不必像对待 Go 语言的  `unsafe`  那样去畏惧于使用 Rust 中的  `unsafe` 。

大致使用原则总结如下：没必要用时，就不要用，当有必要用时，就大胆用，但是尽量控制好边界，让  `unsafe`  的范围尽可能小。

### 控制 unsafe 的使用边界

`unsafe`  不安全，但是该用的时候就要用，在一些时候，它能帮助我们大幅降低代码实现的成本。

而作为使用者，你的水平决定了  `unsafe`  到底有多不安全，因此你需要在  `unsafe`  中小心谨慎地去访问内存。

即使做到小心谨慎，依然会有出错的可能性，但是  `unsafe`  语句块决定了：就算内存访问出错了，你也能立刻意识到，错误是在  `unsafe`  代码块中，而不花大量时间像无头苍蝇一样去寻找问题所在。

正因为此，写代码时要尽量控制好  `unsafe`  的边界大小，越小的  `unsafe`  越会让我们在未来感谢自己当初的选择。

除了控制边界大小，另一个很常用的方式就是在  `unsafe`  代码块外包裹一层  `safe`  的 API，例如一个函数声明为 safe 的，然后在其内部有一块儿是  `unsafe`  代码。

> 忍不住抱怨一句，内存安全方面的 bug ，是真心难查！

## 五种兵器

### 解引用裸指针

裸指针(raw pointer，又称原生指针) 在功能上跟引用类似，同时它也需要显式地注明可变性。但是又和引用有所不同，裸指针长这样: `*const T`  和  `*mut T`，它们分别代表了不可变和可变。

大家在之前学过  `*`  操作符，知道它可以用于解引用，但是在裸指针  `*const T`  中，这里的  `*` **只是类型名称的一部分**，并没有解引用的含义。

至此，我们已经学过三种类似指针的概念：引用、智能指针和裸指针。与前两者不同，裸指针：

- 可以绕过 Rust 的借用规则，可以同时拥有一个数据的可变、不可变指针，甚至还能拥有多个可变的指针
- 并不能保证指向合法的内存
- 可以是  `null`
- 没有实现任何自动的回收 (drop)

总之，**裸指针跟 C 指针是非常像的**，使用它需要以牺牲安全性为前提，但我们获得了更好的性能，也可以跟其它语言或硬件打交道。

#### 基于引用创建裸指针

下面的代码**基于值的引用**同时创建了可变和不可变的裸指针：

```rust
let mut num = 5;

let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;
```

`as`  可以用于强制类型转换，在之前章节中有讲解。在这里，我们将引用  `&num / &mut num`  强转为相应的裸指针  `*const i32 / *mut i32`。

细心的同学可能会发现，在这段代码中并没有  `unsafe`  的身影，原因在于：**创建裸指针是安全的行为，而解引用裸指针才是不安全的行为** :

```rust
fn main() {
 let mut num = 5;
 let r1 = &num as *const i32;
 unsafe {
     println!("r1 is: {}", *r1);
 }
}
```

#### 基于内存地址创建裸指针

在上面例子中，我们基于现有的引用来创建裸指针，这种行为是很安全的。但是接下来的方式就不安全了：

```rust
let address = 0x012345usize;
let r = address as *const i32;
```

这里基于一个内存地址来创建裸指针，可以想像，这种行为是相当危险的。试图使用任意的内存地址往往是一种未定义的行为(undefined behavior)，因为该内存地址有可能存在值，也有可能没有，就算有值，也大概率不是你需要的值。

同时编译器也有可能会优化这段代码，会造成没有任何内存访问发生，甚至程序还可能发生段错误(segmentation fault)。**总之，你几乎没有好的理由像上面这样实现代码，虽然它是可行的**。

如果真的要使用内存地址，也是类似下面的用法，先取地址，再使用，而不是凭空捏造一个地址：

```rust
use std::{slice::from_raw_parts, str::from_utf8_unchecked};

// 获取字符串的内存地址和长度
fn get_memory_location() -> (usize, usize) {
  let string = "Hello World!";
  let pointer = string.as_ptr() as usize;
  let length = string.len();
  (pointer, length)
}

// 在指定的内存地址读取字符串
fn get_str_at_location(pointer: usize, length: usize) -> &'static str {
  unsafe { from_utf8_unchecked(from_raw_parts(pointer as *const u8, length)) }
}

fn main() {
  let (pointer, length) = get_memory_location();
  let message = get_str_at_location(pointer, length);
  println!(
    "The {} bytes at 0x{:X} stored: {}",
    length, pointer, message
  );
  // 如果大家想知道为何处理裸指针需要 `unsafe`，可以试着反注释以下代码
  // let message = get_str_at_location(1000, 10);
}
```

#### 使用 \* 解引用

```rust
let a = 1;
let b: *const i32 = &a as *const i32;
let c: *const i32 = &a;
unsafe {
    println!("{}", *c);
}
```

使用  `*`  可以对裸指针进行解引用，由于该指针的内存安全性并没有任何保证，因此我们需要使用  `unsafe`  来包裹解引用的逻辑(切记，`unsafe`  语句块的范围一定要尽可能的小，具体原因在上一章节有讲)。

以上代码另一个值得注意的点就是：除了使用  `as`  来显式的转换，我们还使用了隐式的转换方式  `let c: *const i32 = &a;`。在实际使用中，我们建议使用  `as`  来转换，因为这种显式的方式更有助于提醒用户：你在使用的指针是裸指针，需要小心。

#### 基于智能指针创建裸指针

还有一种创建裸指针的方式，那就是基于智能指针来创建：

```rust
let a: Box<i32> = Box::new(10);
// 需要先解引用a
let b: *const i32 = &*a;
// 使用 into_raw 来创建
let c: *const i32 = Box::into_raw(a);
```

#### 小结

像之前代码演示的那样，使用裸指针可以让我们创建两个可变指针都指向同一个数据，如果使用安全的 Rust，你是无法做到这一点的，违背了借用规则，编译器会对我们进行无情的阻止。因此裸指针可以绕过借用规则，但是由此带来的数据竞争问题，就需要大家自己来处理了，总之，需要小心！

既然这么危险，为何还要使用裸指针？除了之前提到的性能等原因，还有一个重要用途就是跟  `C`  语言的代码进行交互( FFI )，在讲解 FFI 之前，先来看看如何调用 unsafe 函数或方法。

### 调用 unsafe 函数或方法

`unsafe`  函数从外表上来看跟普通函数并无区别，唯一的区别就是它需要使用  `unsafe fn`  来进行定义。这种定义方式是为了告诉调用者：当调用此函数时，你需要注意它的相关需求，因为 Rust 无法担保调用者在使用该函数时能满足它所需的一切需求。

强制调用者加上  `unsafe`  语句块，就可以让他清晰的认识到，正在调用一个不安全的函数，需要小心看看文档，看看函数有哪些特别的要求需要被满足。

```rust
unsafe fn dangerous() {}

fn main() {
    dangerous();
}
```

如果试图像上面这样调用，编译器就会报错：

```text
error[E0133]: call to unsafe function is unsafe and requires unsafe function or block
 --> src/main.rs:3:5
  |
3 |     dangerous();
  |     ^^^^^^^^^^^ call to unsafe function
```

按照报错提示，加上  `unsafe`  语句块后，就能顺利执行了：

```rust
unsafe {
    dangerous();
}
```

道理很简单，但一定要牢记在心：**使用 unsafe 声明的函数时，一定要看看相关的文档，确定自己没有遗漏什么**。

还有，`unsafe`  无需俄罗斯套娃，在  `unsafe`  函数体中使用  `unsafe`  语句块是多余的行为。

### 用安全抽象包裹 unsafe 代码

一个函数包含了  `unsafe`  代码不代表我们需要将整个函数都定义为  `unsafe fn`。事实上，在标准库中有大量的安全函数，它们内部都包含了  `unsafe`  代码块，下面我们一起来看看一个很好用的标准库函数：`split_at_mut`。

大家可以想象一下这个场景：需要将一个数组分成两个切片，且每一个切片都要求是可变的。类似需求在安全 Rust 中是很难实现的，因为要对同一个数组做两个可变借用：

```rust
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();

    assert!(mid <= len);

    (&mut slice[..mid], &mut slice[mid..])
}

fn main() {
    let mut v = vec![1, 2, 3, 4, 5, 6];

    let r = &mut v[..];

    let (a, b) = split_at_mut(r, 3);

    assert_eq!(a, &mut [1, 2, 3]);
    assert_eq!(b, &mut [4, 5, 6]);
}
```

上面代码一眼看过去就知道会报错，因为我们试图在自定义的  `split_at_mut`  函数中，可变借用  `slice`  两次：

```text
error[E0499]: cannot borrow `*slice` as mutable more than once at a time
 --> src/main.rs:6:30
  |
1 | fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
  |                        - let's call the lifetime of this reference `'1`
...
6 |     (&mut slice[..mid], &mut slice[mid..])
  |     -------------------------^^^^^--------
  |     |     |                  |
  |     |     |                  second mutable borrow occurs here
  |     |     first mutable borrow occurs here
  |     returning this value requires that `*slice` is borrowed for `'1`
```

对于 Rust 的借用检查器来说，它无法理解我们是分别借用了同一个切片的两个不同部分，但事实上，这种行为是没任何问题的，毕竟两个借用没有任何重叠之处。总之，不太聪明的 Rust 编译器阻碍了我们用这种简单且安全的方式去实现，那只能剑走偏锋，试试  `unsafe`  了。

```rust
use std::slice;

fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();
    let ptr = slice.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            slice::from_raw_parts_mut(ptr, mid),
            slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut v = vec![1, 2, 3, 4, 5, 6];

    let r = &mut v[..];

    let (a, b) = split_at_mut(r, 3);

    assert_eq!(a, &mut [1, 2, 3]);
    assert_eq!(b, &mut [4, 5, 6]);
}
```

相比安全实现，这段代码就显得没那么好理解了，甚至于我们还需要像 C 语言那样，通过指针地址的偏移去控制数组的分割。

- `as_mut_ptr`  会返回指向  `slice`  首地址的裸指针  `*mut i32`
- `slice::from_raw_parts_mut`  函数通过指针和长度来创建一个新的切片，简单来说，该切片的初始地址是  `ptr`，长度为  `mid`
- `ptr.add(mid)`  可以获取第二个切片的初始地址，由于切片中的元素是  `i32`  类型，每个元素都占用了 4 个字节的内存大小，因此我们不能简单的用  `ptr + mid`  来作为初始地址，而应该使用  `ptr + 4 * mid`，但是这种使用方式并不安全，因此  `.add`  方法是最佳选择

由于  `slice::from_raw_parts_mut`  使用裸指针作为参数，因此它是一个  `unsafe fn`，我们在使用它时，就必须用  `unsafe`  语句块进行包裹，类似的，`.add`  方法也是如此(还是那句话，不要将无关的代码包含在  `unsafe`  语句块中)。

部分同学可能会有疑问，那这段代码我们怎么保证  `unsafe`  中使用的裸指针  `ptr`  和  `ptr.add(mid)`  是合法的呢？秘诀就在于  `assert!(mid <= len);` ，通过这个断言，我们保证了裸指针一定指向了  `slice`  切片中的某个元素，而不是一个莫名其妙的内存地址。

再回到我们的主题：**虽然 split_at_mut 使用了  `unsafe`，但我们无需将其声明为  `unsafe fn`**，这种情况下就是使用安全的抽象包裹  `unsafe`  代码，这里的  `unsafe`  使用是非常安全的，因为我们从合法数据中创建了的合法指针。

与之对比，下面的代码就非常危险了：

```rust
use std::slice;

let address = 0x01234usize;
let r = address as *mut i32;

let slice: &[i32] = unsafe { slice::from_raw_parts_mut(r, 10000) };
println!("{:?}",slice);
```

这段代码从一个任意的内存地址，创建了一个 10000 长度的  `i32`  切片，我们无法保证切片中的元素都是合法的  `i32`  值，这种访问就是一种未定义行为(UB = undefined behavior)。

`zsh: segmentation fault`

不出所料，运行后看到了一个段错误。

### FFI

`FFI`（Foreign Function Interface）可以用来与其它语言进行交互，但是并不是所有语言都这么称呼，例如 Java 称之为  `JNI（Java Native Interface）`。

`FFI`  之所以存在是由于现实中很多代码库都是由不同语言编写的，如果我们需要使用某个库，但是它是由其它语言编写的，那么往往只有两个选择：

- 对该库进行重写或者移植
- 使用  `FFI`

前者相当不错，但是在很多时候，并没有那么多时间去重写，因此  `FFI`  就成了最佳选择。回到 Rust 语言上，由于这门语言依然很年轻，一些生态是缺失的，我们在写一些不是那么大众的项目时，可能会同时遇到没有相应的 Rust 库可用的尴尬境况，此时通过  `FFI`  去调用 C 语言的库就成了相当棒的选择。

还有在将 C/C++ 的代码重构为 Rust 时，先将相关代码引入到 Rust 项目中，然后逐步重构，也是不错的(为什么用不错来形容？因为重构一个有一定规模的 C/C++ 项目远没有想象中美好，因此最好的选择还是对于新项目使用 Rust 实现，老项目。。就让它先运行着吧)。

当然，除了  `FFI`  还有一个办法可以解决跨语言调用的问题，那就是将其作为一个独立的服务，然后使用网络调用的方式去访问，HTTP，gRPC 都可以。

言归正传，之前我们提到  `unsafe`  的另一个重要目的就是对  `FFI`  提供支持，它的全称是  `Foreign Function Interface`，顾名思义，通过  `FFI` , 我们的 Rust 代码可以跟其它语言的外部代码进行交互。

下面的例子演示了如何调用 C 标准库中的  `abs`  函数：

```rust
extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe {
        println!("Absolute value of -3 according to C: {}", abs(-3));
    }
}
```

C 语言的代码定义在了  `extern`  代码块中， 而  `extern`  必须使用  `unsafe`  才能进行进行调用，原因在于其它语言的代码并不会强制执行 Rust 的规则，因此 Rust 无法对这些代码进行检查，最终还是要靠开发者自己来保证代码的正确性和程序的安全性。

#### ABI

在  `extern "C"`  代码块中，我们列出了想要调用的外部函数的签名。其中  `"C"`  定义了外部函数所使用的**应用二进制接口**`ABI` (Application Binary Interface)：`ABI`  定义了如何在汇编层面来调用该函数。在所有  `ABI`  中，C 语言的是最常见的。

#### 在其它语言中调用 Rust 函数

在 Rust 中调用其它语言的函数是让 Rust 利用其他语言的生态，那反过来可以吗？其他语言可以利用 Rust 的生态不？答案是肯定的。

我们可以使用  `extern`  来创建一个接口，其它语言可以通过该接口来调用相关的 Rust 函数。但是此处的语法与之前有所不同，之前用的是语句块，而这里是在函数定义时加上  `extern`  关键字，当然，别忘了指定相应的  `ABI`：

```rust
#[no_mangle]
pub extern "C" fn call_from_c() {
    println!("Just called a Rust function from C!");
}
```

上面的代码可以让  `call_from_c`  函数被  `C`  语言的代码调用，当然，前提是将其编译成一个共享库，然后链接到 C 语言中。

这里还有一个比较奇怪的注解  `#[no_mangle]`，它用于告诉 Rust 编译器：不要乱改函数的名称。 `Mangling`  的定义是：当 Rust 因为编译需要去修改函数的名称，例如为了让名称包含更多的信息，这样其它的编译部分就能从该名称获取相应的信息，这种修改会导致函数名变得相当不可读。

因此，为了让 Rust 函数能顺利被其它语言调用，我们必须要禁止掉该功能。

### 访问或修改一个可变的静态变量

这部分我们在之前的[[07-全局变量|全局变量章节]]中有过详细介绍，这里就不再赘述，大家可以前往此章节阅读。

### 实现 unsafe 特征

说实话，`unsafe`  的特征确实不多见，如果大家还记得的话，我们在之前的[[06-多线程并发编程#基于 Send 和 Sync 的线程安全 | Send 和 Sync]]  章节中实现过  `unsafe`  特征  `Send`。

之所以会有  `unsafe`  的特征，是因为该特征**至少有一个方法包含有编译器无法验证的内容**。`unsafe`  特征的声明很简单：

```rust
unsafe trait Foo {
    // 方法列表
}

unsafe impl Foo for i32 {
    // 实现相应的方法
}

fn main() {}
```

通过  `unsafe impl`  的使用，我们告诉编译器：相应的正确性由我们自己来保证。

再回到刚提到的  `Send`  特征，若我们的类型中的所有字段都实现了  `Send`  特征，那该类型也会自动实现  `Send`。但是如果我们想要为某个类型手动实现  `Send` ，例如为裸指针，那么就必须使用  `unsafe`，相关的代码在之前的链接中也有，大家可以移步查看。

总之，`Send`  特征标记为  `unsafe`  是因为 Rust 无法验证我们的类型是否能在线程间安全的传递，因此就需要通过  `unsafe`  来告诉编译器，它无需操心，剩下的交给我们自己来处理。

### 访问 union 中的字段

截止目前，我们还没有介绍过  `union` ，原因很简单，它主要用于跟  `C`  代码进行交互。

访问  `union`  的字段是不安全的，因为 Rust 无法保证当前存储在  `union`  实例中的数据类型。

```rust
#[repr(C)]
union MyUnion {
    f1: u32,
    f2: f32,
}
```

上从可以看出，`union`  的使用方式跟结构体确实很相似，但是前者的所有字段都共享同一个存储空间，意味着往  `union`  的某个字段写入值，会导致其它字段的值会被覆盖。

关于  `union`  的更多信息，可以在[这里查看](https://doc.rust-lang.org/reference/items/unions.html)。

### 一些实用工具(库)

由于  `unsafe`  和  `FFI`  在 Rust 的使用场景中是相当常见的(例如相对于 Go 的  `unsafe`  来说)，因此社区已经开发出了相当一部分实用的工具，可以改善相应的开发体验。

#### rust-bindgen 和 cbindgen

对于  `FFI`  调用来说，保证接口的正确性是非常重要的，这两个库可以帮我们自动生成相应的接口，其中  [`rust-bindgen`](https://github.com/rust-lang/rust-bindgen)  用于在 Rust 中访问 C 代码，而  [`cbindgen`](https://github.com/eqrion/cbindgen/)则反之。

下面以  `rust-bindgen`  为例，来看看如何自动生成调用 C 的代码，首先下面是 C 代码：

```c
typedef struct Doggo {
    int many;
    char wow;
} Doggo;

void eleven_out_of_ten_majestic_af(Doggo* pupper);
```

下面是自动生成的可以调用上面代码的 Rust 代码：

```rust
/* automatically generated by rust-bindgen 0.99.9 */

#[repr(C)]
pub struct Doggo {
    pub many: ::std::os::raw::c_int,
    pub wow: ::std::os::raw::c_char,
}

extern "C" {
    pub fn eleven_out_of_ten_majestic_af(pupper: *mut Doggo);
}
```

#### cxx

如果需要跟 C++ 代码交互，非常推荐使用  [`cxx`](https://github.com/dtolnay/cxx)，它提供了双向的调用，最大的优点就是安全：是的，你无需通过  `unsafe`  来使用它！

#### Miri

[`miri`](https://github.com/rust-lang/miri)  可以生成 Rust 的中间层表示 MIR，对于编译器来说，我们的 Rust 代码首先会被编译为 MIR ，然后再提交给 LLVM 进行处理。

可以通过  `rustup component add miri`  来安装它，并通过  `cargo miri`  来使用，同时还可以使用  `cargo miri test`  来运行测试代码。

`miri`  可以帮助我们检查常见的未定义行为(UB = Undefined Behavior)，以下列出了一部分:

- 内存越界检查和内存释放后再使用(use-after-free)
- 使用未初始化的数据
- 数据竞争
- 内存对齐问题

但是需要注意的是，它只能帮助识别被执行代码路径的风险，那些未被执行到的代码是没办法被识别的。

#### Clippy

官方的  [`clippy`](https://github.com/rust-lang/rust-clippy)  检查器提供了有限的  `unsafe`  支持，虽然不多，但是至少有一定帮助。例如  `missing_safety_docs`  检查可以帮助我们检查哪些  `unsafe`  函数遗漏了文档。

需要注意的是： Rust 编译器并不会默认开启所有检查，大家可以调用  `rustc -W help`  来看看最新的信息。

#### Prusti

[`prusti`](https://viperproject.github.io/prusti-dev/user-guide/)  需要大家自己来构建一个证明，然后通过它证明代码中的不变量是正确被使用的，当你在安全代码中使用不安全的不变量时，就会非常有用。具体的使用文档见[这里](https://viperproject.github.io/prusti-dev/user-guide/)。

#### 模糊测试(fuzz testing)

在  [Rust Fuzz Book](https://rust-fuzz.github.io/book/)  中列出了一些 Rust 可以使用的模糊测试方法。

同时，我们还可以使用  [`rutenspitz`](https://github.com/jakubadamw/rutenspitz)  这个过程宏来测试有状态的代码，例如数据结构。

### 总结

至此，`unsafe`  的五种兵器已介绍完毕，大家是否意犹未尽？我想说的是，就算意犹未尽，也没有其它兵器了。

就像上一章中所提到的，`unsafe`  只应该用于这五种场景，其它场景，你应该坚决的使用安全的代码，否则就会像  `actix-web`  的前作者一样，被很多人议论，甚至被喷。。。

总之，能不使用  `unsafe`  一定不要使用，就算使用也要控制好边界，让范围尽可能的小，就像本章的例子一样，只有真的需要  `unsafe`  的代码，才应该包含其中, 而不是将无关代码也纳入进来。

### 进一步学习

1. [Unsafe Rust: How and when (not) to use it](https://blog.logrocket.com/unsafe-rust-how-and-when-not-to-use-it/)

## 内联汇编

> 本章内容对于学习 Rust 不是必须的，而且难度很高，大家简单知道有这回事就好，不必非要学会 :D

Rust 提供了  `asm!`  宏，可以让大家在 Rust 代码中嵌入汇编代码，对于一些极致高性能或者底层的场景还是非常有用的，例如操作系统内核开发。但通常来说，大家并不应该在自己的项目中使用到该项技术，它为极客而生！

本章的例子是基于  `x86/x86-64`  汇编的，但是其它架构也是支持的，目前支持的包括：

- x86 和 x86-64
- ARM
- AArch64
- RISC-V

当使用在不支持的平台上时，编译器会给出报错。

### 基本用法

先从一个简单例子开始：

```rust
use std::arch::asm;

unsafe {
    asm!("nop");
}
```

注意  `unsafe`  语句块依然是必不可少的，因为可能在里面插入危险的指令，最终破坏代码的安全性。

上面代码将插入一个  `NOP`  指令( 空操作 ) 到编译器生成的汇编代码中，其中指令作为  `asm!`  的第一个参数传入。

### 输入和输出

上面的代码有够无聊的，来点实际的:

```rust
use std::arch::asm;

let x: u64; unsafe {
 asm!("mov {}, 5", out(reg) x);
}
assert_eq!(x, 5);
```

这段代码将  `5`  赋给  `u64`  类型的变量  `x`，值得注意的是  `asm!`  的指令参数实际上是一个格式化字符串。至于传给格式化字符串的参数，看起来还是比较陌生的：

- 首先，需要说明目标变量是作为内联汇编的输入还是输出，在本例中，是一个输出  `out`
- 最后，要指定变量将要使用的寄存器，本例中使用通用寄存器  `reg`，编译器会自动选择合适的寄存器

```rust
use std::arch::asm;

let i: u64 = 3;
let o: u64;
unsafe {
    asm!(
        "mov {0}, {1}",
        "add {0}, 5",
        out(reg) o,
        in(reg) i,
    );
}
assert_eq!(o, 8);

```

上面的代码中进一步使用了输入  `in`，将  `5`  加到输入的变量  `i`  上，然后将结果写到输出变量  `o`。实际的操作方式是首先将  `i`  的值拷贝到输出，然后再加上  `5`。

上例还能看出几点：

- `asm!`  允许使用多个格式化字符串，每一个作为单独一行汇编代码存在，看起来跟阅读真实的汇编代码类似
- 输入变量通过  `in`  来声明
- 和以前见过的格式化字符串一样，可以使用多个参数，通过 {0}, {1} 来指定，这种方式特别有用，毕竟在代码中，变量是经常复用的，而这种参数的指定方式刚好可以复用

事实上，还可以进一步优化代码，去掉  `mov`  指令:

```rust
use std::arch::asm;

let mut x: u64 = 3;
unsafe {
    asm!("add {0}, 5", inout(reg) x);
}
assert_eq!(x, 8);

```

又多出一个  `inout`  关键字，但是不难猜，它说明  `x`  即是输入又是输出。与之前的分离方式还有一点很大的区别，这种方式可以保证使用同一个寄存器来完成任务。

当然，你可以在使用  `inout`  的情况下，指定不同的输入和输出:

```rust
use std::arch::asm;

let x: u64 = 3;
let y: u64;
unsafe {
    asm!("add {0}, 5", inout(reg) x => y);
}
assert_eq!(y, 8);

```

### 延迟输出操作数

Rust 编译器对于操作数分配是较为保守的，它会假设  `out`  可以在任何时间被写入，因此  `out`  不会跟其它参数共享它的位置。然而为了保证最佳性能，使用尽量少的寄存器是有必要的，这样它们不必在内联汇编的代码块内保存和重加载。

为了达成这个目标( 共享位置或者说寄存器，以实现减少寄存器使用的性能优化 )，Rust 提供一个  `lateout`  关键字，可以用于任何只在所有输入被消费后才被写入的输出，与之类似的还有一个  `inlateout`。

但是  `inlateout`  在某些场景中是无法使用的，例如下面的例子：

```rust
use std::arch::asm;

let mut a: u64 = 4;
let b: u64 = 4;
let c: u64 = 4;
unsafe {
    asm!(
        "add {0}, {1}",
        "add {0}, {2}",
        inout(reg) a,
        in(reg) b,
        in(reg) c,
    );
}
assert_eq!(a, 12);

```

一旦用了  `inlateout`  后，上面的代码就只能运行在  `Debug`  模式下，原因是  `Debug`  并没有做任何优化，但是  `release`  发布不同，为了性能是要做很多编译优化的。

在编译优化时，编译器可以很容易的为输入  `b`  和  `c`  分配同样的是寄存器，因为它知道它们有同样的值。如果这里使用  `inlateout`， 那么  `a`  和  `c`  就可以被分配到相同的寄存器，在这种情况下，第一条指令将覆盖掉  `c`  的值，最终导致汇编代码产生错误的结果。

因此这里使用  `inout`，那么编译器就会为  `a`  分配一个独立的寄存器.

但是下面的代码又不同，它是可以使用  `inlateout`  的：

```rust
use std::arch::asm;

let mut a: u64 = 4;
let b: u64 = 4;
unsafe {
    asm!("add {0}, {1}", inlateout(reg) a, in(reg) b);
}
assert_eq!(a, 8);

```

原因在于输出只有在所有寄存器都被读取后，才被修改。因此，即使  `a`  和  `b`  被分配了同样的寄存器，代码也会正常工作，不存在之前的覆盖问题。

### 显式指定寄存器

一些指令会要求操作数只能存在特定的寄存器中，因此 Rust 的内联汇编提供了一些限制操作符。

大家应该记得之前出现过的  `reg`  是适用于任何架构的通用寄存器，意味着编译器可以自己选择合适的寄存器，但是当你需要显式地指定寄存器时，很可能会变成平台相关的代码，适用移植性会差很多。例如  `x86`  下的寄存器：`eax`, `ebx`, `ecx`, `ebp`, `esi`  等等。

```rust
use std::arch::asm;

let cmd = 0xd1;
unsafe {
    asm!("out 0x64, eax", in("eax") cmd);
}
```

上面的例子调用  `out`  指令将  `cmd`  变量的值输出到  `0x64`  内存地址中。由于  `out`  指令只接收  `eax`  和它的子寄存器，因此我们需要使用  `eax`  来指定特定的寄存器。

> 显式寄存器操作数无法用于格式化字符串中，例如我们之前使用的 {}，只能直接在字符串中使用  `eax`。同时，该操作数只能出现在最后，也就是在其它操作数后面出现

```rust
use std::arch::asm;

fn mul(a: u64, b: u64) -> u128 {
    let lo: u64;
    let hi: u64;

    unsafe {
        asm!(
            // The x86 mul instruction takes rax as an implicit input and writes
            // the 128-bit result of the multiplication to rax:rdx.
            "mul {}",
            in(reg) a,
            inlateout("rax") b => lo,
            lateout("rdx") hi
        );
    }

    ((hi as u128) << 64) + lo as u128
}
```

这段代码使用了  `mul`  指令，将两个 64 位的输入相乘，生成一个 128 位的结果。

首先将变量  `a`  的值存到寄存器  `reg`  中，其次显式使用寄存器  `rax`，它的值来源于变量  `b`。结果的低 64 位存储在  `rax`  中，然后赋给变量  `lo` ，而结果的高 64 位则存在  `rdx`  中，最后赋给  `hi`。

### Clobbered 寄存器

在很多情况下，无需作为输出的状态都会被内联汇编修改，这个状态被称之为 "clobbered"。

我们需要告诉编译器相关的情况，因为编译器需要在内联汇编语句块的附近存储和恢复这种状态。

```rust
use std::arch::asm;

fn main() {
    // three entries of four bytes each
    let mut name_buf = [0_u8; 12];
    // String is stored as ascii in ebx, edx, ecx in order
    // Because ebx is reserved, the asm needs to preserve the value of it.
    // So we push and pop it around the main asm.
    // (in 64 bit mode for 64 bit processors, 32 bit processors would use ebx)

    unsafe {
        asm!(
            "push rbx",
            "cpuid",
            "mov [rdi], ebx",
            "mov [rdi + 4], edx",
            "mov [rdi + 8], ecx",
            "pop rbx",
            // We use a pointer to an array for storing the values to simplify
            // the Rust code at the cost of a couple more asm instructions
            // This is more explicit with how the asm works however, as opposed
            // to explicit register outputs such as `out("ecx") val`
            // The *pointer itself* is only an input even though it's written behind
            in("rdi") name_buf.as_mut_ptr(),
            // select cpuid 0, also specify eax as clobbered
            inout("eax") 0 => _,
            // cpuid clobbers these registers too
            out("ecx") _,
            out("edx") _,
        );
    }

    let name = core::str::from_utf8(&name_buf).unwrap();
    println!("CPU Manufacturer ID: {}", name);
}
```

例子中，我们使用  `cpuid`  指令来读取 CPU ID，该指令会将值写入到  `eax` 、`edx`  和  `ecx`  中。

即使  `eax`  从没有被读取，我们依然需要告知编译器这个寄存器被修改过，这样编译器就可以在汇编代码之前存储寄存器中的值。这个需要通过将输出声明为  `_`  而不是一个具体的变量名，代表着该输出值被丢弃。

这段代码也会绕过一个限制： `ebx`  是一个 LLVM 保留寄存器，意味着 LLVM 会假设它拥有寄存器的全部控制权，并在汇编代码块结束时将寄存器的状态恢复到最开始的状态。由于这个限制，该寄存器无法被用于输入或者输出，除非编译器使用该寄存器的满足一个通用寄存器的需求(例如  `in(reg)` )。 但这样使用后， `reg`  操作数就在使用保留寄存器时变得危险起来，原因是我们可能会无意识的破坏输入或者输出，毕竟它们共享同一个寄存器。

为了解决这个问题，我们使用  `rdi`  来存储指向输出数组的指针，通过  `push`  的方式存储  `ebx`：在汇编代码块的内部读取  `ebx`  的值，然后写入到输出数组。后面再可以通过  `pop`  的方式来回复  `ebx`  到初始的状态。

`push`  和  `pop`  使用完成的 64 位  `rbx`  寄存器，来确保整个寄存器的内容都被保存。如果是在 32 位机器上，代码将使用  `ebx`  替代。

还还可以在汇编代码内部使用通用寄存器:

```rust
use std::arch::asm;

// Multiply x by 6 using shifts and adds
let mut x: u64 = 4;
unsafe {
    asm!(
        "mov {tmp}, {x}",
        "shl {tmp}, 1",
        "shl {x}, 2",
        "add {x}, {tmp}",
        x = inout(reg) x,
        tmp = out(reg) _,
    );
}
assert_eq!(x, 4 * 6);

```

### 总结

由于这块儿内容过于专业，本书毕竟是通用的 Rust 学习书籍，因此关于内联汇编就不再赘述。事实上，如果你要真的写出可用的汇编代码，要学习的还很多...

感兴趣的同学可以看看如下英文资料: [Rust Reference](https://doc.rust-lang.org/reference/inline-assembly.html)  和  [Rust By Example](https://doc.rust-lang.org/rust-by-example/unsafe/asm.html#clobbered-registers)。

![](https://visitor-badge.glitch.me/badge?page_id=/advance/unsafe/inline-asm.html)
