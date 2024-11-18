---
title: 入门实战：文件搜索工具
---
# 构建一个简单命令行程序

在前往更高的山峰前，我们应该驻足欣赏下身后的风景，虽然是半览众山不咋小，但总比身在此山中无法窥全貌要强一丢丢。

在本章中，我们将一起构建一个命令行程序，目标是尽可能帮大家融会贯通之前的学到的知识。

linux 系统中的 `grep` 命令很强大，可以完成各种文件搜索任务，我们肯定做不了那么强大，但是假冒一个伪劣的版本还是可以的，它将从命令行参数中读取指定的文件名和字符串，然后在相应的文件中找到包含该字符串的内容，最终打印出来。

## 实现基本功能

无论功能设计的再怎么花里胡哨，对于一个文件查找命令而言，首先得指定文件和待查找的字符串，它们需要用户从命令行给予输入，然后我们在程序内进行读取。

### 接收命令行参数

国际惯例，先创建一个新的项目 `minigrep` ，该名字充分体现了我们的自信：就是不如 `grep`。

```shell
cargo new minigrep
```

首先来思考下，如果要传入文件路径和待搜索的字符串，那这个命令该长啥样，我觉得大概率是这样：

```shell
cargo run -- searchstring example-filename.txt
```

`--` 告诉 `cargo` 后面的参数是给我们的程序使用的，而不是给 `cargo` 自己使用，例如 `--` 前的 `run` 就是给它用的。

接下来就是在程序中读取传入的参数，这个很简单，下面代码就可以：

```rust
// in main.rs
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    dbg!(args);
}
```

首先通过 `use` 引入标准库中的 `env` 包，然后 `env::args` 方法会读取并分析传入的命令行参数，最终通过 `collect` 方法输出一个集合类型 `Vector`。

可能有同学疑惑，为啥不直接引入 `args` ，例如 `use std::env::args` ，这样就无需 `env::args` 来繁琐调用，直接`args.collect()` 即可。原因很简单，`args` 方法只会使用一次，啰嗦就啰嗦点吧，把相同的好名字让给 `let args..` 这位大哥不好吗？毕竟人家要出场多次的。

> ### 不可信的输入
> 
> 所有的用户输入都不可信！不可信！不可信！
> 
> 重要的话说三遍，我们的命令行程序也是，用户会输入什么你根本就不知道，例如他输入了一个非 Unicode 字符，你能阻止吗？显然不能，但是这种输入会直接让我们的程序崩溃！
>
>原因是当传入的命令行参数包含非 Unicode 字符时， `std::env::args` 会直接崩溃，如果有这种特殊需求，建议大家使用 `std::env::args_os`，该方法产生的数组将包含 `OsString` 类型，而不是之前的 `String` 类型，前者对于非 Unicode 字符会有更好的处理。
>
>至于为啥我们不用，两个理由，你信哪个：1. 用户爱输入啥输入啥，反正崩溃了，他就知道自己错了，其次 `args_os` 会引入额外的跨平台复杂性。

`collect` 方法其实并不是`std::env`包提供的，而是迭代器自带的方法(`env::args()` 会返回一个迭代器)，它会将迭代器消费后转换成我们想要的集合类型，关于迭代器和 `collect` 的具体介绍，请参考[[02-函数式编程-迭代器|这里]]。

最后，代码中使用 `dbg!` 宏来输出读取到的数组内容，来看看长啥样：

```shell
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.61s
     Running `target/debug/minigrep`
[src/main.rs:5] args = [
    "target/debug/minigrep",
]

$ cargo run -- needle haystack
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 1.57s
     Running `target/debug/minigrep needle haystack`
[src/main.rs:5] args = [
    "target/debug/minigrep",
    "needle",
    "haystack",
]
```

上面两个版本分别是无参数和两个参数，其中无参数版本实际上也会读取到一个字符串，仔细看，是不是长得很像我们的程序名，Bingo! `env::args` 读取到的参数中第一个就是程序的可执行路径名。

### 存储读取到的参数

在编程中，给予清晰合理的变量名是一项基本功，咱总不能到处都是 `args[1]` 、`args[2]` 这样的糟糕代码吧。

因此我们需要两个变量来存储文件路径和待搜索的字符串：

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {}", query);
    println!("In file {}", file_path);
}
```

很简单的代码，来运行下：

```shell
$ cargo run -- test sample.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep test sample.txt`
Searching for test
In file sample.txt
```

输出结果很清晰的说明了我们的目标：在文件 `sample.txt` 中搜索包含 `test` 字符串的内容。

事实上，就算作为一个简单的程序，它也太过于简单了，例如用户不提供任何参数怎么办？因此，错误处理显然是不可少的，但是在添加之前，先来看看如何读取文件内容。

### 文件读取

既然读取文件，那么首先我们需要创建一个文件并给予一些内容，来首诗歌如何？"我啥也不是，你呢?"

```text
I'm nobody! Who are you?
我啥也不是，你呢？
Are you nobody, too?
牛逼如你也是无名之辈吗？
Then there's a pair of us - don't tell!
那我们就是天生一对，嘘！别说话！
They'd banish us, you know.
你知道，我们不属于这里。
How dreary to be somebody!
因为这里属于没劲的大人物！
How public, like a frog
他们就像青蛙一样呱噪，
To tell your name the livelong day
成天将自己的大名
To an admiring bog!
传遍整个无聊的沼泽！
```

在项目根目录创建 `poem.txt` 文件，并写入如上的优美诗歌(可能翻译的很烂，别打我，哈哈，事实上大家写入英文内容就够了)。

接下来修改 `main.rs` 来读取文件内容：

```rust
use std::env;
use std::fs;

fn main() {
    // --省略之前的内容--
    println!("In file {}", file_path);

    let contents = fs::read_to_string(file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}
```

首先，通过 `use std::fs` 引入文件操作包，然后通过 `fs::read_to_string` 读取指定的文件内容，最后返回的 `contents` 是 `std::io::Result<String>` 类型。

运行下试试，这里无需输入第二个参数，因为我们还没有实现查询功能。

完美，虽然代码还有很多瑕疵，例如所有内容都在 `main` 函数，这个不符合软件工程，没有错误处理，功能不完善等。不过没关系，万事开头难，好歹我们成功迈开了第一步。

好了，是时候重构赚波 KPI 了，读者：are you serious? 这就开始重构了？

## 增加模块化和错误处理

但凡稍微没那么糟糕的程序，都应该具有代码模块化和错误处理，不然连玩具都谈不上。

梳理我们的代码和目标后，可以整理出大致四个改进点：

- **单一且庞大的函数**。对于 `minigrep` 程序而言， `main` 函数当前执行两个任务：解析命令行参数和读取文件。但随着代码的增加，`main` 函数承载的功能也将快速增加。从软件工程角度来看，一个函数具有的功能越多，越是难以阅读和维护。因此最好的办法是将大的函数拆分成更小的功能单元。
- **配置变量散乱在各处**。还有一点要考虑的是，当前 `main` 函数中的变量都是独立存在的，这些变量很可能被整个程序所访问，在这个背景下，独立的变量越多，越是难以维护，因此我们还可以将这些用于配置的变量整合到一个结构体中。
- **细化错误提示**。 目前的实现中，我们使用 `expect` 方法来输出文件读取失败时的错误信息，这个没问题，但是无论任何情况下，都只输出 `Should have been able to read the file` 这条错误提示信息，显然是有问题的，毕竟文件不存在、无权限等等都是可能的错误，一条大一统的消息无法给予用户更多的提示。
- **使用错误而不是异常**。 假如用户不给任何命令行参数，那我们的程序显然会无情崩溃，原因很简单：`index out of bounds`，一个数组访问越界的 `panic`，但问题来了，用户能看懂吗？甚至于未来接收的维护者能看懂吗？因此需要增加合适的错误处理代码，来给予使用者给详细友善的提示。还有就是需要在一个统一的位置来处理所有错误，利人利己！

### 分离 main 函数

关于如何处理庞大的 `main` 函数，Rust 社区给出了统一的指导方案:

- 将程序分割为 `main.rs` 和 `lib.rs`，并将程序的逻辑代码移动到后者内
- 命令行解析属于非常基础的功能，严格来说不算是逻辑代码的一部分，因此还可以放在 `main.rs` 中

这个方案有一个很优雅的名字: **关注点分离 (Separation of Concerns)**。简而言之，`main.rs` 负责启动程序，`lib.rs` 负责逻辑代码的运行。从测试的角度而言，这种分离也非常合理： `lib.rs` 中的主体逻辑代码可以得到简单且充分的测试，至于 `main.rs` ？确实没办法针对其编写额外的测试代码，但是它的代码也很少啊，很容易就能保证它的正确性。


#### 分离命令行解析

根据之前的分析，我们需要将命令行解析的代码分离到一个单独的函数，然后将该函数放置在 `main.rs` 中：

```rust
// in main.rs
fn main() {
    let args: Vec<String> = env::args().collect();

    let (query, file_path) = parse_config(&args);

    // --省略--
}

fn parse_config(args: &[String]) -> (&str, &str) {
    let query = &args[1];
    let file_path = &args[2];

    (query, file_path)
}
```

经过分离后，之前的设计目标完美达成，即精简了 `main` 函数，又将配置相关的代码放在了 `main.rs` 文件里。

看起来貌似是杀鸡用了牛刀，但是重构就是这样，一步一步，踏踏实实的前行，否则未来代码多一些后，你岂不是还要再重来一次重构？因此打好项目的基础是非常重要的！

#### 聚合配置变量

前文提到，配置变量并不适合分散的到处都是，因此使用一个结构体来统一存放是非常好的选择，这样修改后，后续的使用以及未来的代码维护都将更加简单明了。

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = parse_config(&args);

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    // --snip--
}

struct Config {
    query: String,
    file_path: String,
}

fn parse_config(args: &[String]) -> Config {
    let query = args[1].clone();
    let file_path = args[2].clone();

    Config { query, file_path }
}
```

值得注意的是，`Config` 中存储的并不是 `&str` 这样的引用类型，而是一个 `String` 字符串，也就是 `Config` 并没有去借用外部的字符串，而是**拥有内部字符串的所有权**。`clone` 方法的使用也可以佐证这一点。大家可以尝试不用 `clone` 方法，看看该如何解决相关的报错 :D
     
> `clone` 的得与失
>
>在上面的代码中，除了使用 `clone` ，还有其它办法来达成同样的目的，但 `clone` 无疑是最简单的方法：直接完整的复制目标数据，无需被所有权、借用等问题所困扰，但是它也有其缺点，那就是有一定的性能损耗。
>
>因此是否使用 `clone` 更多是一种性能上的权衡，对于上面的使用而言，由于是配置的初始化，因此整个程序只需要执行一次，性能损耗几乎是可以忽略不计的。
>
>总之，判断是否使用 `clone`:
>
>- 是否严肃的项目，玩具项目直接用 `clone` 就行，简单不好吗？
>- 要看所在的代码路径是否是热点路径(hot path)，例如执行次数较多的显然就是热点路径，热点路径就值得去使用性能更好的实现方式

好了，言归正传，从 `C` 语言过来的同学可能会觉得上面的代码已经很棒了，但是从 OO 语言角度来说，还差了那么一点意思。

下面我们试着来优化下，通过构造函数来初始化一个 `Config` 实例，而不是直接通过函数返回实例，典型的，标准库中的 `String::new` 函数就是一个范例。

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args);

    // --snip--
}

// --snip--

impl Config {
    fn new(args: &[String]) -> Config {
        let query = args[1].clone();
        let file_path = args[2].clone();

        Config { query, file_path }
    }
}
```

修改后，类似 `String::new` 的调用，我们可以通过 `Config::new` 来创建一个实例，看起来代码是不是更有那味儿了 ：）

### 错误处理

回顾一下，如果用户不输入任何命令行参数，我们的程序会怎么样？

```text
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep`
thread 'main' panicked at 'index out of bounds: the len is 1 but the index is 1', src/main.rs:27:21
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

结果喜闻乐见，由于 `args` 数组没有任何元素，因此通过索引访问时，会直接报出数组访问越界的 `panic`。

报错信息对于开发者会很明确，但是对于使用者而言，就相当难理解了，下面一起来解决它。

#### 改进报错信息

还记得在错误处理章节，我们提到过 `panic` 的两种用法: 被动触发和主动调用嘛？上面代码的出现方式很明显是被动触发，这种报错信息是不可控的，下面我们先改成主动调用的方式：

```rust
// in main.rs
 // --snip--
    fn new(args: &[String]) -> Config {
        if args.len() < 3 {
            panic!("not enough arguments");
        }
        // --snip--
```

目的很明确，一旦传入的参数数组长度小于 3，则报错并让程序崩溃推出，这样后续的数组访问就不会再越界了。

```text
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep`
thread 'main' panicked at 'not enough arguments', src/main.rs:26:13
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

不错，用户看到了更为明确的提示，但是还是有一大堆 `debug` 输出，这些我们其实是不想让用户看到的。这么看来，想要输出对用户友好的信息, `panic` 是不太适合的，它*更适合告知开发者，哪里出现了问题*。

#### 返回 Result 来替代直接 panic

那只能祭出之前学过的错误处理大法了，也就是返回一个 `Result`：成功时包含 `Config` 实例，失败时包含一条错误信息。

有一点需要额外注意下，从代码惯例的角度出发，`new` 往往不会失败，毕竟新建一个实例没道理失败，对不？因此修改为 `build` 会更加合适。

```rust
impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

这里的 `Result` 可能包含一个 `Config` 实例，也可能包含一条错误信息 `&static str`，不熟悉这种字符串类型的同学可以回头看看字符串章节，代码中的字符串字面量都是该类型，且拥有 `'static` 生命周期。

#### 处理返回的 Result

接下来就是在调用 `build` 函数时，对返回的 `Result` 进行处理了，目的就是给出准确且友好的报错提示, 为了让大家更好的回顾我们修改过的内容，这里给出整体代码：

```rust
use std::env;
use std::fs;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    // 对 build 返回的 `Result` 进行处理
    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });


    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

上面代码有几点值得注意:

- 当 `Result` 包含错误时，我们不再调用 `panic` 让程序崩溃，而是通过 `process::exit(1)` 来终结进程，其中 `1` 是一个信号值(事实上非 0 值都可以)，通知调用我们程序的进程，程序是因为错误而退出的。
- `unwrap_or_else` 是定义在 `Result<T,E>` 上的常用方法，如果 `Result` 是 `Ok`，那该方法就类似 `unwrap`：返回 `Ok` 内部的值；如果是 `Err`，就调用[闭包](https://course.rs/advance/functional-programing/closure.html)中的自定义代码对错误进行进一步处理

综上可知，`config` 变量的值是一个 `Config` 实例，而 `unwrap_or_else` 闭包中的 `err` 参数，它的类型是 `'static str`，值是 "not enough arguments" 那个字符串字面量。

运行后，可以看到以下输出：

```shell
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/minigrep`
Problem parsing arguments: not enough arguments
```

终于，我们得到了自己想要的输出：既告知了用户为何报错，又消除了多余的 debug 信息，非常棒。可能有用户疑惑，`cargo run` 底下还有一大堆 `debug` 信息呢，实际上，这是 `cargo run` 自带的，大家可以试试编译成二进制可执行文件后再调用，会是什么效果。

### 分离主体逻辑

接下来可以继续精简 `main` 函数，那就是将主体逻辑( 例如业务逻辑 )从 `main` 中分离出去，这样 `main` 函数就**保留主流程调用**，非常简洁。

```rust
// in main.rs
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    run(config);
}

fn run(config: Config) {
    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

// --snip--
```

如上所示，`main` 函数仅保留主流程各个环节的调用，一眼看过去非常简洁清晰。

继续之前，先请大家仔细看看 `run` 函数，你们觉得还缺少什么？提示：参考 `build` 函数的改进过程。

#### 使用 ? 和特征对象来返回错误

答案就是 `run` 函数没有错误处理，因为在文章开头我们提到过，错误处理最好统一在一个地方完成，这样极其有利于后续的代码维护。

```rust
//in main.rs
use std::error::Error;

// --snip--

fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    println!("With text:\n{contents}");

    Ok(())
}
```

值得注意的是这里的 `Result<(), Box<dyn Error>>` 返回类型，首先我们的程序无需返回任何值，但是为了满足 `Result<T,E>` 的要求，因此使用了 `Ok(())` 返回一个单元类型 `()`。

最重要的是 `Box<dyn Error>`， 如果按照顺序学到这里，大家应该知道这是一个`Error` 的特征对象(为了使用 `Error`，我们通过 `use std::error::Error;` 进行了引入)，它表示函数返回一个类型，该类型实现了 `Error` 特征，这样我们就无需指定具体的错误类型，否则你还需要查看 `fs::read_to_string` 返回的错误类型，然后复制到我们的 `run` 函数返回中，这么做一个是麻烦，最主要的是，一旦这么做，意味着我们无法在上层调用时统一处理错误，但是 `Box<dyn Error>` 不同，其它函数也可以返回这个特征对象，然后调用者就可以使用统一的方式来处理不同函数返回的 `Box<dyn Error>`。

明白了 `Box<dyn Error>` 的重要战略地位，接下来大家分析下，`fs::read_to_string` 返回的具体错误类型是怎么被转化为 `Box<dyn Error>` 的？其实原因在之前章节都有讲过，这里就不直接给出答案了，参见 [[19-返回值与错误处理#传播界的大明星：?|?-传播界的大明星]]。

运行代码没任何问题，不过 Rust 编译器也给出了善意的提示，那就是 `Result` 并没有被使用，这可能意味着存在错误的潜在可能性。

#### 处理返回的错误

```rust
fn main() {
    // --snip--

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    if let Err(e) = run(config) {
        println!("Application error: {e}");
        process::exit(1);
    }
}
```

先回忆下在 `build` 函数调用时，我们怎么处理错误的？然后与这里的方式做一下对比，是不是发现了一些区别？

没错 `if let` 的使用让代码变得更简洁，可读性也更加好，原因是，我们并不关注 `run` 返回的 `Ok` 值，因此只需要用 `if let` 去匹配是否存在错误即可。

好了，截止目前，代码看起来越来越美好了，距离我们的目标也只差一个：将主体逻辑代码分离到一个独立的文件 `lib.rs` 中。

### 分离逻辑代码到库包中

首先，创建一个 `src/lib.rs` 文件，然后将所有的非 `main` 函数都移动到其中。代码大概类似：

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        // --snip--
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    // --snip--
}
```

为了内容的简洁性，这里忽略了具体的实现，下一步就是在 `main.rs` 中引入 `lib.rs` 中定义的 `Config` 类型。

```rust
use std::env;
use std::process;

use minigrep::Config;

fn main() {
    // --snip--
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    if let Err(e) = minigrep::run(config) {
        // --snip--
        println!("Application error: {e}");
        process::exit(1);
    }
}
```

很明显，这里的 `mingrep::run` 的调用，以及 `Config` 的引入，跟使用其它第三方包已经没有任何区别，也意味着我们成功的将逻辑代码放置到一个独立的库包中，其它包只要引入和调用就行。

呼，一顿书写猛如虎，回头一看。。。这么长的篇幅就写了这么点简单的代码？？只能说，我也希望像很多国内的大学教材一样，只要列出定理和解题方法，然后留下足够的习题，就万事大吉了，但是咱们不行。

接下来，到了最喜(令)闻(人)乐(讨)见(厌)的环节：写测试代码，一起来开心吧。

## 测试驱动开发

在之前的章节中，我们完成了对项目结构的重构，并将进入逻辑代码编程的环节，但在此之前，我们需要先编写一些测试代码，也是最近颇为流行的测试驱动开发模式(TDD, Test Driven Development)：

1. 编写一个注定失败的测试，并且失败的原因和你指定的一样
2. 编写一个成功的测试
3. 编写你的逻辑代码，直到通过测试

这三个步骤将在我们的开发过程中不断循环，直到所有的代码都开发完成并成功通过所有测试。

### 注定失败的测试用例

既然要添加测试，那之前的 `println!` 语句将没有大的用处，毕竟 `println!` 存在的目的就是为了让我们看到结果是否正确，而现在测试用例将取而代之。

接下来，在 `lib.rs` 文件中，添加 `tests` 模块和 `test` 函数：

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

测试用例将在指定的内容中搜索 `duct` 字符串，目测可得：其中有一行内容是包含有目标字符串的。

但目前为止，还无法运行该测试用例，更何况还想幸灾乐祸的看其失败，原因是 `search` 函数还没有实现！毕竟是测试驱动、测试先行。

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    vec![]
}
```

先添加一个简单的 `search` 函数实现，非常简单粗暴的返回一个空的数组，显而易见测试用例将成功通过，真是一个居心叵测的测试用例！

注意这里生命周期 `'a` 的使用，之前的章节有[[18-生命周期#函数签名中的生命周期标注|详细介绍]]，不太明白的同学可以回头看看。

喔，这么复杂的代码，都用上生命周期了！嘚瑟两下试试：`$ cargo test`，太棒了！它失败了...

### 务必成功的测试用例

接着就是测试驱动的第二步：编写注定成功的测试。当然，前提条件是实现我们的 `search` 函数。它包含以下步骤：

- 遍历迭代 `contents` 的每一行
- 检查该行内容是否包含我们的目标字符串
- 若包含，则放入返回值列表中，否则忽略
- 返回匹配到的返回值列表

#### 遍历迭代每一行

Rust 提供了一个很便利的 `lines` 方法将目标字符串进行按行分割：

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        // do something with line
    }
}
```

这里的 `lines` 返回一个[[02-函数式编程-迭代器|迭代器]]，关于迭代器在后续章节会详细讲解，现在只要知道 `for` 可以遍历取出迭代器中的值即可。

#### 在每一行中查询目标字符串

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        if line.contains(query) {
            // do something with line
        }
    }
}
```

与之前的 `lines` 函数类似，Rust 的字符串还提供了 `contains` 方法，用于检查 `line` 是否包含待查询的 `query`。

接下来，只要返回合适的值，就可以完成 `search` 函数的编写。

#### 存储匹配到的结果

简单，创建一个 Vec 动态数组，然后将查询到的每一个 line 推进数组中即可：

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}
```

至此，`search` 函数已经完成了既定目标，为了检查功能是否正确，运行下我们之前编写的测试用例，测试通过，意味着我们的代码也完美运行，接下来就是在 `run` 函数中大显身手了。

#### 在 run 函数中调用 search 函数

```rust
// in src/lib.rs
pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    for line in search(&config.query, &contents) {
        println!("{line}");
    }

    Ok(())
}
```

好，再运行下看看结果，看起来我们距离成功从未如此之近！

```shell
$ cargo run -- frog poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.38s
     Running `target/debug/minigrep frog poem.txt`
How public, like a frog
```

酷！成功查询到包含 `frog` 的行，再来试试 `body` :

```shell
$ cargo run -- body poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep body poem.txt`
I'm nobody! Who are you?
Are you nobody, too?
How dreary to be somebody!
```

完美，三行，一行不少，为了确保万无一失，再来试试查询一个不存在的单词：

```shell
cargo run -- monomorphization poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep monomorphization poem.txt`
```

至此，章节开头的目标已经全部完成，接下来思考一个小问题：如果要为程序加上大小写不敏感的控制命令，由用户进行输入，该怎么实现比较好呢？毕竟在实际搜索查询中，同时支持大小写敏感和不敏感还是很重要的。

答案留待下一章节揭晓。
## 使用环境变量来增强程序

在上一章节中，留下了一个悬念，该如何实现用户控制的大小写敏感，其实答案很简单，你在其它程序中肯定也遇到过不少，例如如何控制 `panic` 后的栈展开？ Rust 提供的解决方案是通过命令行参数来控制：

```shell
RUST_BACKTRACE=1 cargo run
```

与之类似，我们也可以使用环境变量来控制大小写敏感，例如：

```shell
IGNORE_CASE=1 cargo run -- to poem.txt
```

既然有了目标，那么一起来看看该如何实现吧。

### 编写大小写不敏感的测试用例

还是遵循之前的规则：测试驱动，这次是对一个新的大小写不敏感函数进行测试 `search_case_insensitive`。

还记得 TDD 的测试步骤嘛？首先编写一个注定失败的用例：

```rust
// in src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

可以看到，这里新增了一个 `case_insensitive` 测试用例，并对 `search_case_insensitive` 进行了测试，结果显而易见，函数都没有实现，自然会失败。

接着来实现这个大小写不敏感的搜索函数：

```rust
pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}
```

跟之前一样，但是引入了一个新的方法 `to_lowercase`，它会将 `line` 转换成全小写的字符串，类似的方法在其它语言中也差不多，就不再赘述。

还要注意的是 `query` 现在是 `String` 类型，而不是之前的 `&str`，因为 `to_lowercase` 返回的是 `String`。

修改后，再来跑一次测试，看能否通过。

Ok，TDD的第二步也完成了，测试通过，接下来就是最后一步，在 `run` 中调用新的搜索函数。但是在此之前，要新增一个配置项，用于控制是否开启大小写敏感。

```rust
// in lib.rs
pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}
```

接下来就是检查该字段，来判断是否启动大小写敏感：

```rust
pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
        println!("{line}");
    }

    Ok(())
}
```

现在的问题来了，该如何控制这个配置项呢。这个就要借助于章节开头提到的环境变量，好在 Rust 的 `env` 包提供了相应的方法。

```rust
use std::env;
// --snip--

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}
```

`env::var` 没啥好说的，倒是 `is_ok` 值得说道下。该方法是 `Result` 提供的，用于检查是否有值，有就返回 `true`，没有则返回 `false`，刚好完美符合我们的使用场景，因为我们并不关心 `Ok<T>` 中具体的值。

运行下试试：

```shell
$ cargo run -- to poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep to poem.txt`
Are you nobody, too?
How dreary to be somebody!
```

看起来没有问题，接下来测试下大小写不敏感：

```shell
IGNORE_CASE=1 cargo run -- to poem.txt
```

大小写不敏感后，查询到的内容明显多了很多，也很符合我们的预期。

最后，给大家留一个小作业：同时使用命令行参数和环境变量的方式来控制大小写不敏感，其中环境变量的优先级更高，也就是两个都设置的情况下，优先使用环境变量的设置。

## 重定向错误信息的输出

迄今为止，所有的输出信息，无论 debug 还是 error 类型，都是通过 `println!` 宏输出到终端的标准输出( `stdout` )，但是对于程序来说，错误信息更适合输出到标准错误输出(stderr)。

这样修改后，用户就可以选择将普通的日志类信息输出到日志文件 1，然后将错误信息输出到日志文件 2，甚至还可以输出到终端命令行。

### 目前的错误输出位置

我们先来观察下，目前的输出信息包括错误，是否是如上面所说，都写到标准错误输出。

测试方式很简单，将标准错误输出的内容重定向到文件中，看看是否包含故意生成的错误信息即可。

```shell
$ cargo run > output.txt
```

首先，这里的运行没有带任何参数，因此会报出类如文件不存在的错误，其次，通过 `>` 操作符，标准输出上的内容被重定向到文件 `output.txt` 中，不再打印到控制上。

大家先观察下控制台，然后再看看 `output.txt`，是否发现如下的错误信息已经如期被写入到文件中？

```text
Problem parsing arguments: not enough arguments
```

所以，可以得出一个结论，如果错误信息输出到标准输出，那么它们将跟普通的日志信息混在一起，难以分辨，因此我们需要将错误信息进行单独输出。


### 标准错误输出 stderr

将错误信息重定向到 `stderr` 很简单，只需在打印错误的地方，将 `println!` 宏替换为 `eprintln!`即可。

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}
```

接下来，还是同样的运行命令：

```shell
$ cargo run > output.txt
Problem parsing arguments: not enough arguments
```

可以看到，日志信息成功的重定向到 `output.txt` 文件中，而错误信息由于 `eprintln!` 的使用，被写入到标准错误输出中，默认还是输出在控制台中。

再来试试没有错误的情况：

```shell
$ cargo run -- to poem.txt > output.txt
```

至此，简易搜索程序 `minigrep` 已经基本完成，下一章节将使用迭代器进行部分改进，请大家在看完[[02-函数式编程-迭代器|迭代器]]后，再回头阅读。


## 使用迭代器来改进我们的程序

在之前的 `minigrep` 中，功能虽然已经 ok，但是一些细节上还值得打磨下，下面一起看看如何使用迭代器来改进 `Config::build` 和 `search` 的实现。

### 移除 clone 的使用

虽然之前有讲过为什么这里可以使用 `clone`，但是也许总有同学心有芥蒂，毕竟程序员嘛，都希望代码处处完美，而不是丑陋的处处妥协。

之前的代码两行 `clone` 着实有点啰嗦，好在，在学习完迭代器后，我们知道了 `build` 函数实际上可以**直接拿走迭代器的所有权**，而不是去借用一个数组切片 `&[String]`。

这里先不给出代码，下面统一给出。

### 直接使用返回的迭代器

在之前的实现中，我们的 `args` 是一个动态数组：

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // --snip--
}
```

当时还提到了 `collect` 方法的使用，相信大家学完迭代器后，对这个方法会有更加深入的认识。

现在呢，无需数组了，直接传入迭代器即可：

```rust
fn main() {
    let config = Config::build(env::args()).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // --snip--
}
```

如上所示，我们甚至省去了一行代码，原因是 `env::args` 可以直接返回一个迭代器，再作为 `Config::build` 的参数传入，下面再来改写 `build` 方法。

```rust
impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        // --snip--
    }
```

为了可读性和更好的通用性，这里的 `args` 类型并没有使用本身的 `std::env::Args` ，而是使用了特征约束的方式来描述 `impl Iterator<Item = String>`，这样意味着 `arg` 可以是任何实现了 `String` 迭代器的类型。

还有一点值得注意，由于迭代器的所有权已经转移到 `build` 内，因此可以直接对其进行修改，这里加上了 `mut` 关键字。

### 移除数组索引的使用

数组索引会越界，为了安全性和简洁性，使用 `Iterator` 特征自带的 `next` 方法是一个更好的选择：

```rust
impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        // 第一个参数是程序名，由于无需使用，因此这里直接空调用一次
        args.next();

        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file path"),
        };

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}
```

喔，上面使用了迭代器和模式匹配的代码，看上去是不是很 Rust？我想我们已经走在了正确的道路上。

### 使用迭代器适配器让代码更简洁

为了帮大家更好的回忆和对比，之前的 `search` 长这样：

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}
```

引入了迭代器后，就连古板的 `search` 函数也可以变得更 rusty 些：

```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents
        .lines()
        .filter(|line| line.contains(query))
        .collect()
}
```

Rock，让我们的函数编程 Style rock 起来，这种一行到底的写法有时真的让人沉迷。

### 总结

至此，整个大章节全部结束，本章没有试图覆盖已学的方方面面( 也许未来会 )，而是聚焦于 Rust 的一些核心知识：所有权、生命周期、借用、模式匹配等等。

强烈推荐大家忘记已有的一切，自己重新实现一遍 `minigrep`，甚至可以根据自己的想法和喜好，来完善一些，也欢迎在评论中附上自己的练习项目，供其它人学习参考( 提个小建议，项目主页写清楚新增的功能、亮点等 )。

从下一章开始，我们将正式开始 Rust 进阶学习，请深呼吸一口，然后问自己：你..准备好了吗？