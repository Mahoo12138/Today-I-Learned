// 键入函数PromiseAll，它接受PromiseLike对象数组，返回值应为Promise<T>，其中T是解析的结果数组。

const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise<string>((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});



// expected to be `Promise<[number, 42, string]>`
const p = PromiseAll([promise1, promise2, promise3] as const)

// 数组也能当作 对象 ，使用 keyof 
declare function PromiseAll<T extends any[]>(values: readonly [...T]):
  Promise<{ [K in keyof T]: T[K] extends Promise<infer R> ? R : T[K] }>;


declare function PromiseAll2<T extends any[]>(values: readonly [...T]): Promise<{
  [key in keyof T]: Awaited<T[key]>
}>


type Awaited2<T> =
  T extends null | undefined ? T : // special case for `null | undefined` when not in `--strictNullChecks` mode
  T extends object & { then(onfulfilled: infer F, ...args: infer _): any } ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
  F extends ((value: infer V, ...args: infer _) => any) ? // if the argument to `then` is callable, extracts the first argument
  Awaited2<V> : // recursively unwrap the value
  never : // the argument to `then` was not callable
  T; // non-object or non-thenable