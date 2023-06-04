// 实现 ReplaceAll<S, From, To> 将一个字符串 S 中的所有子字符串 From 替换为 To。
// 例如

type replacedall = ReplaceAll<'t y p e s', ' ', ''> // 期望是 'types'

// 替换完后将结果类型全量递归
type ReplaceAll2<S extends string, R extends string, D extends string>
  = S extends `${infer H}${R}${infer T}`
  ? ReplaceAll<`${H}${D}${T}`, R, D>
  : S

// 尾递归才是正解
type ReplaceAll<S extends string, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer R1}${From}${infer R2}`
  ? `${R1}${To}${ReplaceAll<R2, From, To>}`
  : S