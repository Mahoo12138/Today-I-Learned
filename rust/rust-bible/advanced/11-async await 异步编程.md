# async await 异步编程
## Async 编程入门

众所周知，Rust 可以让我们写出性能高且安全的软件，那么异步编程这块儿呢？是否依然在高性能的同时保证了安全？

简单来说，异步编程是一个[[06-多线程并发编程#并发和并行|并发编程模型]]，目前主流语言基本都支持了，当然，支持的方式有所不同。异步编程允许我们同时并发运行大量的任务，却仅仅需要几个甚至一个 OS 线程或 CPU 核心，现代化的异步编程在使用体验上跟同步编程也几无区别，例如 Go 语言的 `go` 关键字，也包括我们后面将介绍的 `async/await` 语法，该语法是 `JavaScript` 和 `Rust` 的核心特性之一。

### async 简介

`async` 是 Rust 选择的异步编程模型，下面我们来介绍下它的优缺点，以及何时适合使用。

#### async vs 其它并发模型

由于并发编程在现代社会非常重要，因此每个主流语言都对自己的并发模型进行过权衡取舍和精心设计，Rust 语言也不例外。下面的列表可以帮助大家理解不同并发模型的取舍：

- **OS 线程**， 它最简单，也无需改变任何编程模型(业务/代码逻辑)，因此非常适合作为语言的原生并发模型，我们在[[06-多线程并发编程#并发和并行|多线程章节]]也提到过，Rust 就选择了原生支持线程级的并发编程。但是，这种模型也有缺点，例如线程间的同步将变得更加困难，线程间的上下文切换损耗较大。使用线程池在一定程度上可以提升性能，但是对于 IO 密集的场景来说，线程池还是不够。
- **事件驱动(Event driven)**， 这个名词你可能比较陌生，如果说事件驱动常常跟回调( Callback )一起使用，相信大家就恍然大悟了。这种模型性能相当的好，但最大的问题就是存在回调地狱的风险：非线性的控制流和结果处理导致了数据流向和错误传播变得难以掌控，还会导致代码可维护性和可读性的大幅降低，大名鼎鼎的 `JavaScript` 曾经就存在回调地狱。
- **协程(Coroutines)** 可能是目前最火的并发模型，`Go` 语言的协程设计就非常优秀，这也是 `Go` 语言能够迅速火遍全球的杀手锏之一。协程跟线程类似，无需改变编程模型，同时，它也跟 `async` 类似，可以支持大量的任务并发运行。但协程抽象层次过高，导致用户无法接触到底层的细节，这对于系统编程语言和自定义异步运行时是难以接受的
- **actor 模型**是 erlang 的杀手锏之一，它将所有并发计算分割成一个一个单元，这些单元被称为 `actor` ，单元之间通过消息传递的方式进行通信和数据传递，跟分布式系统的设计理念非常相像。由于 `actor` 模型跟现实很贴近，因此它相对来说更容易实现，但是一旦遇到流控制、失败重试等场景时，就会变得不太好用
- **async/await**， 该模型性能高，还能支持底层编程，同时又像线程和协程那样无需过多的改变编程模型，但有得必有失，`async` 模型的问题就是内部实现机制过于复杂，对于用户来说，理解和使用起来也没有线程和协程简单，好在前者的复杂性开发者们已经帮我们封装好，而理解和使用起来不够简单，正是本章试图解决的问题。

总之，Rust 经过权衡取舍后，最终选择了同时提供多线程编程和 async 编程:

- 前者通过标准库实现，当你无需那么高的并发时，例如需要并行计算时，可以选择它，优点是线程内的代码执行效率更高、实现更直观更简单，这块内容已经在多线程章节进行过深入讲解，不再赘述
- 后者通过语言特性 + 标准库 + 三方库的方式实现，在你需要高并发、异步 `I/O` 时，选择它就对了

#### async: Rust vs 其它语言

目前已经有诸多语言都通过 `async` 的方式提供了异步编程，例如 `JavaScript` ，但 `Rust` 在实现上有所区别：

- **Future 在 Rust 中是惰性的**，只有在被轮询(`poll`)时才会运行， 因此丢弃一个 `future` 会阻止它未来再被运行，你可以将`Future`理解为一个在未来某个时间点被调度执行的任务。
- **Async 在 Rust 中使用开销是零**， 意味着只有你能看到的代码(自己的代码)才有性能损耗，你看不到的(`async` 内部实现)都没有性能损耗，例如，你可以无需分配任何堆内存、也无需任何动态分发来使用 `async` ，这对于热点路径的性能有非常大的好处，正是得益于此，Rust 的异步编程性能才会这么高。
- **Rust 没有内置异步调用所必需的运行时**，但是无需担心，Rust 社区生态中已经提供了非常优异的运行时实现，例如大明星 [`tokio`](https://tokio.rs/)
- **运行时同时支持单线程和多线程**，这两者拥有各自的优缺点，稍后会讲

#### Rust: async vs 多线程

虽然 `async` 和多线程都可以实现并发编程，后者甚至还能通过线程池来增强并发能力，但是这两个方式并不互通，从一个方式切换成另一个需要大量的代码重构工作，因此提前为自己的项目选择适合的并发模型就变得至关重要。

`OS` 线程非常适合少量任务并发，因为线程的创建和上下文切换是非常昂贵的，甚至于空闲的线程都会消耗系统资源。虽说线程池可以有效的降低性能损耗，但是也无法彻底解决问题。当然，线程模型也有其优点，例如它不会破坏你的代码逻辑和编程模型，你之前的顺序代码，经过少量修改适配后依然可以在新线程中直接运行，同时在某些操作系统中，你还可以改变线程的优先级，这对于实现驱动程序或延迟敏感的应用(例如硬实时系统)很有帮助。

对于长时间运行的 CPU 密集型任务，例如并行计算，使用线程将更有优势。 这种密集任务往往会让所在的线程持续运行，任何不必要的线程切换都会带来性能损耗，因此高并发反而在此时成为了一种多余。同时你所创建的线程数应该等于 CPU 核心数，充分利用 CPU 的并行能力，甚至还可以将线程绑定到 CPU 核心上，进一步减少线程上下文切换。

而高并发更适合 `IO` 密集型任务，例如 web 服务器、数据库连接等等网络服务，因为这些任务绝大部分时间都处于等待状态，如果使用多线程，那线程大量时间会处于无所事事的状态，再加上线程上下文切换的高昂代价，让多线程做 `IO` 密集任务变成了一件非常奢侈的事。而使用`async`，既可以有效的降低 `CPU` 和内存的负担，又可以让大量的任务并发的运行，一个任务一旦处于`IO`或者其他等待(阻塞)状态，就会被立刻切走并执行另一个任务，而这里的任务切换的性能开销要远远低于使用多线程时的线程上下文切换。

事实上， `async` 底层也是基于线程实现，但是它基于线程封装了一个运行时，可以将多个任务映射到少量线程上，然后将线程切换变成了任务切换，后者仅仅是内存中的访问，因此要高效的多。

不过`async`也有其缺点，原因是编译器会为`async`函数生成状态机，然后将整个运行时打包进来，这会造成我们编译出的二进制可执行文件体积显著增大。

总之，`async`编程并没有比多线程更好，最终还是根据你的使用场景作出合适的选择，如果无需高并发，或者也不在意线程切换带来的性能损耗，那么多线程使用起来会简单、方便的多！最后再简单总结下：

> 若大家使用 tokio，那 CPU 密集的任务尤其需要用线程的方式去处理，例如使用 `spawn_blocking` 创建一个阻塞的线程去完成相应 CPU 密集任务。
> 
> 至于具体的原因，不仅是上文说到的那些，还有一个是：tokio 是协作式的调度器，如果某个 CPU 密集的异步任务是通过 tokio 创建的，那理论上来说，该异步任务需要跟其它的异步任务交错执行，最终大家都得到了执行，皆大欢喜。但实际情况是，CPU 密集的任务很可能会一直霸占着 CPU，此时 tokio 的调度方式决定了该任务会一直被执行，这意味着，其它的异步任务无法得到执行的机会，最终这些任务都会因为得不到资源而饿死。
> 
> 而使用 `spawn_blocking` 后，会创建一个单独的 OS 线程，该线程并不会被 tokio 所调度( 被 OS 所调度 )，因此它所执行的 CPU 密集任务也不会导致 tokio 调度的那些异步任务被饿死。

- 有大量 `IO` 任务需要并发运行时，选 `async` 模型
- 有部分 `IO` 任务需要并发运行时，选多线程，如果想要降低线程创建和销毁的开销，可以使用线程池
- 有大量 `CPU` 密集任务需要并行运行时，例如并行计算，选多线程模型，且让线程数等于或者稍大于 `CPU` 核心数
- 无所谓时，统一选多线程

#### async 和多线程的性能对比

| 操作   | async  | 线程     |
| ---- | ------ | ------ |
| 创建   | 0.3 微秒 | 17 微秒  |
| 线程切换 | 0.2 微秒 | 1.7 微秒 |
可以看出，`async` 在线程切换的开销显著低于多线程，对于 IO 密集的场景，这种性能开销累计下来会非常可怕！

#### 一个例子

在大概理解`async`后，我们再来看一个简单的例子。如果想并发的下载文件，你可以使用多线程如下实现：

```rust
fn get_two_sites() {
    // 创建两个新线程执行任务
    let thread_one = thread::spawn(|| download("https://course.rs"));
    let thread_two = thread::spawn(|| download("https://fancy.rs"));

    // 等待两个线程的完成
    thread_one.join().expect("thread one panicked");
    thread_two.join().expect("thread two panicked");
}
```

如果是在一个小项目中简单的去下载文件，这么写没有任何问题，但是一旦下载文件的并发请求多起来，那一个下载任务占用一个线程的模式就太重了，会很容易成为程序的瓶颈。好在，我们可以使用`async`的方式来解决：

```rust
async fn get_two_sites_async() {
    // 创建两个不同的`future`，你可以把`future`理解为未来某个时刻会被执行的计划任务
    // 当两个`future`被同时执行后，它们将并发的去下载目标页面
    let future_one = download_async("https://www.foo.com");
    let future_two = download_async("https://www.bar.com");

    // 同时运行两个`future`，直至完成
    join!(future_one, future_two);
}
```

此时，不再有线程创建和切换的昂贵开销，所有的函数都是通过静态的方式进行分发，同时也没有任何内存分配发生。这段代码的性能简直无懈可击！

事实上，`async` 和多线程并不是二选一，在同一应用中，可以根据情况两者一起使用，当然，我们还可以使用其它的并发模型，例如上面提到事件驱动模型，前提是有三方库提供了相应的实现。


### Async Rust 当前的进展

简而言之，Rust 语言的 `async` 目前还没有达到多线程的成熟度，其中一部分内容还在不断进化中，当然，这并不影响我们在生产级项目中使用，因为社区中还有 `tokio` 这种大杀器。

使用 `async` 时，你会遇到好的，也会遇到不好的，例如：

- 收获卓越的性能
- 会经常跟进阶语言特性打交道，例如生命周期等，这些家伙可不好对付
- 一些兼容性问题，例如同步和异步代码、不同的异步运行时( `tokio` 与 `async-std` )
- 更昂贵的维护成本，原因是 `async` 和社区开发的运行时依然在不停的进化

总之，`async` 在 Rust 中并不是一个善茬，你会遇到更多的困难或者说坑，也会带来更高的代码阅读成本及维护成本，但是为了性能，一切都值了，不是吗？

不过好在，这些进化早晚会彻底稳定成熟，而且在实际项目中，我们往往会使用成熟的三方库，例如`tokio`，因此可以避免一些类似的问题，但是对于本章的学习来说，`async` 的一些难点还是我们必须要去面对和征服的。

#### 语言和库的支持

`async` 的底层实现非常复杂，且会导致编译后文件体积显著增加，因此 Rust 没有选择像 Go 语言那样内置了完整的特性和运行时，而是选择了通过 Rust 语言提供了必要的特性支持，再通过社区来提供 `async` 运行时的支持。 因此要完整的使用 `async` 异步编程，你需要依赖以下特性和外部库：

- 所必须的特征(例如 `Future` )、类型和函数，由标准库提供实现
- 关键字 `async/await` 由 Rust 语言提供，并进行了编译器层面的支持
- 众多实用的类型、宏和函数由官方开发的 [`futures`](https://github.com/rust-lang/futures-rs) 包提供(不是标准库)，它们可以用于任何 `async` 应用中。
- `async` 代码的执行、`IO` 操作、任务创建和调度等等复杂功能由社区的 `async` 运行时提供，例如 [`tokio`](https://github.com/tokio-rs/tokio) 和 [`async-std`](https://github.com/async-rs/async-std)

还有，你在同步( `synchronous` )代码中使用的一些语言特性在 `async` 中可能将无法再使用，而且 Rust 也不允许你在特征中声明 `async` 函数(可以通过三方库实现)， 总之，你会遇到一些在同步代码中不会遇到的奇奇怪怪、形形色色的问题，不过不用担心，本章会专门用一个章节罗列这些问题，并给出相应的解决方案。

#### 编译和错误

在大多数情况下，`async` 中的编译错误和运行时错误跟之前没啥区别，但是依然有以下几点值得注意：

- 编译错误，由于 `async` 编程时需要经常使用复杂的语言特性，例如生命周期和`Pin`，因此相关的错误可能会出现的更加频繁
- 运行时错误，编译器会为每一个`async`函数生成状态机，这会导致在栈跟踪时会包含这些状态机的细节，同时还包含了运行时对函数的调用，因此，栈跟踪记录(例如 `panic` 时)将变得更加难以解读
- 一些隐蔽的错误也可能发生，例如在一个 `async` 上下文中去调用一个阻塞的函数，或者没有正确的实现 `Future` 特征都有可能导致这种错误。这种错误可能会悄无声息的通过编译检查甚至有时候会通过单元测试。好在一旦你深入学习并掌握了本章的内容和 `async` 原理，可以有效的降低遇到这些错误的概率

#### 兼容性考虑

异步代码和同步代码并不总能和睦共处。例如，我们无法在一个同步函数中去调用一个 `async` 异步函数，同步和异步代码也往往使用不同的设计模式，这些都会导致两者融合上的困难。

甚至于有时候，异步代码之间也存在类似的问题，如果一个库依赖于特定的 `async` 运行时来运行，那么这个库非常有必要告诉它的用户，它用了这个运行时。否则一旦用户选了不同的或不兼容的运行时，就会导致不可预知的麻烦。

#### 性能特性

`async` 代码的性能主要取决于你使用的 `async` 运行时，好在这些运行时都经过了精心的设计，在你能遇到的绝大多数场景中，它们都能拥有非常棒的性能表现。

但是世事皆有例外。目前主流的 `async` 运行时几乎都使用了多线程实现，相比单线程虽然增加了并发表现，但是对于执行性能会有所损失，因为多线程实现会有同步和切换上的性能开销，若你需要极致的顺序执行性能，那么 `async` 目前并不是一个好的选择。

同样的，对于延迟敏感的任务来说，任务的执行次序需要能被严格掌控，而不是交由运行时去自动调度，后者会导致不可预知的延迟，例如一个 web 服务器总是有 `1%` 的请求，它们的延迟会远高于其它请求，因为调度过于繁忙导致了部分任务被延迟调度，最终导致了较高的延时。正因为此，这些延迟敏感的任务非常依赖于运行时或操作系统提供调度次序上的支持。

以上的两个需求，目前的 `async` 运行时并不能很好的支持，在未来可能会有更好的支持，但在此之前，我们可以尝试用多线程解决。

### async/.await 简单入门

`async/.await` 是 Rust 内置的语言特性，可以让我们用同步的方式去编写异步的代码。

通过 `async` 标记的语法块会被转换成实现了`Future`特征的状态机。 与同步调用阻塞当前线程不同，当`Future`执行并遇到阻塞时，它会让出当前线程的控制权，这样其它的`Future`就可以在该线程中运行，这种方式完全不会导致当前线程的阻塞。

下面我们来通过例子学习 `async/.await` 关键字该如何使用，在开始之前，需要先引入 `futures` 包。编辑 `Cargo.toml` 文件并添加以下内容：
```toml
[dependencies] 
futures = "0.3"
```

#### 使用 async

首先，使用 `async fn` 语法来创建一个异步函数：

```rust
async fn do_something() {
    println!("go go go !");
}
```

需要注意，**异步函数的返回值是一个 `Future`**，若直接调用该函数，不会输出任何结果，因为 `Future` 还未被执行：

```rust
fn main() {
      do_something();
}
```

运行后，`go go go`并没有打印，同时编译器给予一个提示：`warning: unused implementer of Future that must be used`，告诉我们 `Future` 未被使用，那么到底该如何使用？答案是使用一个执行器 (`executor`)：

```rust
// `block_on`会阻塞当前线程直到指定的`Future`执行完成
// 这种阻塞当前线程以等待任务完成的方式较为简单、粗暴，
// 好在其它运行时的执行器(executor)会提供更加复杂的行为，
// 例如将多个`future`调度到同一个线程上执行。
use futures::executor::block_on;

async fn hello_world() {
    println!("hello, world!");
}

fn main() {
    let future = hello_world(); // 返回一个Future, 因此不会打印任何输出
    block_on(future); // 执行`Future`并等待其运行完成，此时"hello, world!"会被打印输出
}
```

#### 使用.await

在上述代码的`main`函数中，我们使用`block_on`这个执行器等待`Future`的完成，让代码看上去非常像是同步代码，但是如果你要在一个`async fn`函数中去调用另一个`async fn`并等待其完成后再执行后续的代码，该如何做？例如：

```rust
use futures::executor::block_on;

async fn hello_world() {
    hello_cat();
    println!("hello, world!");
}

async fn hello_cat() {
    println!("hello, kitty!");
}
fn main() {
    let future = hello_world();
    block_on(future);
}
```

这里，我们在`hello_world`异步函数中先调用了另一个异步函数`hello_cat`，然后再输出`hello, world!`，看看运行结果：

```rust
warning: unused implementer of `futures::Future` that must be used
 --> src/main.rs:6:5
  |
6 |     hello_cat();
  |     ^^^^^^^^^^^^
= note: futures do nothing unless you `.await` or poll them
...
hello, world!
```

不出所料，`main`函数中的`future`我们通过`block_on`函数进行了运行，但是这里的`hello_cat`返回的`Future`却没有任何人去执行它，不过好在编译器友善的给出了提示：``futures do nothing unless you `.await` or poll them``，两种解决方法：使用`.await`语法或者对`Future`进行轮询(`poll`)。

后者较为复杂，暂且不表，先来使用`.await`试试：

```rust
use futures::executor::block_on;

async fn hello_world() {
    hello_cat().await;
    println!("hello, world!");
}

async fn hello_cat() {
    println!("hello, kitty!");
}
fn main() {
    let future = hello_world();
    block_on(future);
}
```

为`hello_cat()`添加上`.await`后，结果立刻大为不同：

```text
hello, kitty!
hello, world!
```

输出的顺序跟代码定义的顺序完全符合，因此，我们在上面代码中**使用同步的代码顺序实现了异步的执行效果**，非常简单、高效，而且很好理解，未来也绝对不会有回调地狱的发生。

总之，在`async fn`函数中使用`.await`可以等待另一个异步调用的完成。**但是与`block_on`不同，`.await`并不会阻塞当前的线程**，而是异步的等待`Future A`的完成，在等待的过程中，该线程还可以继续执行其它的`Future B`，最终实现了并发处理的效果。


#### 一个例子

考虑一个载歌载舞的例子，如果不用`.await`，我们可能会有如下实现：

```rust
use futures::executor::block_on;

struct Song {
    author: String,
    name: String,
}

async fn learn_song() -> Song {
    Song {
        author: "周杰伦".to_string(),
        name: String::from("《菊花台》"),
    }
}

async fn sing_song(song: Song) {
    println!(
        "给大家献上一首{}的{} ~ {}",
        song.author, song.name, "菊花残，满地伤~ ~"
    );
}

async fn dance() {
    println!("唱到情深处，身体不由自主的动了起来~ ~");
}

fn main() {
    let song = block_on(learn_song());
    block_on(sing_song(song));
    block_on(dance());
}
```

当然，以上代码运行结果无疑是正确的，但。。。它的性能何在？需要通过连续三次阻塞去等待三个任务的完成，一次只能做一件事，实际上我们完全可以载歌载舞啊：

```rust
use futures::executor::block_on;

struct Song {
    author: String,
    name: String,
}

async fn learn_song() -> Song {
    Song {
        author: "曲婉婷".to_string(),
        name: String::from("《我的歌声里》"),
    }
}

async fn sing_song(song: Song) {
    println!(
        "给大家献上一首{}的{} ~ {}",
        song.author, song.name, "你存在我深深的脑海里~ ~"
    );
}

async fn dance() {
    println!("唱到情深处，身体不由自主的动了起来~ ~");
}

async fn learn_and_sing() {
    // 这里使用`.await`来等待学歌的完成，但是并不会阻塞当前线程，
    // 该线程在学歌的任务`.await`后，完全可以去执行跳舞的任务。
    let song = learn_song().await;

    // 唱歌必须要在学歌之后
    sing_song(song).await;
}

async fn async_main() {
    let f1 = learn_and_sing();
    let f2 = dance();

    // `join!`可以并发的处理和等待多个`Future`，若`learn_and_sing Future`被阻塞，
    // 那`dance Future`可以拿过线程的所有权继续执行。若`dance`也变成阻塞状态，
    // 那`learn_and_sing`又可以再次拿回线程所有权，继续执行。
    // 若两个都被阻塞，那么`async main`会变成阻塞状态，
    // 然后让出线程所有权，并将其交给`main`函数中的`block_on`执行器
    futures::join!(f1, f2);
}

fn main() {
    block_on(async_main());
}
```

上面代码中，学歌和唱歌具有明显的先后顺序，但是这两者都可以跟跳舞一同存在，也就是你可以在跳舞的时候学歌，也可以在跳舞的时候唱歌。如果上面代码不使用`.await`，而是使用`block_on(learn_song())`， 那在学歌时，当前线程就会阻塞，不再可以做其它任何事，包括跳舞。

因此`.await`对于实现异步编程至关重要，它允许我们在同一个线程内并发的运行多个任务，而不是一个一个先后完成。若大家看到这里还是不太明白，强烈建议回头再仔细看一遍，同时亲自上手修改代码试试效果。

至此，读者应该对 Rust 的`async/.await`异步编程有了一个清晰的初步印象，下面让我们一起来看看这背后的原理：`Future`和任务在底层如何被执行。

## 底层探秘: Future 执行器与任务调度

异步编程背后到底藏有什么秘密？究竟是哪只幕后之手在操纵这一切？如果你对这些感兴趣，就继续看下去，否则可以直接跳过，因为本章节的内容对于一个 API 工程师并没有太多帮助。

但是如果你希望能深入理解 `Rust` 的 `async/.await` 代码是如何工作、理解运行时和性能，甚至未来想要构建自己的 `async` 运行时或相关工具，那么本章节终究不会辜负于你。

### Future 特征

`Future` 特征是 Rust 异步编程的核心，毕竟异步函数是异步编程的核心，而 `Future` 恰恰是异步函数的返回值和被执行的关键。

首先，来给出 `Future` 的定义：它是一个能产出值的异步计算(虽然该值可能为空，例如 `()` )。光看这个定义，可能会觉得很空洞，我们来看看一个简化版的 `Future` 特征：

```rust
trait SimpleFuture {
    type Output;
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output>;
}

enum Poll<T> {
    Ready(T),
    Pending,
}
```

在上一章中，我们提到过 `Future` 需要被执行器`poll`(轮询)后才能运行，诺，这里 `poll` 就来了，通过调用该方法，可以推进 `Future` 的进一步执行，直到被切走为止( 这里不好理解，但是你只需要知道 `Future` 并不能保证在一次 `poll` 中就被执行完，后面会详解介绍)。

若在当前 `poll` 中， `Future` 可以被完成，则会返回 `Poll::Ready(result)` ，反之则返回 `Poll::Pending`， 并且安排一个 `wake` 函数：当未来 `Future` 准备好进一步执行时， 该函数会被调用，然后管理该 `Future` 的执行器(例如上一章节中的`block_on`函数)会再次调用 `poll` 方法，此时 `Future` 就可以继续执行了。

如果没有 `wake` 方法，那执行器无法知道某个 `Future` 是否可以继续被执行，除非执行器定期的轮询每一个 `Future`，确认它是否能被执行，但这种作法效率较低。而有了 `wake`，`Future` 就可以主动通知执行器，然后执行器就可以精确的执行该 `Future`。 这种“事件通知 -> 执行”的方式要远比定期对所有 `Future` 进行一次全遍历来的高效。

也许大家还是迷迷糊糊的，没事，我们用一个例子来说明下。考虑一个需要从 `socket` 读取数据的场景：如果有数据，可以直接读取数据并返回 `Poll::Ready(data)`， 但如果没有数据，`Future` 会被阻塞且不会再继续执行，此时它会注册一个 `wake` 函数，当 `socket` 数据准备好时，该函数将被调用以通知执行器：我们的 `Future` 已经准备好了，可以继续执行。

下面的 `SocketRead` 结构体就是一个 `Future`：

```rust
pub struct SocketRead<'a> {
    socket: &'a Socket,
}

impl SimpleFuture for SocketRead<'_> {
    type Output = Vec<u8>;

    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        if self.socket.has_data_to_read() {
            // socket有数据，写入buffer中并返回
            Poll::Ready(self.socket.read_buf())
        } else {
            // socket中还没数据
            //
            // 注册一个`wake`函数，当数据可用时，该函数会被调用，
            // 然后当前Future的执行器会再次调用`poll`方法，此时就可以读取到数据
            self.socket.set_readable_callback(wake);
            Poll::Pending
        }
    }
}
```

这种 `Future` 模型允许将多个异步操作组合在一起，同时还无需任何内存分配。不仅仅如此，如果你需要同时运行多个 `Future`或链式调用多个 `Future` ，也可以通过无内存分配的状态机实现，例如：

```rust
trait SimpleFuture {
    type Output;
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output>;
}

enum Poll<T> {
    Ready(T),
    Pending,
}

/// 一个SimpleFuture，它会并发地运行两个Future直到它们完成
///
/// 之所以可以并发，是因为两个Future的轮询可以交替进行，一个阻塞，另一个就可以立刻执行，反之亦然
pub struct Join<FutureA, FutureB> {
    // 结构体的每个字段都包含一个Future，可以运行直到完成.
    // 等到Future完成后，字段会被设置为 `None`. 这样Future完成后，就不会再被轮询
    a: Option<FutureA>,
    b: Option<FutureB>,
}

impl<FutureA, FutureB> SimpleFuture for Join<FutureA, FutureB>
where
    FutureA: SimpleFuture<Output = ()>,
    FutureB: SimpleFuture<Output = ()>,
{
    type Output = ();
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        // 尝试去完成一个 Future `a`
        if let Some(a) = &mut self.a {
            if let Poll::Ready(()) = a.poll(wake) {
                self.a.take();
            }
        }

        // 尝试去完成一个 Future `b`
        if let Some(b) = &mut self.b {
            if let Poll::Ready(()) = b.poll(wake) {
                self.b.take();
            }
        }

        if self.a.is_none() && self.b.is_none() {
            // 两个 Future都已完成 - 我们可以成功地返回了
            Poll::Ready(())
        } else {
            // 至少还有一个 Future 没有完成任务，因此返回 `Poll::Pending`.
            // 当该 Future 再次准备好时，通过调用`wake()`函数来继续执行
            Poll::Pending
        }
    }
}
```

上面代码展示了如何同时运行多个 `Future`， 且在此过程中没有任何内存分配，让并发编程更加高效。 类似的，多个`Future`也可以一个接一个的连续运行：

```rust
/// 一个SimpleFuture, 它使用顺序的方式，一个接一个地运行两个Future
//
// 注意: 由于本例子用于演示，因此功能简单，`AndThenFut` 会假设两个 Future 在创建时就可用了.
// 而真实的`Andthen`允许根据第一个`Future`的输出来创建第二个`Future`，因此复杂的多。
pub struct AndThenFut<FutureA, FutureB> {
    first: Option<FutureA>,
    second: FutureB,
}

impl<FutureA, FutureB> SimpleFuture for AndThenFut<FutureA, FutureB>
where
    FutureA: SimpleFuture<Output = ()>,
    FutureB: SimpleFuture<Output = ()>,
{
    type Output = ();
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        if let Some(first) = &mut self.first {
            match first.poll(wake) {
                // 我们已经完成了第一个 Future， 可以将它移除， 然后准备开始运行第二个
                Poll::Ready(()) => self.first.take(),
                // 第一个 Future 还不能完成
                Poll::Pending => return Poll::Pending,
            };
        }

        // 运行到这里，说明第一个Future已经完成，尝试去完成第二个
        self.second.poll(wake)
    }
}
```

这些例子展示了在不需要内存对象分配以及深层嵌套回调的情况下，该如何使用 `Future` 特征去表达异步控制流。 在了解了基础的控制流后，我们再来看看真实的 `Future` 特征有何不同之处。

```rust
trait Future {
    type Output;
    fn poll(
        // 首先值得注意的地方是，`self`的类型从`&mut self`变成了`Pin<&mut Self>`:
        self: Pin<&mut Self>,
        // 其次将`wake: fn()` 修改为 `cx: &mut Context<'_>`:
        cx: &mut Context<'_>,
    ) -> Poll<Self::Output>;
}
```

首先这里多了一个 `Pin` ，关于它我们会在后面章节详细介绍，现在你只需要知道使用它可以创建一个无法被移动的 `Future` ，因为无法被移动，所以它将具有固定的内存地址，意味着我们可以存储它的指针(如果内存地址可能会变动，那存储指针地址将毫无意义！)，也意味着可以实现一个自引用数据结构: `struct MyFut { a: i32, ptr_to_a: *const i32 }`。 而对于 `async/await` 来说，`Pin` 是不可或缺的关键特性。

其次，从 `wake: fn()` 变成了 `&mut Context<'_>` 。意味着 `wake` 函数可以携带数据了，为何要携带数据？考虑一个真实世界的场景，一个复杂应用例如 web 服务器可能有数千连接同时在线，那么同时就有数千 `Future` 在被同时管理着，如果不能携带数据，当一个 `Future` 调用 `wake` 后，执行器该如何知道是哪个 `Future` 调用了 `wake` ,然后进一步去 `poll` 对应的 `Future` ？没有办法！那之前的例子为啥就可以使用没有携带数据的 `wake` ？ 因为足够简单，不存在歧义性。

总之，在正式场景要进行 `wake` ，就必须携带上数据。 而 `Context` 类型通过提供一个 `Waker` 类型的值，就可以用来唤醒特定的的任务。

### 使用 Waker 来唤醒任务 

#TODO 基本看不懂，或者说没搞明白

对于 `Future` 来说，第一次被 `poll` 时无法完成任务是很正常的。但它需要确保在未来一旦准备好时，可以通知执行器再次对其进行 `poll` 进而继续往下执行，该通知就是通过 `Waker` 类型完成的。

`Waker` 提供了一个 `wake()` 方法可以用于告诉执行器：相关的任务可以被唤醒了，此时执行器就可以对相应的 `Future` 再次进行 `poll` 操作。

#### 构建一个定时器

下面一起来实现一个简单的定时器 `Future` 。为了让例子尽量简单，当计时器创建时，我们会启动一个线程接着让该线程进入睡眠，等睡眠结束后再通知给 `Future` 。

注意本例子还会在后面继续使用，因此我们重新创建一个工程来演示：使用 `cargo new --lib timer_future` 来创建一个新工程，在 `lib` 包的根路径 `src/lib.rs` 中添加以下内容：

```rust
use std::{
    future::Future,
    pin::Pin,
    sync::{Arc, Mutex},
    task::{Context, Poll, Waker},
    thread,
    time::Duration,
};
```

继续来实现 `Future` 定时器，之前提到：新建线程在睡眠结束后会需要将状态同步给定时器 `Future` ，由于是多线程环境，我们需要使用 `Arc<Mutex<T>>` 来作为一个共享状态，用于在新线程和 `Future` 定时器间共享。

```rust
pub struct TimerFuture {
    shared_state: Arc<Mutex<SharedState>>,
}

/// 在Future和等待的线程间共享状态
struct SharedState {
    /// 定时(睡眠)是否结束
    completed: bool,

    /// 当睡眠结束后，线程可以用`waker`通知`TimerFuture`来唤醒任务
    waker: Option<Waker>,
}
```

下面给出 `Future` 的具体实现：

```rust
impl Future for TimerFuture {
    type Output = ();
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        // 通过检查共享状态，来确定定时器是否已经完成
        let mut shared_state = self.shared_state.lock().unwrap();
        if shared_state.completed {
            Poll::Ready(())
        } else {
            // 设置`waker`，这样新线程在睡眠(计时)结束后可以唤醒当前的任务，接着再次对`Future`进行`poll`操作,
            //
            // 下面的`clone`每次被`poll`时都会发生一次，实际上，应该是只`clone`一次更加合理。
            // 选择每次都`clone`的原因是： `TimerFuture`可以在执行器的不同任务间移动，如果只克隆一次，
            // 那么获取到的`waker`可能已经被篡改并指向了其它任务，最终导致执行器运行了错误的任务
            shared_state.waker = Some(cx.waker().clone());
            Poll::Pending
        }
    }
}
```

代码很简单，只要新线程设置了 `shared_state.completed = true` ，那任务就能顺利结束。如果没有设置，会为当前的任务克隆一份 `Waker` ，这样新线程就可以使用它来唤醒当前的任务。

最后，再来创建一个 API 用于构建定时器和启动计时线程：

```rust
impl TimerFuture {
    /// 创建一个新的`TimerFuture`，在指定的时间结束后，该`Future`可以完成
    pub fn new(duration: Duration) -> Self {
        let shared_state = Arc::new(Mutex::new(SharedState {
            completed: false,
            waker: None,
        }));

        // 创建新线程
        let thread_shared_state = shared_state.clone();
        thread::spawn(move || {
            // 睡眠指定时间实现计时功能
            thread::sleep(duration);
            let mut shared_state = thread_shared_state.lock().unwrap();
            // 通知执行器定时器已经完成，可以继续`poll`对应的`Future`了
            shared_state.completed = true;
            if let Some(waker) = shared_state.waker.take() {
                waker.wake()
            }
        });

        TimerFuture { shared_state }
    }
}
```

至此，一个简单的定时器 `Future` 就已创建成功，那么该如何使用它呢？相信部分爱动脑筋的读者已经猜到了：我们需要创建一个执行器，才能让程序动起来。

### 执行器 Executor

Rust 的 `Future` 是惰性的：只有屁股上拍一拍，它才会努力动一动。其中一个推动它的方式就是在 `async` 函数中使用 `.await` 来调用另一个 `async` 函数，但是这个只能解决 `async` 内部的问题，那么这些最外层的 `async` 函数，谁来推动它们运行呢？答案就是我们之前多次提到的执行器 `executor` 。

执行器会管理一批 `Future` (最外层的 `async` 函数)，然后通过不停地 `poll` 推动它们直到完成。 最开始，执行器会先 `poll` 一次 `Future` ，后面就不会主动去 `poll` 了，而是等待 `Future` 通过调用 `wake` 函数来通知它可以继续，它才会继续去 `poll` 。这种 **wake 通知然后 poll** 的方式会不断重复，直到 `Future` 完成。

#### 构建执行器

下面我们将实现一个简单的执行器，它可以同时并发运行多个 `Future` 。例子中，需要用到 `futures` 包的 `ArcWake` 特征，它可以提供一个方便的途径去构建一个 `Waker` 。编辑 `Cargo.toml` ，添加下面依赖：

```toml
[dependencies]
futures = "0.3"
```

在之前的内容中，我们在 `src/lib.rs` 中创建了定时器 `Future` ，现在在 `src/main.rs` 中来创建程序的主体内容，开始之前，先引入所需的包：

```rust
use {
    futures::{
        future::{BoxFuture, FutureExt},
        task::{waker_ref, ArcWake},
    },
    std::{
        future::Future,
        sync::mpsc::{sync_channel, Receiver, SyncSender},
        sync::{Arc, Mutex},
        task::{Context, Poll},
        time::Duration,
    },
    // 引入之前实现的定时器模块
    timer_future::TimerFuture,
};
```

执行器需要从一个消息通道( `channel` )中拉取事件，然后运行它们。当一个任务准备好后（可以继续执行），它会将自己放入消息通道中，然后等待执行器 `poll` 。

```rust
/// 任务执行器，负责从通道中接收任务然后执行
struct Executor {
    ready_queue: Receiver<Arc<Task>>,
}

/// `Spawner`负责创建新的`Future`然后将它发送到任务通道中
#[derive(Clone)]
struct Spawner {
    task_sender: SyncSender<Arc<Task>>,
}

/// 一个Future，它可以调度自己(将自己放入任务通道中)，然后等待执行器去`poll`
struct Task {
    /// 进行中的Future，在未来的某个时间点会被完成
    ///
    /// 按理来说`Mutex`在这里是多余的，因为我们只有一个线程来执行任务。但是由于
    /// Rust并不聪明，它无法知道`Future`只会在一个线程内被修改，并不会被跨线程修改。因此
    /// 我们需要使用`Mutex`来满足这个笨笨的编译器对线程安全的执着。
    ///
    /// 如果是生产级的执行器实现，不会使用`Mutex`，因为会带来性能上的开销，取而代之的是使用`UnsafeCell`
    future: Mutex<Option<BoxFuture<'static, ()>>>,

    /// 可以将该任务自身放回到任务通道中，等待执行器的poll
    task_sender: SyncSender<Arc<Task>>,
}

fn new_executor_and_spawner() -> (Executor, Spawner) {
    // 任务通道允许的最大缓冲数(任务队列的最大长度)
    // 当前的实现仅仅是为了简单，在实际的执行中，并不会这么使用
    const MAX_QUEUED_TASKS: usize = 10_000;
    let (task_sender, ready_queue) = sync_channel(MAX_QUEUED_TASKS);
    (Executor { ready_queue }, Spawner { task_sender })
}
```

下面再来添加一个方法用于生成 `Future` , 然后将它放入任务通道中：

```rust
impl Spawner {
    fn spawn(&self, future: impl Future<Output = ()> + 'static + Send) {
        let future = future.boxed();
        let task = Arc::new(Task {
            future: Mutex::new(Some(future)),
            task_sender: self.task_sender.clone(),
        });
        self.task_sender.send(task).expect("任务队列已满");
    }
}
```

在执行器 `poll` 一个 `Future` 之前，首先需要调用 `wake` 方法进行唤醒，然后再由 `Waker` 负责调度该任务并将其放入任务通道中。创建 `Waker` 的最简单的方式就是实现 `ArcWake` 特征，先来为我们的任务实现 `ArcWake` 特征，这样它们就能被转变成 `Waker` 然后被唤醒：

```rust
impl ArcWake for Task {
    fn wake_by_ref(arc_self: &Arc<Self>) {
        // 通过发送任务到任务管道的方式来实现`wake`，这样`wake`后，任务就能被执行器`poll`
        let cloned = arc_self.clone();
        arc_self
            .task_sender
            .send(cloned)
            .expect("任务队列已满");
    }
}
```

当任务实现了 `ArcWake` 特征后，它就变成了 `Waker` ，在调用 `wake()` 对其唤醒后会将任务复制一份所有权( `Arc` )，然后将其发送到任务通道中。最后我们的执行器将从通道中获取任务，然后进行 `poll` 执行：

```rust
impl Executor {
    fn run(&self) {
        while let Ok(task) = self.ready_queue.recv() {
            // 获取一个future，若它还没有完成(仍然是Some，不是None)，则对它进行一次poll并尝试完成它
            let mut future_slot = task.future.lock().unwrap();
            if let Some(mut future) = future_slot.take() {
                // 基于任务自身创建一个 `LocalWaker`
                let waker = waker_ref(&task);
                let context = &mut Context::from_waker(&*waker);
                // `BoxFuture<T>`是`Pin<Box<dyn Future<Output = T> + Send + 'static>>`的类型别名
                // 通过调用`as_mut`方法，可以将上面的类型转换成`Pin<&mut dyn Future + Send + 'static>`
                if future.as_mut().poll(context).is_pending() {
                    // Future还没执行完，因此将它放回任务中，等待下次被poll
                    *future_slot = Some(future);
                }
            }
        }
    }
}

```

恭喜！我们终于拥有了自己的执行器，下面再来写一段代码使用该执行器去运行之前的定时器 `Future` ：

```rust
fn main() {
    let (executor, spawner) = new_executor_and_spawner();

    // 生成一个任务
    spawner.spawn(async {
        println!("howdy!");
        // 创建定时器Future，并等待它完成
        TimerFuture::new(Duration::new(2, 0)).await;
        println!("done!");
    });

    // drop掉任务，这样执行器就知道任务已经完成，不会再有新的任务进来
    drop(spawner);

    // 运行执行器直到任务队列为空
    // 任务运行后，会先打印`howdy!`, 暂停2秒，接着打印 `done!`
    executor.run();
}
```

### 执行器和系统 IO

前面我们一起看过一个使用 `Future` 从 `Socket` 中异步读取数据的例子：

```rust
pub struct SocketRead<'a> {
    socket: &'a Socket,
}

impl SimpleFuture for SocketRead<'_> {
    type Output = Vec<u8>;

    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        if self.socket.has_data_to_read() {
            // socket有数据，写入buffer中并返回
            Poll::Ready(self.socket.read_buf())
        } else {
            // socket中还没数据
            //
            // 注册一个`wake`函数，当数据可用时，该函数会被调用，
            // 然后当前Future的执行器会再次调用`poll`方法，此时就可以读取到数据
            self.socket.set_readable_callback(wake);
            Poll::Pending
        }
    }
}
```

该例子中，`Future` 将从 `Socket` 读取数据，若当前还没有数据，则会让出当前线程的所有权，允许执行器去执行其它的 `Future` 。当数据准备好后，会调用 `wake()` 函数将该 `Future` 的任务放入任务通道中，等待执行器的 `poll` 。

关于该流程已经反复讲了很多次，相信大家应该非常清楚了。然而该例子中还有一个疑问没有解决：

- `set_readable_callback` 方法到底是怎么工作的？怎么才能知道 `socket` 中的数据已经可以被读取了？

关于第二点，其中一个简单粗暴的方法就是使用一个新线程不停的检查 `socket` 中是否有了数据，当有了后，就调用 `wake()` 函数。该方法确实可以满足需求，但是性能着实太低了，需要为每个阻塞的 `Future` 都创建一个单独的线程！

在现实世界中，该问题往往是通过操作系统提供的 `IO` 多路复用机制来完成，例如 `Linux` 中的 **`epoll`**，`FreeBSD` 和 `macOS` 中的 **`kqueue`** ，`Windows` 中的 **`IOCP`**, `Fuchisa`中的 **`ports`** 等(可以通过 Rust 的跨平台包 `mio` 来使用它们)。借助 IO 多路复用机制，可以实现一个线程同时阻塞地去等待多个异步 IO 事件，一旦某个事件完成就立即退出阻塞并返回数据。相关实现类似于以下代码：

```rust
struct IoBlocker {
    /* ... */
}

struct Event {
    // Event的唯一ID，该事件发生后，就会被监听起来
    id: usize,

    // 一组需要等待或者已发生的信号
    signals: Signals,
}

impl IoBlocker {
    /// 创建需要阻塞等待的异步IO事件的集合
    fn new() -> Self { /* ... */ }

    /// 对指定的IO事件表示兴趣
    fn add_io_event_interest(
        &self,

        /// 事件所绑定的socket
        io_object: &IoObject,

        event: Event,
    ) { /* ... */ }

    /// 进入阻塞，直到某个事件出现
    fn block(&self) -> Event { /* ... */ }
}

let mut io_blocker = IoBlocker::new();
io_blocker.add_io_event_interest(
    &socket_1,
    Event { id: 1, signals: READABLE },
);
io_blocker.add_io_event_interest(
    &socket_2,
    Event { id: 2, signals: READABLE | WRITABLE },
);
let event = io_blocker.block();

// 当socket的数据可以读取时，打印 "Socket 1 is now READABLE"
println!("Socket {:?} is now {:?}", event.id, event.signals);
```

这样，我们只需要一个执行器线程，它会接收 IO 事件并将其分发到对应的 `Waker` 中，接着后者会唤醒相关的任务，最终通过执行器 `poll` 后，任务可以顺利地继续执行, 这种 IO 读取流程可以不停的循环，直到 `socket` 关闭。