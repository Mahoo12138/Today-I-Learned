import { Equal, ExpectFalse, Expect } from '@type-challenges/utils';

// 在类型系统里实现 JavaScript 的 Array.includes 方法
// 这个类型接受两个参数，返回的类型要么是 true 要么是 false

type Includes1<T extends any[], U> =
  T extends [infer H, ...infer R]
  ? Equal<H, U> extends true
    ? true
    : Includes1<R, U>
  : false;

// case 4 & 8 not pass
type Includes2<T extends readonly any[], U> = {
  [P in T[number]]: true
}[U] extends true ? true : false;


type Includes<T extends any[], U> = Includes1<T,U>


type cases898 = [
  Expect<Equal<Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'>, false>>,
  Expect<Equal<Includes<[1, 2, 3, 5, 6, 7], 7>, true>>,
  Expect<Equal<Includes<[1, 2, 3, 5, 6, 7], 4>, false>>,
  Expect<Equal<Includes<[1, 2, 3], 2>, true>>,
  Expect<Equal<Includes<[false, 2, 3, 5, 6, 7], false>, true>>,
  Expect<Equal<Includes<[{ a: 'A' }], { readonly a: 'A' }>, false>>,
  Expect<Equal<Includes<[{ readonly a: 'A' }], { a: 'A' }>, false>>,
  Expect<Equal<Includes<[1], 1 | 2>, false>>,
  Expect<Equal<Includes<[1 | 2], 1>, false>>,
  Expect<Equal<Includes<[null], undefined>, false>>,
  Expect<Equal<Includes<[undefined], null>, false>>,
]
