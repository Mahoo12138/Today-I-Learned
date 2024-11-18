## GOPATH

在 `Go 1.5` 版本之前，`go get` 安装的所有依赖都是按照模块路径，存放在 `$GOPATH/src` 下，没有版本控制。



## go vendor

`Go 1.5` 版本推出了 `vendor` 机制，即在项目根目录创建 `vendor` 目录，用于放置该项目依赖；

该命令只是将当前项目在`$GOPATH`下引用的依赖，复制到  `vendor` 目录，并使用`vendor/vendor.json` 进行管理；

通常是应用工程（包含`main.go`）会使用 `govendor`，也就是离线保存第三方依赖，需要将  `vendor` 目录也包含进版本管理；

`go build` 的时候会先去 `vendor` 目录查找依赖，如果没有找到会再去 `GOPATH` 目录下查找。

要想开启 `vendor` 机制， `Go` 项目必须位于 `$GOPATH` 环境变量配置的某个路径的 `src` 目录下面。

## go mod

Go 1.11 版本推出 `modules` 机制，简称 `mod`，从Go 1.13 开始，go module 将是 Go 默认的依赖管理工具。

包不再保存在 `$GOPATH` 中，而是被下载到了 `$GOPATH/pkg/mod `路径下。

