// 不使用 Omit 实现 TypeScript 的 Omit<T, K> 泛型。
// Omit 会创建一个省略 K 中字段的 T 对象。

interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview3 = MyOmit<Todo, 'description' | 'title'>

const todo3: TodoPreview3 = {
  completed: false,
}

// answer
type MyOmit<T, K extends keyof T> = {
  [key in keyof T as key extends K ? never : key]: T[key]
}
