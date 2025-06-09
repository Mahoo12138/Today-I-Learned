// 实现一个通用Pop<T>，它接受一个数组T并返回一个没有最后一个元素的数组。

// 例如,额外：同样，您也可以实现Shift，Push和Unshift吗？

type t16a1 = ['a', 'b', 'c', 'd']
type t16a2 = [3, 2, 1]

type Pop<T extends any[]>= T extends [...infer Rest, infer Tail] ? Rest : []

type Unshift<T extends any[]>= T extends [infer Head, ...infer Rest] ? Rest : []

type Push<T extends any[],U>= [...T, U]

type Shift<T extends any[],U>= [U,...T]

type re1 = Pop<t16a1> // expected to be ['a', 'b', 'c']
type re2 = Pop<t16a2> // expected to be [3, 2]
type re3 = Unshift<t16a2> // expected to be [2, 1]
type re4 = Push<t16a2,0> // expected to be [3, 2, 1, 0]
type re5 = Shift<t16a2, 4> // expected to be [4, 3, 2, 1]