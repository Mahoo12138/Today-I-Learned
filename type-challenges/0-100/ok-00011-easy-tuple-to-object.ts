// 传入一个元组类型，将这个元组类型转换为对象类型，
// 这个对象类型的键/值都是从元组中遍历出来。

const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const


type TupleToObject<T extends readonly any[]> = {
  [K in T[number]]: K
}
type result = TupleToObject<typeof tuple>


// 通过传入 number，可快速获得数组值的联合类型 
type T11t1 = typeof tuple[number]  // "tesla" | "model 3" | "model X" | "model Y"
type T11t2 = typeof tuple          // readonly ["tesla", "model 3", "model X", "model Y"]