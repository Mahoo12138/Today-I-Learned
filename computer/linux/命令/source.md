在当前 Shell 环境中从指定文件读取和执行命令，可简写为`.`。

```shell
source filename [arguments]
```

+ *filename*：要执行的文件
+ *arguments*（可选）：传递给文件的参数

source 命令执行脚本文件后，会将其中的函数和变量都导入到当前 shell，且返回文件最后一个命令的返回值；

直接使用 shell 执行脚本文件，因为脚本是在子 shell 进程运行的，所以不能读取到当前 shell 环境中定义的变量；

