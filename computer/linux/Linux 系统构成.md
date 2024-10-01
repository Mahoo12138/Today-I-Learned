# Linux 系统构成

一个完整的 linux 系统，通常包含了 Uboot、kernel、设备树以及根文件系统。

## Uboot

U-Boot 是一个主要用于嵌入式系统的引导加载程序，可以支持多种不同的计算机系统结构，包括PPC、ARM、AVR32、MIPS、x86、68k、Nios 与 MicroBlaze。

Uboot 的全称 Universal Boot Loader，是遵循 GPL 条款的开源项目， U-Boot 的主要作用是用来启动操作系统内核，它分为两个阶段，即 boot + loader：

+ boot 阶段启动系统，初始化硬件设备，建立内存空间映射图，将系统的软硬件带到一个合适的状态；
+ loader 阶段将操作系统内核文件加载至内存，之后跳转到内核所在地址运行。

### Bootloader

PC 机上引导程序一般由 BIOS 开始执行，然后读取硬盘中位于 MBR(Main Boot Record，主引导记录)中的 Bootloader (例如 LILO 或 GRUB)，并进一步引导操作系统的启动。

PC 机的 BootLoader 的主要运行任务就是将内核映象从硬盘上读到 RAM 中，然后跳转到内核的入口点去运行，即开始启动操作系统。

嵌入式系统中通常没有像 BIOS 那样的固件程序，因此整个系统的加载启动就完全由 Bootloader 来完成，它主要的功能是加载与引导内核映像。

一般来说，BootLoader 是一段小程序，在系统上电时执行，是基于特定硬件平台来实现的，因此几乎不可能为所有的嵌入式系统建立一个通用的Bootloader，不同的处理器架构都有不同的 Bootloader，其不但依赖于cpu的体系结构，还依赖于嵌入式系统板级设备的配置。

## Linux Kernel

Linux 是一种开源电脑操作系统内核，是一个用 C 语言写成，符合POSIX标准的类 Unix 操作系统。

Linux 内核的主要模块（或组件）分以下几个部分：进程管理子系统、内存管理子系统、文件子系统、网络子系统、设备子系统等。

![](linux-modules.jpeg)

## Device Tree

Device Tree 设备树是一种用于描述硬件的数据结构和语言。更确切地说，它是一种操作系统可读的硬件描述，这样操作系统就不需要对机器的细节进行硬编码。

它以可读性强的文本方式，将硬件的层次结构、设备的属性和资源配置等信息整合到一个统一的文档中，促使不同硬件平台之间可以共享相同的内核代码。

设备树包括设备树源码（Device Tree Source，DTS）文件、 设备树编译工具（Device Tree Compiler，DTC）与二进制格式设备树（Device Tree Blob，DTB）， DTS包含的头文件格式为DTSI。

```text
node1 {
   a-string-property = "A string";
   a-string-list-property = "first string", "second string";
   a-byte-data-property = [0x01 0x23 0x34 0x56];

   child-node1 {
      first-child-property;
      second-child-property = <1>;
      a-string-property = "Hello, world";
   };
};
```

Uboot和Linux不能直接识别DTS文件，而DTB可以被内核与BootLoader识别解析， 通常在制作NAND Flash、SD Card启动镜像时，通常会为DTB文件留下一部分存储区域以存储DTB， 在BootLoader启动内核时，会先读取DTB到内存，再提供给内核使用。

![](dtb.png)

## rootfs

rootfs 根文件系统是linux在初始化时加载的第一个文件系统， 根文件系统包括根目录和真实文件系统，它包含系统引导和使其他文件系统得以挂载（mount）所必要的文件。 

根文件系统包函Linux启动时所必须的目录和关键性的文件，例如Linux启动时必要的初始化文件， 它在init目录下。此外根文件系统中还包括了许多的应用程序bin目录等， 任何包括这些Linux 系统启动所必须的文件都可以成为根文件系统。

在Linux内核启动的初始阶段，首先内核会初始化一个基于内存的文件系统，如initramfs，initrd等，然后以只读的方式去加载根文件系统（load rootfs）， 读取并且运行`/sbin/init`初始化文件，根据`/etc/inittab`配置文件完成系统的初始化工作 （`/sbin/init`是一个二进制可执行文件，为系统的初始化程序，而`/etc/inittab`是它的配置文件）， 在初始化的过程中，还会以读写的方式重新挂载根文件系统，在系统启动后， 根文件系统就可用于存储数据了，存在根文件系统是Linux启动时的必要条件。

常见的根文件系统制作工具有 buildroot、Ubuntu、Debian、yocto、busybox。