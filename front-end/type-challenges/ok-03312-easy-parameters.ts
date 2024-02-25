// 实现内置的 Parameters<T> 类型，而不是直接使用它，

// type MyParameters<T extends (...args: any[]) => any> = any

import type { Equal, Expect } from '@type-challenges/utils'



type MyParameters<T extends (...args: any[]) => any> = T extends (...args: infer R) => any ? R : never

const foo = (arg1: string, arg2: number): void => { }
const bar = (arg1: boolean, arg2: { a: 'A' }): void => { }
const baz = (): void => { }

type cases = [
  Expect<Equal<MyParameters<typeof foo>, [string, number]>>,
  Expect<Equal<MyParameters<typeof bar>, [boolean, { a: 'A' }]>>,
  Expect<Equal<MyParameters<typeof baz>, []>>,
]