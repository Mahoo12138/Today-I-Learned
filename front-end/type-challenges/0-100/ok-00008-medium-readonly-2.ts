// 实现一个通用MyReadonly2<T, K>，它带有两种类型的参数T和K。

// K指定应设置为Readonly的T的属性集。如果未提供 K，则应使所有属性都变为只读，就像普通的Readonly<T>一样。

interface Todo08 {
  title: string
  description: string
}

type MyReadonly2<T, K extends keyof T = keyof T> = {
  [key in keyof T as key extends K ? never : key]: T[key] 
} & {
  readonly [P in K]: T[P]
}

type test08 = MyReadonly2<Todo08, "title">

const t8: test08 = {
  title:"sdf",
  description: "string"
}

t8.description = "dsf"
// t8.title = "fdsf"  // error 