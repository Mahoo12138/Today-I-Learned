// 实现 TrimRight<T> ，它接收确定的字符串类型并返回一个新的字符串，其中新返回的字符串删除了原字符串结尾的空白字符串。
// 例如

type trimed2 = TrimRight<'  Hello World  '> // 应推导出 '  Hello World'

// type Space = ' ' | '\n' | '\t'
// 递归
type TrimRight<S extends string> = S extends `${infer R}${Space}` ? TrimRight<R> : S