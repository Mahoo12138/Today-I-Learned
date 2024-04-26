## sync

多个并发协程之间不需要通信，那么就可以使用 `sync.WaitGroup`完成并发任务：

```go
import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup

func download(url string) {
	fmt.Println("start to download", url)
	time.Sleep(time.Second) // 模拟耗时操作
	wg.Done()
}

func main() {
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go download("a.com/" + string(i+'0'))
	}
	wg.Wait()
	fmt.Println("Done!")
}
```

+ `wg.Add(1)`：为该 WaitGroup 添加一个计数，`wg.Done()`，减去一个计数；
+ `go download()`：启动新的协程并发执行 download 函数；
+ `wg.Wait()`：等待所有的协程执行结束；

## channel

``