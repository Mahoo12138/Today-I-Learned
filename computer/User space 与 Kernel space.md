简单说，Kernel space 是 Linux 内核的运行空间，User space 是用户程序的运行空间。为了安全，它们是隔离的，即使用户的程序崩溃了，内核也不受影响。

![](user-space&kernel-space-1.png)

在一个32位系统中，一个程序的虚拟空间最大可以是4GB，那么最直接的做法就是，把内核也看作是一个程序，使它和其他程序一样也具有4GB空间。但是这种做法会使系统不断的切换用户程序的页表和内核页表，以致影响计算机的效率。解决这个问题的最好做法就是把4GB空间分成两个部分：一部分为用户空间，另一部分为内核空间，这样就可以保证内核空间固定不变，而当程序切换时，改变的仅是程序的页表。这种做法的唯一缺点便是内核空间和用户空间均变小了。  
例如：在i386这种32位的硬件平台上，Linux 在文件*page.h*中定义了一个常量`PAGE_OFFSET`：  

```c
#ifdef CONFIG_MMU  
#define __PAGE_OFFSET  (0xC0000000)        //0xC0000000为3GB  
#else  
#define __PAGE_OFFSET  (0x00000000)  
#endif  
#define PAGE_OFFSET		((unsigned long)__PAGE_OFFSET)
```

Linux以`PAGE_OFFSET`为界将4GB的虚拟内存空间分成了两部分：地址0GB-3GB这段低地址空间为用户空间，大小为3GB；地址3GB-4GB这段高地址空间为内核空间，大小为1GB。

Kernel space 可以执行任意命令，调用系统的一切资源；User space 只能执行简单的运算，不能直接调用系统资源，必须通过系统接口（又称 system call），才能向内核发出指令。

```c
str = "my string" // 用户空间
x = x + 2
file.write(str) // 切换到内核空间

y = x + 4 // 切换回用户空间
```

上面代码中，第一行和第二行都是简单的赋值运算，在 User space 执行。第三行需要写入文件，就要切换到 Kernel space，因为用户不能直接写文件，必须通过内核安排。第四行又是赋值运算，就切换回 User space。

查看 CPU 时间在 User space 与 Kernel Space 之间的分配情况，可以使用`top`命令。它的第三行输出就是 CPU 时间分配统计。

这一行有 8 项统计指标：

> %Cpu(s): 24.8 us, 0.5 sy, 0.0 ni, 73.6 id, 0.4 wa, 0.0 hi, 0.2 si, 0.0 st

其中，第一项`24.8 us`（user 的缩写）就是 CPU 消耗在 User space 的时间百分比，第二项`0.5 sy`（system 的缩写）是消耗在 Kernel space 的时间百分比。

> - `ni`：niceness 的缩写，CPU 消耗在 nice 进程（低优先级）的时间百分比
> - `id`：idle 的缩写，CPU 消耗在闲置进程的时间百分比，这个值越低，表示 CPU 越忙
> - `wa`：wait 的缩写，CPU 等待外部 I/O 的时间百分比，这段时间 CPU 不能干其他事，但是也没有执行运算，这个值太高就说明外部设备有问题
> - `hi`：hardware interrupt 的缩写，CPU 响应硬件中断请求的时间百分比
> - `si`：software interrupt 的缩写，CPU 响应软件中断请求的时间百分比
> - `st`：stole time 的缩写，该项指标只对虚拟机有效，表示分配给当前虚拟机的 CPU 时间之中，被同一台物理机上的其他虚拟机偷走的时间百分比

如果想查看单个程序的耗时，一般使用`time`命令：

```bash
$ time ping bilibili.com

正在 Ping bilibili.com [47.103.24.173] 具有 32 字节的数据:
来自 47.103.24.173 的回复: 字节=32 时间=13ms TTL=88
来自 47.103.24.173 的回复: 字节=32 时间=12ms TTL=88
来自 47.103.24.173 的回复: 字节=32 时间=56ms TTL=88
来自 47.103.24.173 的回复: 字节=32 时间=15ms TTL=88

47.103.24.173 的 Ping 统计信息:
    数据包: 已发送 = 4，已接收 = 4，丢失 = 0 (0% 丢失)，
往返行程的估计时间(以毫秒为单位):
    最短 = 12ms，最长 = 56ms，平均 = 24ms

real    0m3.122s
user    0m0.015s
sys     0m0.000s
```

程序名之前加上`time`命令，会在程序执行完毕以后，默认显示三行统计。

> - `real`：程序从开始运行到结束的全部时间，这是用户能感知到的时间，包括 CPU 切换去执行其他任务的时间。
> - `user`：程序在 User space 执行的时间
> - `sys`：程序在 Kernel space 执行的时间

`user`和`sys`之和，一般情况下，应该小于`real`。但如果是多核 CPU，这两个指标反映的是所有 CPU 的总耗时，所以它们之和可能大于`real`。