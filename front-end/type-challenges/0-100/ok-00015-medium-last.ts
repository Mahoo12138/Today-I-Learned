// 在此挑战中建议使用TypeScript 4.0

// 实现一个通用Last<T>，它接受一个数组T并返回其最后一个元素的类型。

// 例如

type t14t1 = ['a', 'b', 'c']
type t14t2 = [3, 2, 1]

type Last<T extends any[] > = T extends [...infer Head,infer Last] ? Last :never

type tail1 = Last<t14t1> // expected to be 'c'
type tail2 = Last<t14t2> // expected to be 1