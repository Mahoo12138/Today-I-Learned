Go使用SQL与类SQL数据库的惯例是通过标准库 [database/sql](http://golang.org/pkg/database/sql/)。这是一个对关系型数据库的通用抽象，它提供了标准的、轻量的、面向行的接口。

## 概述

在Go中访问数据库需要用到`sql.DB`接口：它可以创建语句(statement)和事务(transaction)，执行查询，获取结果。

对于`sql.DB`，首先要了解到它并不是数据库连接，也并未在概念上映射到特定的数据库(Database)或模式(schema)。它只是一个接口和数据库实体的抽象，这个数据库可能是各种各样的，例如一个本地文件、通过网络连接访问的远程数据库，或者是一个内存中的数据库。

`sql.DB` 在后台为你执行以下重要的事情：

+ 操作具体的驱动打开/关闭实际底层数据库的连接；
+ 按需管理连接池，可能有之前提到的多种情形；

`sql.DB` 抽象的设计目的是让您不必担心如何管理对底层数据存储的并发访问。当您使用连接执行任务时，连接将被标记为正在使用，当不再使用时，连接将返回到可用池。这样做的一个后果是，如果您未能将连接释放回池，则可能导致`sql.DB`打开大量连接，可能会耗尽资源(太多连接、太多打开的文件句柄、缺乏可用的网络端口等)。稍后我们将对此进行更多讨论。

在创建`sql.DB`之后，您可以使用它来查询它所表示的数据库，以及创建语句和事务。

## 引入数据库驱动

使用数据库时，除了`database/sql`包本身，还需要引入想使用的特定数据库驱动。

你通常不应该直接使用数据库驱动，尽管有些驱动鼓励你那样做（在我看来，这是个错误的想法）。相反，如果可能的话，你的代码应该只引用定义在包 `database/sql` 的类型。这有助于避免你的代码依赖于这个驱动，以至于你可以以很小的代码修改就可更换底层的数据库驱动（也就是你要访问的数据库）。这也强制你使用 go 的惯用语法，而不是特定驱动的作者提供的惯用语法。

在本文档中，我们使用出自 @julienschmidt 和 @arnehormann 优秀的 [MySQL drivers](https://github.com/go-sql-driver/mysql) 为例。

首先，我们将相关依赖导入到 go 源文件中：

```go
import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)
```

注意到，我们是匿名加载数据库驱动的，即将它的包名的别名设置为 `_`，所以它导出的名称对我们是不可见的。在底层，该驱动会将其自身注册到 `database/sql`包中，通常情况下，除了 `init` 函数运行，其他任何事情都不会发生。

现在可以准备访问一个数据库了。

## 访问数据库

现在我们载入了数据库驱动，正准备创建一个数据库对象，即一个 `sql.DB`。为此，你可以使用 `sql.Open`。它会返回一个 `*sql.DB`。

```go
func main() {
	db, err := sql.Open("mysql",
		"user:password@tcp(127.0.0.1:3306)/hello")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
}
```

在上面的例子中，我们说明几件事情：

1. `sql.OPEN` 的第一个参数是驱动名，这是一个驱动被用于将其自身注册到 `database/sql`中的字符串，按照惯例，它会与包名保持一直以避免歧义。例如， `mysql` 对应着 [github.com/go-sql-driver/mysql](https://github.com/go-sql-driver/mysql)。某些驱动不会遵循该惯例使用数据库名称，例如 `sqlite3`包名为 [github.com/mattn/go-sqlite3](https://github.com/mattn/go-sqlite3) 以及`postgres`是 [github.com/lib/pq](https://github.com/lib/pq)。
2. 第二个参数是驱动特定的语法，将向驱动表明如何访问底层数据库。在例子中，我们将连接到本地 Mysql 数据库实例中的 `hello` 数据库。
3. 你应该（几乎）总是对所有 `database/sql` 操作返回结果，做检测和处理错误。只有很少一些特殊情况，这样做是没有意义的， 我们将在后面讨论。
4. 如果 `sql.DB` 没有一个生命周期超出当前函数作用域，那么通常会使用`defer db.Close()`。

可能与直觉相反，`sql.OPEN` 不会建立任何与数据库的连接，也不会验证驱动连接的参数。它只是简单地为后续将使用的数据库做了抽象。底层数据库第一个实际的连接将会被懒加载式地建立，即当它首次被需要的时候。如果你想要立即检测数据库的可用性和可访问性（例如可以建立网络连接以及登录），可使用 `db.Ping`，不过要记住检测错误：

```go
err = db.Ping()
if err != nil {
	// do something here
}
```

当操作完数据库时，虽然习惯上使用 `Close()`关闭，但是 `sql.DB` 对象是为了长连接而设计的，不要频繁`Open()`和`Close()`数据库。应该为每个不同的待访问数据库创建一个 `sql.DB`实例，并在用完前一直保留它。需要时可将其作为参数传递，或注册为全局对象，但是要让其保持开启状态。且不要在短链接函数中 `Open()` 或`Close()`，也应该将 `sql.DB`作为参数传入其中。

如果你不把`sql.DB`当成长期对象来用而频繁开关启停，就可能遭遇各式各样的错误：无法复用和共享连接，耗尽网络资源，由于TCP连接保持在`TIME_WAIT`状态而间断性的失败等……这些问题就是没有按照`database/sql`设计的意图使用的标志。

现在是时候使用你的 `sql.DB` 对象了。

## 检索结果集合

有许多种惯用的从数据库检索数据结果的操作：

+ 执行查询返回多行；
+ 准备一个语句重复使用，执行多次并销毁它；
+ 以一次性的方式执行语句，而不准备重复使用；
+ 执行查询返回单行，这是特殊情况的快捷方式。

Go 的 `database/sql` 函数名称是重要的。如果一个函数名称包含 `Query`，那么它是被设计为向数据库查询的，会返回多行，即使它是空的。不返回多行的语言不应该使用 `Query` 函数，而应该使用 `Exec()`。

 ### 获取数据

让我们看一个如何查询数据库的例子，我们从 `users` 表中查询一个 id 为 1 的 user，然后输出它的 id 和 name。我们将使用 `rows.Scan()`把结果一次一行分配到变量中。

```go
var (
	id int
	name string
)
rows, err := db.Query("select id, name from users where id = ?", 1)
if err != nil {
	log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
	err := rows.Scan(&id, &name)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(id, name)
}
err = rows.Err()
if err != nil {
	log.Fatal(err)
}
```

以下是上述代码所作的事情：

+ 我们使用 `db.Query()` 发送查询请求到数据库，通常要检查错误；
+ 延迟执行 `db.Close()`，这非常重要；
+ 使用 `rows.Next()` 遍历这些行；
+ 通过`rows.Scan()`读取这些行中的列，到变量中；
+ 遍历完列后，检查错误；

这几乎是在Go中实现它的唯一方法。例如，你不能将列当作一个 map。这是因为所有东西都是强类型的。你需要创建正确的类型的变量并向他们传递指针，如上所示。

其中有几个部分很容易出错，可能会产生不好的后果。

+ 在 `for rows.Next()` 循环中，需要每次检查错误。如果有错误发生，你需要知晓。不要仅仅假设循环会迭代直到处理完所有行。
+ 其次，只要有一个 open 的结果集（rows 表示的），底层的连接则是 busy 的，不能用于其他查询。意味着它在连接池中是不可用的。如果你使用 `rows.Next()` 迭代所有的列数据，最终你读到最后一行，接着  `rows.Next()` 将遇到 一个内部的 EOF 错误，会为你调用 `rows.Close()`函数。但是某些原因下，你退出了循环，即更早返回等，然后 `rows` 不会关闭，所以连接仍然保持 open 状态。（如果 `rows.Next()`由于错误返回 false，它会自动关闭）。这是一个轻易耗尽资源的方式。
+ 如果 `rows`已经关闭，那么 `rows.Close()` 将是无害的空操作，所以你可以调用它多次。注意，我们首先检查错误，并仅在没有错误时调用 `rows.Close()`，以避免运行时 panic。
+ 应该总是使用 `defer rows.Close()`，即使你也在循环最后显性地调用了 `rows.Close()`，这也不是个坏主意；
+ 不要在循环中 `defer`。一个 `deferred` 的语句不会执行直到这个函数退出时，所以一个长时间运行的函数不应该使用它。如果你这样做，你将缓慢地积累内存。如果你重复地在循环中查询和消费结果集，应该在处理完成每一个结果时，显式地调用 `rows.Close()` ，而不是使用 `defer`。

### Scan() 原理

当你遍历每一行且将其 `scan` 到目标变量时，Go 在幕后为你执行数据类型转为工作。这基于目标变量的类型。意识到这一点能简化你的代码并帮助你避免重复性的工作。

例如，假设你从表中选择了一些行，表中定义了字符串类型的列，例如`VARCHAR(45)`之类的。然而，你可能知道，表中总是包含数字。如果你传一个指针给字符串，Go 将复制这个字节转化为字符串。现在，你能使用 `strconv.ParseInt()` 或类似的将转化值转化为数字的方式。你将不得不检测 SQL 操作的错误，以及转化为整型的错误。这是麻烦又枯燥的。

或者，你能向 `Scan()` 传一个指向整型的指针。Go 将会检测到然后调用 `strconv.ParseInt()`。如果转化中报错了，`Scan()` 也会返回。你的代码现在更间接也更少了。这也即是推荐使用 `database/sql`的方式。

### 查询前的准备

通常情况下，你应该总是做好查询被多次使用的准备。准备查询的结果即是一个预处理语句，当你需要执行语句时，它能有占位符（placeholders，也叫值绑定 bind values）作为你需要的参数。出于通常的理由（例如，避免 SQL 注入攻击），这比拼接字符串更好。

在 MySQL 中，参数占位符是 `?`，在 PostgreSQL 中是 `$N`，这里的 `N` 是数字。SQLite 接受其中任何一种。在 Oracle 占位符以冒号`:`为首而且是命名的，如：`:params1`。我们将使用 `?` 因为我们是以 MySQL 为例的。

```go
stmt, err := db.Prepare("select id, name from users where id = ?")
if err != nil {
	log.Fatal(err)
}
defer stmt.Close()
rows, err := stmt.Query(1)
if err != nil {
	log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
	// ...
}
if err = rows.Err(); err != nil {
	log.Fatal(err)
}
```

在底层， 实际上是`db.Query()`在准备，执行并关闭一个准备好的语句。这是到数据库的三次往返。如果你不够仔细，你能将应用程序与数据库的交互增加三倍！一些驱动在特定情况下能够避免，但不是所有驱动都能做到的。更多可参考[预处理语句](http://go-database-sql.org/prepared.html)。

### 单行查询

如果一个查询最多返回一行，你能在冗长的模板代码中使用一个快捷方式：

```go
var name string
err = db.QueryRow("select name from users where id = ?", 1).Scan(&name)
if err != nil {
	log.Fatal(err)
}
fmt.Println(name)
```

查询中的错误会被延迟直到 `Scan()` 被调用，然后从中返回。你也能在预处理语句上调用 `QueryRow()`：

```go
stmt, err := db.Prepare("select name from users where id = ?")
if err != nil {
	log.Fatal(err)
}
defer stmt.Close()
var name string
err = stmt.QueryRow(1).Scan(&name)
if err != nil {
	log.Fatal(err)
}
fmt.Println(name)
```

## 使用事务修改数据

现在我们已经准备好了解如何使用事务修改数据了。如果你习惯了使用 “statement” 对象获取行数据及更新数据的编程语言，那么这种区别看起来可能是不太自然的，但是在 Go 中，这种区别的存在，有一个很重要的原因。

### 修改数据的语句

使用 `Exec()`，与预处理语句是最佳的，对于实现`INSERT`, `UPDATE`, `DELETE`, 或者其他不会返回任何行数据的语句。以下的例子将展示如果插入一行数据并检验操作的元数据：

```go
stmt, err := db.Prepare("INSERT INTO users(name) VALUES(?)")
if err != nil {
	log.Fatal(err)
}
res, err := stmt.Exec("Dolly")
if err != nil {
	log.Fatal(err)
}
lastId, err := res.LastInsertId()
if err != nil {
	log.Fatal(err)
}
rowCnt, err := res.RowsAffected()
if err != nil {
	log.Fatal(err)
}
log.Printf("ID = %d, affected = %d\n", lastId, rowCnt)
```

执行语句将产生一个 `sql.Result`，它能够返回语句的元数据：最后插入行的 ID，以及影响的行的数量。

假如你并不关心结果呢？假如你仅是想要执行一条语句然后检查是否有任何错误，但忽略结果呢？下面两条语句不是在做相同的事情吗？

```go
_, err := db.Exec("DELETE FROM users")  // OK
_, err := db.Query("DELETE FROM users") // BAD
```

答案是不。它们没有做相同的事情，而且你从不应该使用向那样使用 `Query()`。`Query()` 返回一个 `sql.Rows`，它会保留数据库连接直到它被关闭掉。因为这可能有未读取的数据（例如更多的数据行），所以连接不能被使用。上面的例子中，连接将一直不会被释放。垃圾收集器最终将为你关闭底层的`net.Conn`，但是这可能需要很长时间。此外 `database/sql` 包会一直追踪在连接池中的连接，希望你在某时刻释放它，以至于连接能够再次使用。因此，这个反模式是一个耗尽资源（例如，太多的连接）的好的方式。

### 使用事务

在 Go 中，一个事务本质上是一个保留连接到数据存储的对象。它让你完成我们目前为止见过的所有操作，但是保证他们在相同的连接中被执行。

调用`db.Begin()` 开始一个事务，使用返回的结果的`Tx` 变量上的 `Commit()` 或者 `Rollback()`方法来关闭事务。在底层，`Tx` 从连接池获取一个连接，然后将其保留且只在本次事务中使用。`Tx` 上的方法都一对一地映射到可以在数据库本身上调用的方法，例如 `Query` 等。

在事务中创建的预处理语句被单独地绑定在该事务中。查看[预处理](#预处理语句)了解更多。

你不应该在你的 SQL 代码中，将事务相关函数如`Begin()` 和`Commit()` 与 SQL 语句如 `BEGIN` 和 `COMMIT` 混用。可能会导致糟糕地结果：

+ `Tx` 对象将保持 open，即会保留一个连接池中的连接不会返回；
+ 数据库的状态可能会与 Go 变量代表的状态不同步；
+ 你能相信你是在一个事务内，单一的连接中执行查询，而实际上 Go 已隐性地为你已经创建了多个连接，并且一些语句不是事务的一部分。

当你在事务内进行操作时，你应该注意，不要调用 `db` 变量。在使用 `db.Begin()` 创建的 `Tx` 变量上完成你的所有调用。`db` 并不在事务中，只是 `Tx` 变量在事务中。如果你进一步调用 `db.Exec()` 或者类似的函数，这些调用将会发生在你的事务作用域之外的其他连接上。

如果你需要修改连接状态的多个语句，即使你不想要事务本身，你也需要一个`Tx`。例如：

+ 创建多个临时的表，且只对一个连接可见；
+ 设置变量，例如 MysSQL 的 `SET @var := somevalue` 语法；
+ 改变连接选项，例如设置字符集或超时；

如果你需要做任何与此相关的事情，你需要将你的活动绑定到一个单独的连接中，在 Go 中唯一的方式就是使用 `Tx`。

## 使用预处理语句

预处理语句拥有 Go 的所有常见的好处：安全，高效，方便。但是他们可能与你可能用过的预处理语句的实现有一些不同，尤其是关于他们与 `database/sql` 内部构件的一些交互。

### 预处理语句和连接

在数据库层级，连接是没有直接暴露的给 `database/sql` 的用户的。你不能在连接上预处理语句，而是在 `DB` 或 `Tx` 上预处理语句。并且 `database/sql` 具有一些便捷行为，如自动重试。由于这些原因，预处理语句和连接之间的底层关联存在于驱动程序级别，会对您的代码隐藏。

这是它的工作原理：

+ 当你预处理一个语句时，它是在连接池中的一个连接中预处理的；
+ `Stmt` 对象会记住哪一个连接使用过；
+ 当你执行 `Stmt` 时，它会尝试该连接。如果它不可用，可能是关闭了或者是忙于其他别的什么事，它会从连接池中获取另一个连接并基于该连接重新预处理语句；

当原始的连接是忙碌时，语句将会根据所需重新预处理，数据库的高并发使用，可能会导致大量连接繁忙，从而创建大量的预处理语句。这可能导致显性的语句泄漏，语句被预处理和重新预处理会远超你认为的频繁，甚至达到服务端对语句的数量限制。

### 避免预处理语句

Go 在底层为你创建预处理语句。例如一个简单的 `db.Query(sql, param1, param2)`，用于预处理 `SQL`，然后带着参数执行，最后关闭语句。

然而有时候，一个预处理语句并不是你想要的，这可能有以下几个原因：

+ 数据库不支持预处理语句。例如，当使用 MySQL 驱动时，你能连接 MemSQL 和 Sphinx，因为它们支持 MySQL 连接协议。但是它们不支持二进制协议这包括预处理语句，所以它们会以奇怪的方式失败。
+ 语句的重用程度不够，不值得使用，而且安全问题用其他方式处理，因此不需要性能开销。可以在 [VividCortex](https://vividcortex.com/blog/2014/11/19/analyzing-prepared-statement-performance-with-vividcortex/) 博客上看一个例子。

如果你不想要使用预处理语句，你需要使用 `fmt.Sprint()` ，或者，类似的，组装 SQL，然后将其作为`db.Query()` 或 `db.QueryRow()` 唯一的参数传入。并且你的驱动需要支持明文查询执行，这已经在 Go 1.1 中被加入了，通过`Execer` 和 `Queryer` 接口，[文档在这](http://golang.org/pkg/database/sql/driver/#Execer)。

### 事务中的预处理语句

在一个 `Tx` 中创建的预处理语句会单独绑定到其中，所以之前的关于重新预处理的警告并不适用。当你在一个 `Tx` 对象上操作时，你的操作会直接映射到底层有且只有一个的连接。

这也意味着在 `Tx` 内创建的预处理语句不能从其中分离使用。同样的，在 `DB`中创建的预处理语句也不能在事务中使用，因为它们将绑定到一个不同的连接。

要在 `Tx` 中使用在事务外创建的预处理语句，你能使用 `Tx.Stmt`，它将从事务外部的预处理语句中创建一个新的特定于事务的语句。它通过获取一个现有的预处理语句，设置到事务的连接，并在每次执行所有语句时重新预处理所有语句来实现这一点。这种行为及其实现是不可取的，甚至在`database/sql` 源代码中有一个 **TODO** 来改进它;我们不建议使用这种方法。

在事务中使用预处理语句时必须谨慎。考虑下面的例子:

```go
tx, err := db.Begin()
if err != nil {
	log.Fatal(err)
}
defer tx.Rollback()
stmt, err := tx.Prepare("INSERT INTO foo VALUES (?)")
if err != nil {
	log.Fatal(err)
}
defer stmt.Close() // danger!
for i := 0; i < 10; i++ {
	_, err = stmt.Exec(i)
	if err != nil {
		log.Fatal(err)
	}
}
err = tx.Commit()
if err != nil {
	log.Fatal(err)
}
// stmt.Close() runs here!
```

在 Go 1.4 之前，关闭一个 `*sql.Tx` 将与其关联的连接释放回池中，但是在此之后执行了对预处理语句的 `Close` 的延迟调用，这可能导致对底层连接的并发访问，从而导致连接状态不一致。如果您使用的是 Go 1.4 或更高版本，则应该确保在事务提交或回滚之前始终关闭语句。. [这个问题](https://github.com/golang/go/issues/4459)在 Go 1.4 中由[CR 131650043](https://codereview.appspot.com/131650043)修复。

### 参数占位符语法

预处理语句中占位符参数的语法是特定于数据库的。例如，比较 MySQL、PostgreSQL 和Oracle：

```go
MySQL               PostgreSQL            Oracle
=====               ==========            ======
WHERE col = ?       WHERE col = $1        WHERE col = :col
VALUES(?, ?, ?)     VALUES($1, $2, $3)    VALUES(:val1, :val2, :val3)
```

## 处理错误

几乎所有的包含 `database/sql` 类型的操作都会在最后一个值返回错误。你应该总是检查这些错误，从不忽略。

这有一些特殊情况的错误行为，或者说你可能需要这些额外的东西。

### 迭代结果集的错误

思考以下代码：

```go
for rows.Next() {
	// ...
}
if err = rows.Err(); err != nil {
	// handle the error here
}
```

来自 `rows.Err()` 的错误可能是在 `rows.Next()` 循环中的各种错误的结果。循环可能由于多种原因退出，而不是正常退出，所以总是需要检查循环是否正常终止。一个不正常的终止会自动调用 `rows.Close()`，尽管多次调用它是无害的。

### 关闭结果集的错误

如果你过早的退出循环，应该总是显式地关闭一个 `sql.Rows`，如前面提到的。如果循环正常退出或发生错误，它将自动关闭，但是你可能错误地这样做：

```go
for rows.Next() {
	// ...
	break; // whoops, rows is not closed! memory leak...
}
// do the usual "if err = rows.Err()" [omitted here]...
// it's always safe to [re?]close here:
if err = rows.Close(); err != nil {
	// but what should we do if there's an error?
	log.Println(err)
}
```

`rows.Close()` 返回的错误是通用规则的唯一例外，是所有数据库中错误，最好捕获和检测的。如果 `rows.Close()` 返回一个错误，这不太清楚你应该做什么。记录错误信息或者异常可能是唯一清晰的东西，如果它也不清晰，可能你应该忽略这个错误。

### `QueryRow()` 的错误

思考以下的获取单行的代码：

```go
var name string
err = db.QueryRow("select name from users where id = ?", 1).Scan(&name)
if err != nil {
	log.Fatal(err)
}
fmt.Println(name)
```

 假如没有 `id = 1` 的用户会怎样？然后结果中将无行数据，`.Scan()` 将不会将值 scan 进 `name`。那么会发生什么呢？

Go 定义了一个特殊的错误常量，被叫做 `sql.ErrNoRows` ，当结果是空时，会从 `QueryRow()` 被返回。这在大多数情况下需要被当作特殊情况来处理。一个空的结果通常在应用程序代码中不会被当作为错误，如果你不检测一个错误是否是这个错误常量，将导致意想不到的应用程序代码错误。

来自查询的错误将被延迟直到 `Scan()` 被调用，然后从其中返回。上面的代码这样写更好：

```go
var name string
err = db.QueryRow("select name from users where id = ?", 1).Scan(&name)
if err != nil {
	if err == sql.ErrNoRows {
		// there were no rows, but otherwise no error occurred
	} else {
		log.Fatal(err)
	}
}
fmt.Println(name)
```

有人可能会问为什么一个空结果集会认为是一个错误。一个空集没有任何错误。理由是 `QueryRow()` 方法需要这样的特殊情况让调用者区分是否 `QueryRow()` 实际上查找到了一行数据；没有它的，`Scan()` 将不会做任何事情，最后你可能不会意识到变量没有从数据库获得任何值。

当你使用 `QueryRow()` 时，你应该只会遇到这个错误。如果你在别处遇到这个错误，你可能做错了什么。

### 识别特定数据库错误

编写如下代码是很有诱惑力的：

```go
rows, err := db.Query("SELECT someval FROM sometable")
// err contains:
// ERROR 1045 (28000): Access denied for user 'foo'@'::1' (using password: NO)
if strings.Contains(err.Error(), "Access denied") {
	// Handle the permission-denied error
}
```

尽管这不是实现的最佳方式。例如，字符串值可能根据服务器用于发送错误消息的语言而变化。更好的方式是对比错误的数据来识别是个什么特定的错误。

然而，这个机制要做的因驱动而异，因为这不是 `database/sql` 它本身的一部分。在 本教程专注 MySQL 驱动中， 你可以编写如下代码：

```go
if driverErr, ok := err.(*mysql.MySQLError); ok { 
    // Now the error number is accessible directly
	if driverErr.Number == 1045 {
		// Handle the permission-denied error
	}
}
```

不过，这儿的 `MySQLError` 类型有特定的驱动提供，`.Number` 字段可能因驱动而不同。然而，该数字的值来自 MySQL 的错误消息，因此是特定于数据库的，而不是特定于驱动程序的。

这样的代码依然很丑，相比于 1045，一个神奇的数据，是一种代码的气味。一些驱动（虽然不是 MySQL，出于跑题的缘故）提供了一个错误识别码的列表。例如，Postgres `pq` 驱动程序在`error.go` 中。还有一个外部的[ MySQL 错误数字](https://github.com/VividCortex/mysqlerr)，由 [VividCortex](https://github.com/VividCortex/mysqlerr) 维护。使用这样的列表，上面的代码最好这样写：

```go
if driverErr, ok := err.(*mysql.MySQLError); ok {
    if driverErr.Number == mysqlerr.ER_ACCESS_DENIED_ERROR {
        // Handle the permission-denied error
    }
}
```

### 处理连接错误

如果到数据库的连接断开、终止或出现错误，该怎么办?

当发生这种情况时，您不需要实现任何逻辑来重试失败的语句。作为 `database/sql` 中的连接池的一部分，处理失败连接是内置的。如果您执行一个查询或其他语句，而底层连接失败了，Go 将重新打开一个新连接（或只是从连接池中获取另一个连接）并重试，最多 10 次。

然而，可能会有一些意想不到的后果。当发生其他错误条件时，可能会重试某些类型的错误。这也可能是驱动程序特有的。MySQL 驱动程序的一个例子是，使用 `KILL` 取消不需要的语句（例如长时间运行的查询）会导致该语句被重试多达10次。

## 操作 Nulls

可为空的列是令人恼怒的，并且会导致很多丑陋的代码。如果能避免可尽量避免。如果不能，然后你将需要使用 `database/sql`中的特殊类型处理它们，或者你自己定义。

有可为空的布尔类型，字符串类型，整型以及浮点型。你可以这样使用它们：

```go
for rows.Next() {
	var s sql.NullString
	err := rows.Scan(&s)
	// check err
	if s.Valid {
	   // use s.String
	} else {
	   // NULL value
	}
}
```

可空类型的限制，以及避免可空列的原因，以防你需要更多具有说服力的：

+ 没有 `sql.NullUint64`  或  `sql.NullYourFavoriteType`，你需要自己定义它们；
+ 可空性可能很棘手，而且不适合于未来。如果你认为某些东西可能将不会为空，但是你的想法错了，那么你的程序将崩溃，也许很少，在你推出它们之前，你将不会捕获错误。
+ 最棒的事情是，Go 有一个很有用的默认零值，对于每个变量。可空的东西不是这样工作的。

如果你需要定义你自己的类型处理空值，你可以拷贝 `sql.NullString` 的设计来实现它。

如果你在数据库中不能避免存在空值，另一个大多数数据库都是可行的方法，叫做 `COALESCE()`。您可以使用类似下面这样的代码，而不需要引入大量的 `sql.Null*` 类型。

```go
rows, err := db.Query(`
	SELECT
		name,
		COALESCE(other_field, '') as otherField
	WHERE id = ?
`, 42)

for rows.Next() {
	err := rows.Scan(&name, &otherField)
	// ..
	// If `other_field` was NULL, `otherField` is now an empty string. This works with other data types as well.
}
```

## 操作未知的列

`Scan()` 函数需要你准确传入目标变量的正确数量。假如你不知道查询将返回什么呢？

如果你不知道查询将返回多少列，可以使用 `Columns()` 找到一个列的列表的名字。你能检测该列表的数量来判断其中有多少列，并且你能在 `Scan()` 中传入一个有正确数量的值的切片 slice 。例如一些 MySQL 的复刻在 `SHOW PROCEESLIST` 命令时，返回不同的列，所以你不得不准备在其中会遇到错误。

这有一种方法；还有其他的：

```go
cols, err := rows.Columns()
if err != nil {
	// handle the error
} else {
	dest := []interface{}{ // Standard MySQL columns
		new(uint64), // id
		new(string), // host
		new(string), // user
		new(string), // db
		new(string), // command
		new(uint32), // time
		new(string), // state
		new(string), // info
	}
	if len(cols) == 11 {
		// Percona Server
	} else if len(cols) > 8 {
		// Handle this case
	}
	err = rows.Scan(dest...)
	// Work with the values in dest
}
```

如果你不知道列的或者他们的类型，你应该使用 `sql.RawBytes`。

```go
cols, err := rows.Columns() // Remember to check err afterwards
vals := make([]interface{}, len(cols))
for i, _ := range cols {
	vals[i] = new(sql.RawBytes)
}
for rows.Next() {
	err = rows.Scan(vals...)
	// Now you can check each element of vals for nil-ness,
	// and you can use type introspection and type assertions
	// to fetch the column into a typed variable.
}
```

## 连接池

这是在 `database/sql` 中基础的连接池。没有很多的能力去控制和检测它，但是这有一些你知道后会发现很有用的事情：

+ 连接池意味着执行两个连续的语句在一个单独的数据库中，可能开启两个连接并分离执行它们。对于程序员来说这很常见，即感到疑惑为什么他们的代码有反常行为。例如，`LOCK TABLES` 跟在 `INSERT` 后会堵塞，因为 `INSERT` 在一个不持有表锁的连接上。
+ 连接会在需要且池中没有空闲的连接时被创建。
+ 默认情况下，连接的数量没有上限。如果你尝试一次性做很多事情，你能创建一个任意数量的连接。这将导致数据库返回错误例如 “too many connections.”。
+ 在 Go 1.1 或以后，你能使用 `db.SetMaxIdConns(N)` 来限制连接池中空闲状态下的连接的数量。然而，这并不会限制连接池的连接的数量。
+ 在 Go 1.2.1 或以后，你能使用 `db.SetMaxOpenConns` 来限制数据库开启的连接的最大数量。遗憾的是，在 1.2 中，一个 [deadlock bug](https://groups.google.com/d/msg/golang-dev/jOTqHxI09ns/x79ajll-ab4J) ([fix](https://code.google.com/p/go/source/detail?r=8a7ac002f840)) 阻止 `db.SetMaxOpenConns(N)` 安全使用。
+ 连接回收相当地快，使用 `db.SetMaxIdleConns(N)` 设置一个较大的等待连接数量，能减少滚动，并且帮助保持连接重用。
+ 保持连接长时间空闲将导致问题（像在 [issue](https://github.com/go-sql-driver/mysql/issues/257) MySQL 在 Microsoft Azure）。尝试 `db.SetConnMaxLifetime(duration)` 因为重用长期保活的连接可能导致网络问题。这懒关闭不使用的连接，例如关闭失效的连接可能会被延迟。

## 惊奇，反模式和限制

虽然你一旦习惯了 `database/sql`，它将变得很简单，但是可能会感到惊讶，对于它支持的使用情况的细节之处。这在 Go 的核心库中很常见。

### 资源耗尽

如本文内容所述，如果你没有如预期一般使用  `database/sql`，你必然造成麻烦，通常通过消耗资源或阻止它们被高效重用：

+ 开启或关闭数据库能导致资源耗尽；
+ 读取行数据失败或使用 `rows.Close()`保留连接池中的连接；
+ 对不会返回行数据的语句使用 `Query()` 将保留池中的连接；
+ 如果不了解预处理语句的工作方式，可能会导致大量额外的数据库活动。

### 大 uint64 值

有一些奇怪的错误， 你不能将大的无符号整数作为参数传递给语句，如果它们的高位被设置了：

```go
_, err := db.Exec("INSERT INTO users(id) VALUES", math.MaxUint64) // Error
```

这将会抛出一个错误，注意，如果你使用 `uint64` 的值，因为它们可能一开始很小，没有错误，但随着时间的推移而增加，并开始抛出错误。

### 连接状态不匹配

有些东西能改变连接的状态，并且能造成错误由于以下两个原因：

+ 一些连接状态，例如你是否在事务中，应该通过 Go 的类型被处理；
+ 你可能假设你的查询运行在一个单独的连接中，当它们并不是时。

例如，使用`USE`语句设置当前数据库，是许多人都会做的一件典型的事情。但是在 Go 中，它只会影响你运行它的连接。除非您处于事务中，否则您认为在该连接上执行的其他语句实际上可能运行在从池中获得的不同连接上，因此它们不会看到此类更改的影响。

此外，在您更改连接之后，它将返回池，并可能污染其他一些代码的状态。这就是为什么永远不应该像 SQL 那样发出 BEGIN 或 COMMIT 语句的原因之一。

### 特定数据库的语法

`database/sql` API 提供了面向行的数据库的抽象，但是特定的数据库和驱动程序在行为和/或语法上可能有所不同，例如预处理语句的占位符。

### 多结果集

Go 驱动程序不以任何方式支持来自单个查询的多个结果集，而且似乎也没有这样做的计划，尽管有支持批量操作(如批量复制)的特性请求。

这意味着，除其他外，返回多个结果集的存储过程将无法正常工作。
