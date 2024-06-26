# Android 设备分区

Android 设备包含两类分区：一类是启动分区，对启动过程至关重要，另一类是用户分区，用于存储与启动无关的信息。

## 启动分区

+ `boot`：此分区包含一个使用 `mkbootimg` 创建的内核映像，此分区还包含在 Android 13 之前发布的设备中的通用 ramdisk：
	- `kernel` 虚拟分区：通过将新内核映像写入旧内核映像来覆盖内核（`zImage`、`zImage-dtb`、`Image.gz-dtb`）。
	- `ramdisk` 虚拟分区：通过将新 ramdisk 映像写入旧 ramdisk 映像来覆盖 ramdisk。

+ `init_boot`：此分区包含发布时搭载 Android 13 及更高版本的设备的通用 ramdisk。
## 标准分区

+ `system`：此分区包含 Android 框架。
+ `odm`：此分区包含原始设计制造商 (ODM) 对系统芯片 (SoC) 供应商板级支持包 (BSP) 的自定义设置。利用此类自定义设置，ODM 可以替换或自定义 SoC 组件，并在硬件抽象层 (HAL) 上为板级组件、守护程序和 ODM 特定的功能实现内核模块。
+ `odm_dlkm`：此分区专门用于存储 ODM 内核模块。将 ODM 内核模块存储在 `odm_dlkm` 分区（而不是 `odm` 分区）中后，无需更新 `odm` 分区即可更新 ODM 内核模块。
+ `recovery`：此分区会存储在 OTA 过程中启动的恢复映像。支持 A/B 无缝更新的设备可以将恢复映像存储为 `boot` 或 `init_boot` 映像中包含的 ramdisk（而不是单独的映像）。
+ `cache`：此分区会存储临时数据，如果设备使用无缝更新，则此分区是可选的。cache 分区并非必须可从引导加载程序写入，但必须可清空。
+ `misc`：此分区供 recovery 分区使用，大小为 4 KB 或更大。
+ `userdata`：此分区包含用户安装的应用和数据，包括自定义数据。
- `metadata` ：此分区用于在设备使用元数据加密时存储元数据加密密钥。大小为 16 MB 或更大。此分区未经加密，且系统不会对其数据拍摄快照。数据会在设备恢复出厂设置时被清空。此分区的使用受到严格限制。
- `vendor`：此分区包含所有无法分发给 AOSP 的二进制文件。如果设备不包含专有信息，则可以忽略此分区。
- `vendor_dlkm`：此分区专门用于存储供应商内核模块。将供应商内核模块存储在`vendor_dlkm` 分区（而不是 `vendor` 分区）中后，无需更新 `vendor` 分区即可更新内核模块。
- `radio`：此分区包含无线装置映像，只有包含无线装置且在专用分区中存储无线装置专用软件的设备才需要此分区。
## 动态分区

搭载 Android 11 及更高版本的设备可以支持动态分区，此类分区属于 Android 的用户空间分区系统，支持在 OTA 更新期间创建和销毁分区以及调整分区大小。

借助动态分区，供应商无需担心各个分区（例如 `system`、`vendor` 和 `product`）的大小。取而代之的是，设备会分配一个 `super` 分区，其中的子分区可动态调整大小。各个分区映像不再需要为将来的 OTA 预留空间。相反，`super` 中剩余的可用空间还可用于所有动态分区。