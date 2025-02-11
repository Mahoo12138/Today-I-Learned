## \_\_attribute\_\_((constructor(1)))

`__attribute__((constructor(1)))` 是 GCC 的一个函数属性，用于指定一个函数在程序启动时自动执行，类似于构造函数。括号中的数字表示优先级，数字越小，优先级越高，执行顺序越靠前。例如，在 Android NDK 开发中，它常用于在 so 库加载时进行一些初始化操作。

在共享库 (shared library, .so 文件) 加载到内存时，用 `__attribute__((constructor))` 声明的函数会在 main 函数执行 _之前_ 自动调用。这对于需要在程序启动早期进行初始化的任务非常有用，例如：

- 初始化全局变量
- 设置钩子函数 (hook functions)
- 启动后台线程
- 注册模块

> 在使用 `__attribute__((constructor))` 时，需要注意它是一个 GCC 的扩展，并非标准 C/C++ 的一部分，因此可能不具备可移植性。

类似地，`__attribute__((destructor))` 用于指定一个函数在程序结束时自动执行，类似于析构函数。它在 main 函数返回或程序调用 exit() 之后执行。