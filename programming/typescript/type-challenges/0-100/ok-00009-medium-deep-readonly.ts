// 实现一个通用的DeepReadonly<T>，它将对象的每个参数及其子对象递归地设为只读。

// 您可以假设在此挑战中我们仅处理对象。数组，函数，类等都无需考虑。

// 但是，您仍然可以通过覆盖尽可能多的不同案例来挑战自己。


type Test09 = {
  x: {
    a: 1
    b: 'hi',

  }
  y: 'hey',
  a: ["df",{name: "adf"}],
  f: () => string,
}

class Class09 {
 name: string
}



type DeepReadonly1<T> = {
  readonly [key in keyof T]: DeepReadonly1<T[key]>
}

// 优化其他类型 1
type Diff = string | boolean | number | bigint | symbol | null | undefined | Function
type DeepReadonly2<T> = T extends Diff ? T : {
  readonly [key in keyof T]: DeepReadonly2<T[key]>
}

//优化其他类型 2：逆向思维
type DeepReadonly3<T> = {
  readonly [K in keyof T] : T[K] extends Record<string,unknown> | Array<unknown> ?  DeepReadonly3<T[K]> : T[K];
}


type DeepReadonly<T> = DeepReadonly3<T>

type test091 = DeepReadonly<Test09>                           // 字面量类
type test092 = DeepReadonly<() => string>                     // 函数
type test093 = DeepReadonly<["dsf","sdf"]>                    // 简单类型数组
type test094 = DeepReadonly<Class09>                          // class 类 
type test095 = 
  DeepReadonly<["dsf",["dsf",{name:"dsf"}],{name: "dsf"}]>    // 复杂类型数组    