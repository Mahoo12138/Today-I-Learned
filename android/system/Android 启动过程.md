![](android-boot-process.png)

+ 第一阶段：Android设备上电后，首先会从处理器片上ROM的启动引导代码开始执行，片上ROM会寻找Bootloader代码，并加载到内存（这一步由“芯片厂商”负责设计和实现）。

+ 第二阶段：Bootloader开始执行，首先负责完成硬件的初始化，然后找到Linux内核代码，并加载到内存（这一步由“设备厂商”负责设计和实现）。

+ 第三阶段：Linux内核开始启动，初始化各种软硬件环境，加载驱动程序，挂载根文件系统，并执行init程序，由此开启Android的世界（这一步则是Android内核开发过程中需要涉及的地方）。

Android系统以及各大Linux的发行版，他们的Linux内核部分启动过程都是差不多的，他们之间**最大的区别就在于init程序的不同**，因为init程序决定了系统在启动过程中，究竟会启动哪些守护进程和服务，以及呈现出怎样的一个用户UI界面。

因此，init 程序是分析Android启动过程中最核心的程序，其工作主要有3点：

1. 创建和挂载一些系统目录/设备节点，设置权限，如：/dev, /proc, 和 /sys；
2. 解析 init.rc 和 init.\<hardware\>.rc，并启动属性服务，以及一系列的服务和进程。
3. 显示 boot logo；

其中，最重要的步骤是第二步，一系列的Android服务在这时被启动起来，其实Android系统的启动最重要的过程也就是各个系统服务的启动，因为系统所有的功能都是依赖这些服务来完成的，比如启动应用程序，拨打电话，使用WIFI或者蓝牙，播放音视频等等，只要这些服务都能正常地启动起来并且正常工作，整个Android系统也就完成了自己的启动。


**本地服务**

本地服务是指运行在C++层的系统守护进程，一部分本地服务是init进程直接启动的，它们定义在init.rc脚本和init.\<hardware\>.rc中，如 ueventd、servicemanager、debuggerd、rild、mediaserver等。还有一部分本地服务，是由这些本地服务进一步创建的，如mediaserver服务会启动AudioFlinger, MediaPlayerService， 以及 CameraService 等本地服务。

> 注意，每一个由init直接启动的本地服务都是一个独立的Linux进程，在系统启动以后，我们通过adb shell命令进入手机后，输入top命令就可以查看到这些本地进程的存在。


**Android服务**

Android服务是指运行在Dalvik虚拟机进程中的服务，这些服务的创建过程描述如下：

+ init进程会执行app_process程序，创建Zygote进程，它是Android系统最重要的进程，所有后续的Android应用程序都是由它fork出来的。
+ Zygote进程会首先fork出"SystemServer"进程，"SystemServer"进程的全部任务就是将所有的Android核心服务启动起来。

部分 Android 核心服务：

| **Service**                       | **Description**                                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Activity Manager                  | Manages activities life cycle and new services                                                                 |
| Package Manager                   | Manages application package handling (install, uninstall, upgrade, permissions)                                |
| Window Manager                    | Manages all the window manipulations (like input events, orientation).                                         |
| AppWidget Service                 | Handles Android widgets                                                                                        |
| Backup Manager                    | Manages backup scheduling and transfer                                                                         |
| Status Bar                        | Shows software/hardware status. It works with other managers like Notification, Network Status, Battery Status |
| Power Manager                     | Handles power management while Android’s different modes (lock mode, sleep mode, Adjust brightness)            |
| NetworkManagement Service         | Deals with network related activities                                                                          |
| Notification Manager              | Manage all notifications (Toasts)                                                                              |
| Location Manager                  | Manages location providers                                                                                     |
| Entropy Mixer                     | Handles (load & save periodically) kernel randomness                                                           |
| Display Manager                   | Manages display properties                                                                                     |
| Telephony Registry                | Provides telephony information                                                                                 |
| Scheduling Policy                 | Manages the process scheduling                                                                                 |
| Account Manager                   | Handles the users account credential of different online services                                              |
| Content Manager                   | Handles all the data’s on a device                                                                             |
| Battery Service                   | Manages battery level and charging states                                                                      |
| Alarm Manager                     | Used to schedule the user applications to be run at future.                                                    |
| Input Manager                     | Handles input devices and key layouts                                                                          |
| Device Policy                     | Enforces security policies for the device                                                                      |
| Clipboard Service                 | Provides Clipboard based copy/past operations.                                                                 |
| NetworkStats Service              | Monitors Network connection Status                                                                             |
| NetworkPolicy Service             | Enforces network security policies.                                                                            |
| Wi-Fi P2pService                  | Handles WiFi peer to peer connection                                                                           |
| Ethernet Service                  | Manages Ethernet connectivity.                                                                                 |
| Wi-Fi Service                     | Manage WiFi connectivity                                                                                       |
| Connectivity Service              | Monitors and handles network connection state changes                                                          |
| Network Service Discovery Service | Used to find local network devices to share app data                                                           |
当所有的服务都启动完毕后，SystemServer 会打印出“Making services ready”，然后通过ActivityManager 启动 Home 界面，并发送“ACTION_BOOT_COMPLETED”广播消息。

> 注意，这些Android服务并没有各种运行在独立的进程中，它们由SystemServer以线程的方式创建，所以都运行在同一个进程中，即SystemServer进程中。

Package Manager 服务启动后，会解析所有位于 “/system/app” and “/system/vendor/app” 路径下的 “.apk” 文件，并验证其 AndroidManifest.xml。