## 包和文件

一个包的源代码保存在一个或多个以`.go`为文件后缀名的源文件中，通常一个包所在目录路径的后缀是包的导入路径。
+ 例如包`gopl.io/ch1/helloworld`对应的目录路径是`$GOPATH/src/gopl.io/ch1/helloworld`。

**每个包都对应一个独立的名字空间**。例如，在 image 包中的 Decode 函数和在 unicode/utf16 包中的 Decode 函数是不同的。

在 Go 语言中，一个简单的规则是：如果一个名字是大写字母开头的，那么该名字对于包来说是导出的。


## 包的导入

Go语言的规范并没有指明包的导入路径字符串的具体含义，导入路径的具体含义是由构建工具来解释的。

每个导入声明语句都明确指定了当前包和被导入包之间的依赖关系。如果遇到包循环导入的情况，Go语言的构建工具将报告错误。


## 包的初始化
包的初始化首先是解决包级变量的依赖顺序，然后按照包级变量声明出现的顺序依次初始化：

如果包中含有多个`.go`源文件，它们将按照发给编译器的顺序进行初始化，Go语言的构建工具首先会将`.go`文件根据文件名排序，然后依次调用编译器编译。

每个文件都可以包含多个`init`初始化函数，其除了不能被调用或引用外，其他行为和普通函数类似。

+ 每个包在解决依赖的前提下，以导入声明的顺序初始化，每个包只会被初始化一次；
+ 初始化工作是自下而上进行的，main 包最后被初始化；

总结一个 go 程序代码的执行顺序：

1. 初始化所有被导入的包
2. 初始化被导入的包所有全局变量
3. 被导入的包init函数调用：
   + 同一个 go 文件的 init() 调用顺序是从上到下的;
   + 同一个 package 中不同文件是按文件名字符串比较“从小到大”顺序调用各文件中的 init() 函数;
   + 不同的 package，按照 main 包中"先import的先调用"的顺序调用其包中的 init();
4. Main 函数执行

## Go 工具

Go 语言的工具箱集合了一系列功能的命令集。它可以看作是一个包管理器（类似于Linux中的 apt 和 rpm 工具），用于包的查询、计算包的依赖关系、从远程版本控制系统下载它们等任务。

+ `go get`命令支持当前流行的托管网站 GitHub、Bitbucket 和 Launchpad，可以直接向它们的版本控制系统请求代码。
+ `go get`命令获取的代码是真实的本地存储仓库，而不仅仅只是复制源文件，因此你依然可以使用版本管理工具比较本地代码的变更或者切换到其它的版本。

例如golang.org/x/net包目录对应一个Git仓库：

```bash
$ cd $GOPATH/src/golang.org/x/net
$ git remote -v
origin  https://go.googlesource.com/net (fetch)
origin  https://go.googlesource.com/net (push)
```
需要注意的是导入路径含有的网站域名和本地 Git 仓库对应远程服务地址并不相同，真实的 Git 地址是 go.googlesource.com。这其实是 Go 语言工具的一个特性，可以让包用一个自定义的导入路径，但是真实的代码却是由更通用的服务提供，例如 googlesource.com 或 github.com。因为页面 `https://golang.org/x/net/html` 包含了如下的元数据，它告诉 Go 语言的工具当前包真实的 Git 仓库托管地址：

```bash
$ go build gopl.io/ch1/fetch
$ ./fetch https://golang.org/x/net/html
```

```html
<!DOCTYPE html>
<html lang="en">
<title>The Go Programming Language</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="go-import" content="golang.org/x/net git https://go.googlesource.com/net">
<meta http-equiv="refresh" content="0; url=https://pkg.go.dev/golang.org/x/net/html">
</head>
<body>
<a href="https://pkg.go.dev/golang.org/x/net/html">Redirecting to documentation...</a>
</body>
</html>
```


+ `go build`命令编译命令行参数指定的每个包。如果包是一个库，则忽略输出结果；这可以用于检测包是可以正确编译的。
+ 如果包的名字是 main，go build 将调用链接器在当前目录创建一个可执行程序；以导入路径的最后一段作为可执行程序的名字。
+ 默认情况下，`go build`命令构建指定的包和它依赖的包，然后丢弃除了最后的可执行文件之外所有的中间编译结果。

+ `go install`命令和`go build`命令很相似，但是它会保存每个包的编译成果，而不是将它们都丢弃。
+ 被编译的包会被保存到$GOPATH/pkg目录下，目录路径和 src目录路径对应，可执行程序被保存到$GOPATH/bin目录。


Go 语言的构建工具对包含`internal`名字的路径段的包导入路径做了特殊处理。这种包叫**internal包**，一个 internal 包只能被和 internal 目录有同一个父目录的包所导入。

例如，`net/http/internal/chunked` 内部包只能被 `net/http/httputil` 或 `net/http` 包导入，但是不能被 `net/url` 包导入。不过 `net/url` 包却可以导入`net/http/httputil`包。
```
net/http
net/http/internal/chunked
net/http/httputil
net/url
```