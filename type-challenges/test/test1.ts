type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"


type IType = 'a' | 'b' | 'c' | 'd'
type IType2 = 'a' | 'c' | 'm'
type Diff1 = IType extends IType2 ? never : IType // ？


type Foo<A extends number, B extends number>
    = Add<A, B>
type Result = Foo<1, 2> // => 3



// 基本运算
export type NArray<T, N extends number> = N extends N ? (number extends N ? T[] : _NArray<T, N, []>) : never

type _NArray<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _NArray<T, N, [T, ...R]>

type NArrayNumber<L extends number> = NArray<number, L>


type Test<T, N> = T extends N ? number : string

type a = _NArray<1, 3, []>
type b = NArray<2, 3>
type c = NArrayNumber<2>
type d = Test<4, number>


// 加法
export type Add<M extends number, N extends number> = [...NArrayNumber<M>, ...NArrayNumber<N>]['length']

// 减法
export type Subtract<M extends number, N extends number> =
    NArrayNumber<M> extends [...x: NArrayNumber<N>, ...rest: infer R] ? R['length'] : unknown

// 主要用于辅助推导乘除法; 否则会因为 Subtract 返回类型为 number | unknown 报错
type _Subtract<M extends number, N extends number> =
    NArrayNumber<M> extends [...x: NArrayNumber<N>, ...rest: infer R] ? R['length'] : -1

// 乘法
type _Multiply<M extends number, N extends number, res extends unknown[]> =
    N extends 0 ? res['length'] : _Multiply<M, _Subtract<N, 1>, [...NArray<number, M>, ...res]>
export type Multiply<M extends number, N extends number> = _Multiply<M, N, []>

// 除法
type _DivideBy<M extends number, N extends number, res extends unknown[]> =
    M extends 0 ? res["length"] : _Subtract<M, N> extends -1 ? unknown : _DivideBy<_Subtract<M, N>, N, [unknown, ...res]>
export type DividedBy<M extends number, N extends number> = N extends 0 ? unknown : _DivideBy<M, N, []>;