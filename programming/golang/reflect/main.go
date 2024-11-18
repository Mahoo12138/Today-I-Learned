package main

import (
	"fmt"
	"reflect"
)

func main() {
	// test1()
	// test2()
	// test3()
	// test4()
	// test5()
	test6()
}

func test1() {
	var i int = 1
	v := reflect.ValueOf(i) // 获取 Value
	fmt.Println(v, v.Int())
	t := reflect.TypeOf(i) // 获取 Type
	fmt.Println(t, t.Name())
}

func test2() {
	d := dog{"dog", 2}
	// 反射结构体
	t := reflect.TypeOf(d)
	fmt.Println("Type: ", t.Name())

	v := reflect.ValueOf(d)
	fmt.Println("Fields: ")

	// 打印结构体字段
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		val := v.Field(i)
		fmt.Println("\t", f.Name, f.Type, val)
	}
	// 打印结构体方法，只反射首字母大写的（对外部包可见）
	fmt.Println("Methods: ")
	for i := 0; i < t.NumMethod(); i++ {
		m := t.Method(i)
		fmt.Println("\t", m.Name, m.Type, m)
	}
}

type dog struct {
	name string
	age  int
}

func (d dog) Run(speed string) {
	fmt.Println(d.name, "is running", speed)
}

type User struct {
	Id   int
	Name string
}
type Manager struct {
	User
	title string
}

// 嵌套结构体
func test3() {
	m := Manager{
		User:  User{1, "user"},
		title: "kk",
	}
	t := reflect.TypeOf(m)
	fmt.Println(t.Field(0))                  // {User  main.User  0 [0] true}
	fmt.Println(t.Field(1))                  // {title main string  24 [1] false}
	fmt.Println(t.FieldByIndex([]int{0, 0})) // {Id  int  0 [0] false}
	fmt.Println(t.FieldByIndex([]int{0, 1})) // {Name  string  8 [1] false}
}

// 来修改简单数据类型的值
func test4() {
	x := 123

	fmt.Println(x)

	v := reflect.ValueOf(&x)
	v.Elem().SetInt(999)

	fmt.Println(x)
}

// 通过反射来修改结构体的值
func test5() {
	u := User{
		Id:   1,
		Name: "32",
	}
	Set(&u)
	fmt.Println(u)
}
func Set(o interface{}) {
	v := reflect.ValueOf(o)
	if v.Kind() != reflect.Ptr {
		fmt.Println("can not be set")
		return
	}
	value := v.Elem()
	if !value.CanSet() {
		fmt.Println("can not be set")
	}
	f := value.FieldByName("Name")
	if !f.IsValid() {
		fmt.Println("can not be set")
		return
	}
	if f.Kind() == reflect.String {
		f.SetString("wangwang")
	}
}

// 使用反射机制动态调用方法
func test6() {
	d := dog{"gogo", 1}
	v := reflect.ValueOf(d)
	mv := v.MethodByName("Run")
	args := []reflect.Value{reflect.ValueOf("fastly")}
	// 传入的参数必须时 reflect.Value 类型组成的一个切片
	mv.Call(args)
}
