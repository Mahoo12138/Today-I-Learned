## 简介

`context`包是在`go1.7`版本中引入到标准库中的，

## 为什么需要context

在并发程序中，由于超时、取消操作或者一些异常情况，往往需要进行抢占操作或者中断后续操作。

`context`可以用来在`goroutine`之间传递上下文信息，相同的`context`可以传递给运行在不同`goroutine`中的函数，上下文对于多个`goroutine`同时使用是安全的，`context`包定义了上下文类型，可以使用`background`、`TODO`创建一个上下文，在函数调用链之间传播`context`，也可以使用`WithDeadline`、`WithTimeout`、`WithCancel` 或 `WithValue` 创建的修改副本替换它。

### Context 结构体

```go
// A Context carries a deadline, cancelation signal, and request-scoped values
// across API boundaries. Its methods are safe for simultaneous use by multiple
// goroutines.
type Context interface {
    // Done returns a channel that is closed when this Context is canceled
    // or times out.
    Done() <-chan struct{}

    // Err indicates why this context was canceled, after the Done channel
    // is closed.
    Err() error

    // Deadline returns the time when this Context will be canceled, if any.
    Deadline() (deadline time.Time, ok bool)

    // Value returns the value associated with key or nil if none.
    Value(key interface{}) interface{}
}
```
+ Done()，返回一个 channel / nil。当 times out 或者调用 cancel 方法时，将会 close 掉；
+ Err()，如果`Done`返回的`channel`没有关闭，将返回`nil`;如果`Done`返回的`channel`已经关闭，将返回非空的值表示任务结束的原因。如果是`context`被取消，`Err`将返回`Canceled`；如果是`context`超时，`Err`将返回`DeadlineExceeded`。
+ Deadline()，返回绑定当前`context`的任务被取消的截止时间；如果没有设定期限，将返回`ok == false`。
+ Value()，返回`context`存储的键值对中当前`key`对应的值，如果没有对应的`key`,则返回`nil`。

### 所有方法

```go
func Background() Context
func TODO() Context

func WithCancel(parent Context) (ctx Context, cancel CancelFunc)
func WithDeadline(parent Context, deadline time.Time) (Context, CancelFunc)
func WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)
func WithValue(parent Context, key, val interface{}) Context
```

上面可以看到 Context 是一个接口，**想要使用就得实现其方法**。在 context 包内部已经为我们实现好了两个空的 Context，可以通过调用 `Background()` 和`TODO()` 方法获取。一般的将它们作为 Context 的根，往下派生。

## 使用

### 创建 context

使用之前提到的两个方法创建`context`:

- `context.Backgroud()`
- `context.TODO()`

这两个函数其实只是互为别名，没有差别，官方给的定义是：

- `context.Background` 是上下文的默认值，所有其他的上下文都应该从它衍生（Derived）出来。
- `context.TODO` 应该只在不确定应该使用哪种上下文时使用；

所以在大多数情况下，我们都使用`context.Background`作为起始的上下文向下传递；传递前通常需要使用另外四个函数进行衍生，而且可以继续在原本基础上派生。

### WithCancel  取消控制

在完成一个复杂的需求会开多个`gouroutine`去处理逻辑，将导致无法准确控制他们，这时则可以使用`withCancel`来衍生一个`context`传递到不同的`goroutine`中，当想让这些`goroutine`停止运行，就可以调用`cancel`来进行取消：

```go
func WithCancel() {
    ctx, cancel := context.WithCancel(context.Background())
    go Speak(ctx)
    time.Sleep(10 * time.Second)
    cancel()
    time.Sleep(1 * time.Second)
}

func Speak(ctx context.Context) {
    for range time.Tick(time.Second) {
        select {
            case <-ctx.Done():
            fmt.Println("我要闭嘴了")
            return
            default:
            fmt.Println("balabalabalabala")
        }
    }
}
```

延时 10s 内，不断打印 *balabalabalabala*，执行 `cancel()`之后，`ctx.Done()` 发出信号，返回；

注意，因为 `time.Tick(time.Second)`是不断产生时刻 channel，如果这里不调用 return，会一直处于 `ctx.Done()` 状态，也就是一直打印 `我要闭嘴了`；

### WithValue 携带数据 







+ [小白也能看懂的context包详解：从入门到精通 (qq.com)](https://mp.weixin.qq.com/s/_5gBIwvtXKJME7AV2W2bqQ)
+ [快速掌握 Golang context 包，简单示例 | Deepzz's Blog](https://deepzz.com/post/golang-context-package-notes.html)
+ [深入理解Golang之context - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/110085652)