// 实现内置的 Exclude <T, U>类型，但不能直接使用它本身。

// 从联合类型 T 中排除 U 的类型成员，来构造一个新的类型。


type Fruits = "apple" | "orange" | "banana"

// type MyExclude<T,U> = U extends T ? never : U
type MyExclude<T,U> = T extends U ? never : T

// extends 会将左边的联合类型进行类型分发


type Test43 = MyExclude<Fruits,"apple">
// type Test43 = MyExclude<"apple",Fruits>
