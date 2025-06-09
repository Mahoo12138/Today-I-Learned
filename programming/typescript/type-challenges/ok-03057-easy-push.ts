// 在类型系统里实现通用的 Array.push

type Push1<T extends any[], F> = [...T, F]
type Push2<T, U> = T extends [...infer P] ? [...P, U] : never

type Push<T extends any[],U> = Push1<T,U>

type Result3057 = Push<[1, 2], '3'> // [1, 2, '3']