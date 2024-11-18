在日常开发中，日志是必不可少的功能。虽然有时可以用`fmt`库输出一些信息，但是灵活性不够。Go 标准库提供了一个日志库`log`。

## 使用

log 包定义了 `Logger` 类型，该类型提供了一些格式化输出的方法。也提供了一个预定义的 “标准” logger，名为`std`，即标准日志；可以通过调用函数`Print系列`(Print|Printf|Println）、`Fatal系列`（Fatal|Fatalf|Fatalln）、和`Panic系列`（Panic|Panicf|Panicln）来使用，比自行创建一个 logger 对象更容易使用。

+ `Print/Printf/Println`：正常输出日志；

- `Panic/Panicf/Panicln`：输出日志后，以拼装好的字符串为参数调用`panic`；
- `Fatal/Fatalf/Fatalln`：输出日志后，调用`os.Exit(1)`退出程序。

## 配置

默认情况下的logger只会提供日志的时间信息，但是很多情况下我们希望得到更多信息，比如记录该日志的文件名和行号等。`log`标准库中为我们提供了定制这些设置的方法。

+ `log.SetPrefix`为每条日志文本前增加一个前缀，调用`log.Prefix`可以获取当前设置的前缀；

+ `log.SetFlags`函数用来设置标准 logger 的输出配置，`Flags`函数返回当前配置；

  ```go
  const (
      Ldate         = 1 << iota     // 日期：2009/01/23
      Ltime                         // 时间：01:23:23
      Lmicroseconds                 // 微秒级别的时间：01:23:23.123123（用于增强Ltime位）
      Llongfile                     // 文件全路径名+行号： /a/b/c/d.go:23
      Lshortfile                    // 文件名+行号：d.go:23（会覆盖掉Llongfile）
      LUTC                          // 使用UTC时间
      LstdFlags     = Ldate | Ltime // 标准logger的初始值
  )
  ```

+ `log.SetOutput` 用来设置标准 logger 的输出，默认输出到标准错误（`stderr`）。

使用标准的 logger 时，我们通常会把上面的配置操作写到`init`函数中；

## 自定义

`log`标准库中还提供了一个创建新logger对象的构造函数–`New`，用于自定义 logger 对象：

```go
func New(out io.Writer, prefix string, flag int) *Logger
```

`log.New`接受三个参数：

- `io.Writer`：日志都会写到这个`Writer`中；
- `prefix`：前缀，也可以之后调用`logger.SetPrefix`设置； 
- `flag`：选项，也可以之后调用`logger.SetFlag`设置。

注意到，第一个参数为`io.Writer`，我们可以使用`io.MultiWriter`实现多目的地输出：

```go
writer1 := &bytes.Buffer{}
writer2 := os.Stdout
writer3, err := os.OpenFile("log.txt", os.O_WRONLY|os.O_CREATE, 0755)

logger := log.New(io.MultiWriter(writer1, writer2, writer3), "", log.Lshortfile|log.LstdFlags)
```

## 实现

## 实现

`log`库的核心是`Output`方法，我们简单看一下：

```go
// src/log/log.go 
func (l *Logger) Output(calldepth int, s string) error {  
    now := time.Now() // get this early.  
    var file string  
    var line int
    // 加锁，保证多goroutine下的安全
    l.mu.Lock()  
    defer l.mu.Unlock()
    // 如果配置了获取文件和行号的话
    if l.flag&(Lshortfile|Llongfile) != 0 {    
        // Release lock while getting caller info - it's expensive.    
        l.mu.Unlock()   
        var ok bool    
        _, file, line, ok = runtime.Caller(calldepth)    
        if !ok {     
            file = "???"      
            line = 0    
        } 
        // 获取到行号等信息后，再加锁，保证安全
        l.mu.Lock()  
    }  
    // 把日志信息和设置的日志抬头进行拼接
    l.buf = l.buf[:0]  
    l.formatHeader(&l.buf, now, file, line)  
    l.buf = append(l.buf, s...)  
    if len(s) == 0 || s[len(s)-1] != '\n' {    
        l.buf = append(l.buf, '\n')  
    }  
    _, err := l.out.Write(l.buf)  
    return err 
} 
```

如果设置了`Lshortfile`或`Llongfile`，`Ouput`方法中会调用`runtime.Caller`获取文件名和行号。`runtime.Caller`的参数`calldepth`表示获取调用栈向上多少层的信息，当前层为 0。

一般的调用路径是：

- 程序中使用`log.Printf`之类的函数；
- 在`log.Printf`内调用`std.Output`。

我们在`Output`方法中需要获取调用`log.Printf`的文件和行号。 `calldepth`传入 0 表示`Output`方法内调用`runtime.Caller`的那一行信息，传入 1 表示`log.Printf`内调用`std.Output`那一行的信息， 传入 2 表示程序中调用`log.Printf`的那一行信息。显然这里要用 2。

然后调用`formatHeader`处理前缀和选项。

最后将生成的字节流写入到`Writer`中。

这里有两个优化技巧：

- 由于`runtime.Caller`调用比较耗时，先释放锁，避免等待时间过长；
- 为了避免频繁的内存分配，`logger`中保存了一个类型为`[]byte`的`buf`，可重复使用。前缀和日志内容先写到这个`buf`中，然后统一写入`Writer`，减少 io 操作。

> [Go 每日一库之 log - 大俊的博客 (darjun.github.io)](https://darjun.github.io/2020/02/07/godailylib/log/)
>
> [Go语言标准库之log - 二十三岁的有德 - 博客园 (cnblogs.com)](https://www.cnblogs.com/nickchen121/p/11517450.html#一log)
>
> [Go语言实战笔记（十八）| Go log 日志](https://cloud.tencent.com/developer/article/1196810)

