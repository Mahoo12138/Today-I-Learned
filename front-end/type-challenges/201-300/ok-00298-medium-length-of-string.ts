// 计算字符串的长度，类似于 `String#length`.


// 利用泛型参数在类型递归中缓存状态
type LengthOfString<S extends string, T extends string[] = []>
  = S extends `${infer First}${infer Rest}`
  ? LengthOfString<Rest, [...T, First]>
  : T['length'];



type case1 = [
  Expect<Equal<LengthOfString<''>, 0>>,
  Expect<Equal<LengthOfString<'kumiko'>, 6>>,
  Expect<Equal<LengthOfString<'reina'>, 5>>,
  Expect<Equal<LengthOfString<'Sound! Euphonium'>, 16>>,
]

// 先把字符串递归转为数组，再计算
type StringToArray<S extends string> =  S extends `${infer First}${infer Rest}` ? [First, ...StringToArray<Rest>] : [];
type LengthOfString2<S extends string> = StringToArray<S>['length']


type case2 = [
  Expect<Equal<LengthOfString2<''>, 0>>,
  Expect<Equal<LengthOfString2<'kumiko'>, 6>>,
  Expect<Equal<LengthOfString2<'reina'>, 5>>,
  Expect<Equal<LengthOfString2<'Sound! Euphonium'>, 16>>,
]