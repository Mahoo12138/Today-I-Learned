// 实现类型版本的 Array.unshift。

import { Equal, Expect } from '@type-challenges/utils';

// 举例

// type Result = Unshift<[1, 2], 0> // [0, 1, 2,]

type Unshift<T, U> = T extends any[] ? [U, ...T] :[]

type cases = [
  Expect<Equal<Unshift<[], 1>, [1]>>,
  Expect<Equal<Unshift<[1, 2], 0>, [0, 1, 2 ]>>,
  Expect<Equal<Unshift<['1', 2, '3'], boolean>, [boolean, '1', 2, '3']>>,
]