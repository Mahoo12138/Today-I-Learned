package dialect

import "reflect"

var dialectsMap = map[string]Dialect{}

type Dialect interface {
	DataTypeOf(typ reflect.Value) string
	TableExistSQL(tableName string) (string, []interface{})
}

func RegisterDialect(name string, dialect Dialect) {
	dialectsMap[name] = dialect
}

func GetDialect(name string) (dialect Dialect, ok bool) {
	dialect, ok = dialectsMap[name]
	return
}

// Dialect 接口包含 2 个方法：
// 1. DataTypeOf 用于将 Go 语言的类型转换为该数据库的数据类型。
// 2. TableExistSQL 返回某个表是否存在的 SQL 语句，参数是表名(table)。

// 不同数据库之间的差异远远不止这两个地方，随着 ORM 框架功能的增多，dialect 的实现也会逐渐丰富起来，同时框架的其他部分不会受到影响。