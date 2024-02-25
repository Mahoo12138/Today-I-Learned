// 实现 Capitalize<T> 它将字符串的第一个字母转换为大写，其余字母保持原样。
// 例如

type capitalized = Capitalize2<'hello world'> // expected to be 'Hello world'

type Capitalize2<S extends string> = S extends `${infer x}${infer tail}` ? `${Uppercase<x>}${tail}` : S;