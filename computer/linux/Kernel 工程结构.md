---
title: Kernel 工程结构
---
# Kernel 工程结构

内核源码目录如下：

```text
arch         COPYING        drivers   init     kernel       make_deb.sh  README    sound
block        CREDITS        firmware  ipc      lib          Makefile     samples   tools
build_image  crypto         fs        Kbuild   LICENSES     mm           scripts   usr
certs        Documentation  include   Kconfig  MAINTAINERS  net          security  virt
```

+ **arch** ：主要包含和硬件体系结构相关的代码，如arm、x86、MIPS，PPC，每种CPU平台占一个相应的目录。arch中的目录下存放的是各个平台以及各个平台的芯片对Linux内核进程调度、内存管理、 中断等的支持，以及每个具体的SoC和电路板的板级支持代码。
+ **block** ：在Linux中block表示块设备（以块（多个字节组成的整体，类似于扇区）为单位来整体访问），譬如说SD卡、Nand、硬盘等都是块设备，block目录下放的是一些Linux存储体系中关于块设备管理的代码。
+ **crypto** ：这个目录下存放的是常用加密和散列算法（如md5、AES、 SHA等），还有一些压缩和CRC校验算法。
+ **Documentation**：内核各部分的文档描述。
+ **drivers** ：设备驱动程序，里面列出了linux内核支持的所有硬件设备的驱动源代码，每个不同的驱动占用一个子目录，如char、block、 net、 mtd、 i2c等。
+ **fs** ：fs就是file system，里面包含Linux所支持的各种文件系统，如EXT、FAT、 NTFS、 JFFS2等。
+ **include** ：包括编译核心所需要的大部分头文件，例如与平台无关的头文件在 `include/linux` 子目录下，与 cpu 架构相关的头文件在include目录下对应的子目录中。
+ **init** ：内核初始化代码，这个目录下的代码就是linux内核启动时初始化内核的代码。
+ **ipc** ：即 `inter process commuication` ，进程间通信，该目录下都是linux进程间通信的代码。
+ **kernel** ：kernel 就是Linux内核，是Linux中最核心的部分，包括进程调度、定时器等，而和平台相关的一部分代码放在arch/\*/kernel目录下。
+ **lib** ：存放的都是一些公用的有用的库函数，注意这里的库函数和C语言的库函数不一样的，因为在内核编程中是不能用C语言标准库函数的，所以需要使用lib中的库函数，除此之外与处理器结构相关的库函数代码被放在 `arch/*/lib/` 目录下。
+ **mm** ： 包含了所有独立于 cpu 体系结构的内存管理代码，如页式存储管理内存的分配和释放等，而与具体硬件体系结构相关的内存管理代码位于 `arch/*/mm` 目录下，例如 `arch/arm/mm/fault.c` 。
+ **net** ： 网络协议栈相关代码，net 目录下实现各种常见的网络协议。
+ **scripts** ：这个目录下全部是脚本文件，这些脚本文件不是linux内核工作时使用的，而是用了配置编译linux内核的。
+ **security** ：内核安全模型相关的代码，例如最有名的 SELINUX。
+ **sound** ： ALSA、 OSS音频设备的驱动核心代码和常用设备驱动。
+ **usr** ： 实现用于打包和压缩的 cpio 等。