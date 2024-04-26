# embed 包及其使用详解

embed是在Go 1.16中新加包。它通过***//go:embed***指令，可以在编译阶段将静态资源文件打包进编译好的程序中，并提供访问这些文件的能力。

## 为什么需要 embed 包

- **部署过程更简单。**传统部署要么需要将静态资源与已编译程序打包在一起上传，或者使用docker和dockerfile自动化前者，这在精神上是很麻烦的。
- **确保程序的完整性。**在运行过程中损坏或丢失静态资源通常会影响程序的正常运行。
- **您可以独立控制程序所需的静态资源。**

### 常用场景

+ Go模板
+ 静态web服务
+ 数据库迁移

## 基本使用

### 三种数据类型

在embed中，可以将静态资源文件嵌入到三种类型的变量，分别为：**字符串、字节数组、embed.FS 文件类型**。

```go
package main

import (
    _ "embed"
    "fmt"
)

//go:embed version.txt
var version string

//go:embed version.txt
var versionByte []byte

func main() {
    fmt.Printf("version %q\n", version)
}
```

前两种文件类型比较简单，直接使用指令`//go:embed 文件名` 将对应的文件内容导入到变量中。

第三种 `embed.FS` 文件类型，需要了解其3个对外方法：

```go
// Open 打开要读取的文件，并返回文件的fs.File结构.
func (f FS) Open(name string) (fs.File, error)

// ReadDir 读取并返回整个命名目录
func (f FS) ReadDir(name string) ([]fs.DirEntry, error)

// ReadFile 读取并返回文件的内容.
func (f FS) ReadFile(name string) ([]byte, error)
```

例如，在项目根目录下有如下静态资源目录结构：

```
|-static
|---js
|------util.js
|---img
|------logo.jpg
|---index.html
```

以下代码中，通过 `live` 参数控制访问的文件系统，通过指令`//go:embed static` 将路径下的 *static* 绑定为 `embededFiles`， 

```go
package main

import (
    "embed"
    "io/fs"
    "log"
    "net/http"
    "os"
)


func main() {
    useOS := len(os.Args) > 1 && os.Args[1] == "live"
    http.Handle("/", http.FileServer(getFileSystem(useOS)))
    http.ListenAndServe(":8888", nil)
}

//go:embed static
var embededFiles embed.FS

func getFileSystem(useOS bool) http.FileSystem {
    if useOS {
        log.Print("using live mode")
        return http.FS(os.DirFS("static"))
    }

    log.Print("using embed mode")

    fsys, err := fs.Sub(embededFiles, "static")
    if err != nil {
        panic(err)
    }
    return http.FS(fsys)
}
```

## 注意点

+ 在使用`//go:embed`指令的文件都需要导入 embed 包；

+ `//go:embed` 指令只能用在包一级的变量；

+ 当包含目录时，它不会包含以“`.`”或“`*`“开头的文件。但是如果使用通配符，比如`dir/\*`，它将包含所有匹配的文件，即使它们以“`.`"或"`*`"开头。