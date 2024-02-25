// 实现泛型 TupleToUnion<T>，它返回元组所有值的合集

type Arr = ['1', '2', '3']

type TupleToUnion1<T extends any[]> = T[number]


// 会取到元组中[x:number]这个属性的值
type TupleToUnion2<T> = T[any]; 



type TupleToUnion<T> = TupleToUnion2<T>

type T10t0 = {
  [k in keyof Arr]: Arr[k]
}

type T10t1 = TupleToUnion<Arr> // expected to be '1' | '2' | '3'
type T10t2 = TupleToUnion<never>
type T10t3 = TupleToUnion<"dsf">
type T10t4 = TupleToUnion<{}>