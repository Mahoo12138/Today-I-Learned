// 传入一个元组，将元组转换为枚举对象
// 如果第二个参数为 true，那么值应该是数字字面量

type System = ["macOS", "Windows", "Linux"]

type Format<T extends readonly string[], P extends any[] = []>
  = T extends readonly [infer R, ...infer S]
  ? S extends readonly any[]
    ? [[R, P["length"]], ...Format<S, [...P, any]>]
    : []
  : []

type Enum<T extends readonly string[], F extends Boolean = false> = {
  // readonly [K in Formate<T>[number] as Capitalize<K[0]>]: F extends true ? K[1] : K[0]
  readonly [K in Format<T>[number]as Capitalize<K[0]>]: F extends true ? K : K
}

type FindIndex<T extends readonly any[], K, A extends any[] = []>
  = T extends readonly [infer H, ...infer R]
  ? [H] extends [K]
    ? A["length"]
    : FindIndex<R, K, [...A, any]>
  : -1;
type Enum2<T extends readonly string[], N extends boolean = false> = {
  readonly [k in T[number]as `${Capitalize<k>}`]: N extends false ? k : FindIndex<T, k>;
}


type T472t1 = Enum<System>
type T472t2 = Enum<System, true>
type T472t3 = Format<System>
type T472t4 = Format<System, ["dfs"]>
type T472t5 = Format<System>[number]



type ComplexSystem = [[], "Windows", "Linux"]

