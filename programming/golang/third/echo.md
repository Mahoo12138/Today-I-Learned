## 开始

```go
// 创建 echo 实例
e := echo.New()
// 路由
e.GET("/", func(c echo.Context) error {
    return c.String(http.StatusOK, "Hello, World!")
})
```

 ### URL路径参数

```go
// e.GET("/users/:id", getUser)
func getUser(c echo.Context) error {
    id := c.Param("id")
    return c.String(http.StatusOK, id)
}
```

### 请求参数

```go
// e.GET("/show", show) /show?team=x-men&member=wolverine
func show(c echo.Context) error {
    team := c.QueryParam("team")
    member := c.QueryParam("member")
    return c.String(http.StatusOK, "team:" + team + ", member:" + member)
}
```

### 表单 

#### application/x-www-form-urlencoded

```go
func save(c echo.Context) error {
    // 获取 name 和 email 的值
    name := c.FormValue("name")
    email := c.FormValue("email")
    return c.String(http.StatusOK, "name:" + name + ", email:" + email)
}
```

```bash
curl -d "name=Joe Smith" -d "email=joe@labstack.com" http://localhost:1323/save
```

> `-d` 选项用于发送以`application/x-www-form-urlencoded`格式编码的数据，该格式常用于普通表单数据的提交；
>
> `-d` 选项后面的参数应该是一个字符串，多个参数可以使用`&`连接发送，也可以分开发送；
>
> 但表单数据终被编码为一个字符串，其中每个表单字段的名称和值都以`=`符号连接，不同的表单字段之间以`&`符号进行连接。

#### multipart/form-data

```go
func save(c echo.Context) error {
    // Get name
    name := c.FormValue("name")
    // Get avatar
    avatar, err := c.FormFile("avatar")
    if err != nil {
        return err
    }

    // Source
    src, err := avatar.Open()
    if err != nil {
        return err
    }
    defer src.Close()

    // Destination
    dst, err := os.Create(avatar.Filename)
    if err != nil {
        return err
    }
    defer dst.Close()

    // Copy
    if _, err = io.Copy(dst, src); err != nil {
        return err
    }

    return c.HTML(http.StatusOK, "<b>Thank you! " + name + "</b>")
}
```

```bash
$ curl -F "name=Joe Smith" -F "avatar=@/path/to/your/avatar.png" http://localhost:1323/save
//output => <b>Thank you! Joe Smith</b>
```

> `-F` 选项用于发送 `multipart/form-data` 格式的数据，该格式通常用于上传文件或二进制数据等场景。
>
> 如果要上传文件，则值可以是一个以`@`符号开头的文件路径；
>
> 在 `multipart/form-data` 格式中，每个键值对都会被编码为一条消息，消息中包含了该键值对的元数据和值的数据，与 `-d`传送的格式还是区别的；

### 处理请求

- 根据 Content-Type 请求标头将 `json`，`xml`，`form` 或 `query` 负载绑定到 Go 结构中。
- 通过状态码将响应渲染为 `json` 或者 `xml` 格式。

```go
type User struct {
    Name  string `json:"name" xml:"name" form:"name" query:"name"`
    Email string `json:"email" xml:"email" form:"email" query:"email"`
}

e.POST("/users", func(c echo.Context) error {
    u := new(User)
    if err := c.Bind(u); err != nil {
        return err
    }
    return c.JSON(http.StatusCreated, u)
    // 或者
    // return c.XML(http.StatusCreated, u)
})
```

### 静态资源

下面的代码定义`/static/*`目录为静态资源文件目录

```go
e.Static("/static", "static")
```

## 路由

基于**基数树**（[Radix Tire](http://en.wikipedia.org/wiki/Radix_tree)），Echo 的路由查询速度非常快。路由使用 [sync pool](https://golang.org/pkg/sync/#Pool) 来重用内存，实现无 GC 开销下的零动态内存分配。

### 匹配所有

匹配零个或多个字符的路径。例如， `/users/*` 将会匹配：

- `/users/`
- `/users/1`
- `/users/1/files/1`
- `/users/anything...`

### 路径匹配顺序

- Static (固定路径)
- Param (参数路径)
- Match any (匹配所有) 

```go
e.GET("/users/:id", func(c echo.Context) error {
    return c.String(http.StatusOK, "/users/:id")
})

e.GET("/users/new", func(c echo.Context) error {
    return c.String(http.StatusOK, "/users/new")
})

e.GET("/users/1/files/*", func(c echo.Context) error {
    return c.String(http.StatusOK, "/users/1/files/*")
})
```

上面定义的路由将按下面的优先级顺序匹配:

- `/users/new`
- `/users/:id`
- `/users/1/files/*`

### 组路由

```
Echo#Group(prefix string, m ...Middleware) *Group
```

可以将具有相同前缀的路由归为一组从而定义具有可选中间件的新子路由。除了一些特殊的中间件外，组路由也会继承父中间件。若要在组路由中添加中间件，则需使用 `Group.Use(m ...Middleware)` 。最后，组路由也可以嵌套。

下面的代码，我们创建了一个 admin 组，它需要对 `/admin/*` 路由进行基本的 HTTP 身份认证。

```go
g := e.Group("/admin")
g.Use(middleware.BasicAuth(func(username, password string) bool {
    if username == "joe" && password == "secret" {
        return true
    }
    return false
}))
g.GET("/users/:id", userHander)
g.POST("/login", authHander)
```

### 路由命名

每个路由都会返回一个 `Route` 对象，这个对象可以用来给路由命名。比如：

```go
routeInfo := e.GET("/users/:id", func(c echo.Context) error {
    return c.String(http.StatusOK, "/users/:id")
})
routeInfo.Name = "user"

// 或者这样写
e.GET("/users/new", func(c echo.Context) error {
    return c.String(http.StatusOK, "/users/new")
}).Name = "newuser"
```

当你需要在模版生成 uri 但是又无法获取路由的引用，或者多个路由使用相同的处理器(handler)的时候，路由命名就会显得更方便。

### 构造URI

`Echo#URI(handler HandlerFunc, params ...interface{})` 可以用来在任何业务处理代码里生成带有特殊参数的URI。这样在你重构自己的应用程序的时候，可以很方便的集中处理所有的 URI 。

```go
// 业务处理
h := func(c echo.Context) error {
    return c.String(http.StatusOK, "OK")
}
// 路由
e.GET("/users/:id", h)

url := e.URI(h, 1)
fmt.Println(url)	// '/users/1'
```

除了 `Echo#URI`，还可以使用 `Echo#Reverse(name string, params ...interface{})` 方法根据路由名生成 uri。比如，当 `foobar` 进行如下设置时，使用 `Echo#Reverse("foobar", 1234)` 就会生成 `/users/1234` ：

```go
// Handler
h := func(c echo.Context) error {
    return c.String(http.StatusOK, "OK")
}
// Route
e.GET("/users/:id", h).Name = "foobar"

url := e.Reverse("foobar", 1)
fmt.Println(url)	// '/users/1'
```

## 中间件

中间件是一个函数，嵌入在HTTP 的请求和响应之间。它可以获得 `Echo#Context` 对象用来进行一些特殊的操作， 比如记录每个请求或者统计请求数。

Action 的处理在所有的中间件运行完成之后。

中间件分为根级，组级，和路由级中间件

### Root Level (Before router)

`Echo#Pre()` 用于注册一个在路由执行之前运行的中间件，可以用来修改请求的一些属性。比如在请求路径结尾添加或者删除一个'/'来使之能与路由匹配。

下面的这几个内建中间件应该被注册在这一级别：

- AddTrailingSlash
- RemoveTrailingSlash
- MethodOverride

*注意*: 由于在这个级别路由还没有执行，所以这个级别的中间件不能调用任何 `echo.Context` 的 API。

###  Root Level (After router)

大部分时间你将用到 `Echo#Use()` 在这个级别注册中间件。 这个级别的中间件运行在**路由处理完请求之后**，可以调用所有的 `echo.Context` API。

下面的这几个内建中间件应该被注册在这一级别：

- BodyLimit
- Logger
- Gzip
- Recover
- BasicAuth
- JWTAuth
- Secure
- CORS
- Static

### Group Level

当在路由中创建一个组的时候，可以为这个组注册一个中间件。例如，给 admin 这个组注册一个 BasicAuth 中间件。

```go
e := echo.New()
admin := e.Group("/admin", middleware.BasicAuth())
```

也可以在创建组之后用 `admin.Use()`注册该中间件。

### Route Level

当你创建了一个新的路由，可以选择性的给这个路由注册一个中间件。

```go
e := echo.New()
e.GET("/", <Handler>, <Middleware...>)
```

