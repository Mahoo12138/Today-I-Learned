// 有时，您可能希望根据某个属性在联合类型中查找类型。
// 在此挑战中，我们想通过在联合类型Cat | Dog中搜索公共type字段来获取相应的类型。
// 换句话说，在以下示例中，我们期望LookUp<Dog | Cat, 'dog'>获得Dog，LookUp<Dog | Cat, 'cat'>获得Cat。

interface Cat {
  type: 'cat'
  breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal'
}

interface Dog {
  type: 'dog'
  breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer'
  color: 'brown' | 'white' | 'black'
}

type MyDog = LookUp<Cat | Dog, 'dog'> // expected to be `Dog`
type MyCat = LookUp<Cat | Dog, 'cat'> // expected to be `Cat`
type unkowned = LookUp<Cat | Dog, 'fdaf'> // expected to be `Cat`


type LookUp<T, P> = T extends { type: infer E }
  ? E extends P
  ? E
  : never
  : never;


type LookUp2<U, T> = U extends { type: T } ? U : never;
type MyDog2 = LookUp2<Cat | Dog, 'dog'> // expected to be `Dog`

type LookUp3<U, T extends string> = {
  [K in T]: U extends { type: T } ? U : never
}[T]
type MyDog3 = LookUp2<Cat | Dog, 'dog'> // expected to be `Dog`
