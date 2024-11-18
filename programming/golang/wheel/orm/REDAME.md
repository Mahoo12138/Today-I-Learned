## Binary was compiled with 'CGO_ENABLED=0', go-sqlite3 requires cgo to work. This is a stub

编译二进制文件时，未开启 CGO，也就是这个环境变量，因为 `go-sqlite3` 依赖 `cgo`，需要 C 环境才行，Windows上面默认是没有 gcc 的，安装即可：https://sourceforge.net/projects/mingw-w64/files/；
然后修改环境变量：`$ go env -w CGO_ENABLED=1`