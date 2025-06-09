// 实现 Replace<S, From, To> 将字符串 S 中的第一个子字符串 From 替换为 To 。
// 例如

type replaced = Replace<'types are fun!', 'fun', 'awesome'> // 期望是 'types are awesome!'

type Replace1<S extends string, R extends string, D extends string>
  = S extends `${infer h}${R}${infer t}`
  ? `${h}${D}${t}`
  : S; 

type replaced2 = Replace1<'types are fun!', '', 'awesome'> // 期望是 'types are awesome!'

// 字符串模板类型需要考虑空字符串
type Replace<S extends string, From extends string, To extends string> = 
      From extends '' 
      ? S 
      : S extends `${infer V}${From}${infer R}`
        ? `${V}${To}${R}`
        : S

