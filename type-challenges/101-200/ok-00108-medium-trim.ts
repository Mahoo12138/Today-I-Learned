// 实现Trim<T>，它是一个字符串类型，并返回一个新字符串，其中两端的空白符都已被删除。
// 例如

type trimed3 = Trim<'  Hello World  '> // expected to be 'Hello World'

type Trim2<S extends string> = TrimRight<TrimLeft<S>>


//TODO: 字符串模板类型还能联合
type Trim<S extends string> = S extends `${Space}${infer T}` | `${infer T}${Space}` ? Trim<T> : S;