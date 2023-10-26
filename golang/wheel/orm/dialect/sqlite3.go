package dialect

import (
	"fmt"
	"reflect"
	"time"
)

// 定义了一个新的类型 sqlite3，这个类型是一个空结构体，没有任何字段或方法
// 空结构体的类型定义用于表示某个特定的类型(接口)，但它本身不包含任何数据
type sqlite3 struct{}

// 接口断言。它的作用是将 sqlite3 类型标记为实现了 Dialect 接口
// _ 是一个特殊的标识符，用于丢弃变量的值，这里它的作用是不需要存储任何值
// 这种类型的断言通常用于确保一个类型实现了特定接口的所有方法，以便在编译时捕捉潜在的错误
var _ Dialect = (*sqlite3)(nil)

func (s *sqlite3) DataTypeOf(typ reflect.Value) string {
	switch typ.Kind() {
	case reflect.Bool:
		return "bool"
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uintptr:
		return "integer"
	case reflect.Int64, reflect.Uint64:
		return "bigint"
	case reflect.Float32, reflect.Float64:
		return "real"
	case reflect.String:
		return "text"
	case reflect.Array, reflect.Slice:
		return "blob"
	case reflect.Struct:
		if _, ok := typ.Interface().(time.Time); ok {
			return "datetime"
		}
	}
	panic(fmt.Sprintf("invalid sql type %s (%s)", typ.Type().Name(), typ.Kind()))
}

func (s *sqlite3) TableExistSQL(tableName string) (string, []interface{}) {
	args := []interface{}{tableName}
	return "SELECT name FROM sqlite_master WHERE type='table' and name = ?", args
}

func init() {
	RegisterDialect("sqlite3", &sqlite3{})
}
