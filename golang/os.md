## Signal

信号(Signal) 是 Linux, 类 Unix 和其它 POSIX 兼容的操作系统中用来进程间通讯的一种方式。

对于 Linux 系统来说，信号就是软中断，用来通知进程发生了异步事件。

当信号发送到某个进程中时，操作系统会中断该进程的正常流程，并进入相应的信号处理函数执行操作，完成后再回到中断的地方继续执行。

有时候我们想在 Go 程序中处理 Signal 信号，比如收到`SIGTERM`信号后优雅的关闭程序，以及 goroutine 结束通知等。

Go 语言提供了对信号处理的包（os/signal）。

Go 中对信号的处理主要使用 os/signal 包中的两个方法：一个是`notify`方法用来监听收到的信号；一个是 `stop` 方法用来取消监听。

Go 信号通知机制可以通过往一个 channel 中发送`os.Signal`实现。

```go
import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func signal01() {
	// 创建一个os.Signal channel
	sigs := make(chan os.Signal, 1)
	// 创建一个bool channel
	done := make(chan bool, 1)
	// 注册要接收的信号，syscall.SIGINT: 接收 ctrl+c, syscall.SIGTERM: 程序退出
	// 信号没有信号参数表示接收所有的信号
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	// 此goroutine为执行阻塞接收信号。一旦有了它，它就会打印出来
	// 然后通知程序可以完成
	go func() {
		sig := <-sigs
		fmt.Println(sig.String())
		done <- true
	}()
	
	fmt.Println("awaiting signal")
	<-done	// 程序将在此处等待，直到它预期信号；在“done”上发送一个值，然后退出
	fmt.Println("exiting")
}
```

取消监听信号，使用 `signal.Stop()`，当程序再次被中断是，直接中断，不会输出 *exiting*；

```go
{
    // ...
    go func() {
        sig := <-sigs
        fmt.Println(sig)
        done <- true
    }()
    // 不允许继续往sigs中存入内容
    signal.Stop(sigs)
    fmt.Println("awaiting signal")
    <-done
     fmt.Println("exiting")
}
```

优雅的重启方式： [Graceful restart in Golang - Gregory Trubetskoy (grisha.org)](https://grisha.org/blog/2014/06/03/graceful-restart-in-golang/)