## go mod init

该命令在当前路径下初始化一个 `go.mod` 文件，接受一个参数，即模块路径；

> 这里说的模块路径（module path）并不是文件系统中的索引路径，它只是一个逻辑概念，用于标识该模块的一个唯一字符串，通常会以域名作为模块路径的前缀，因为域名是全球范围内是唯一的，这可以确保模块的唯一性；

## go install 

该命令拉取指定的包源码并编译构建，可执行文件则会被安装至 `GOBIN`环境变量下的路径，默认是 `$GOPATH/bin`，如果 `$GOPATH` 不存在，则取`$HOME/go/bin`；如果是在 `$GOROOT` 路径下执行 install 命令，那么可执行文件则会被安装至 `$GOROOT/bin` 或 `$GOTOOLDIR` ；

在 Go 1.16 后，install 命令可以携带包版本后缀（如 `@latest` or `@v1.0.0`），继而忽略任意路径下的 `go.mod`的影响，也不会改变其中的内容；

