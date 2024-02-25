// 实现一个通用First<T>，它接受一个数组T并返回它的第一个元素的类型。

// 例如：

type test14a1 = ['a', 'b', 'c']
type test14a2 = [3, 2, 1]
type test14a3 = [string,number]

type First1<T extends any[]> = T[0]
type First2<T extends any[]> = ReturnType<(U: T) => typeof U[0]>;
type First3<T extends any[]> = T extends [infer A, ...infer Tail] ? A : never

type First<T extends any[]> = First2<T>

type head1 = First<test14a1> // expected to be 'a'
type head2 = First<test14a2> // expected to be 3
type head3 = First<test14a3> // expected to be string