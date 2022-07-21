

type Test4t1 = number extends any ? "yes" : "no"
type Test4t2 = string extends any ? "yes" : "no"
type Test4t3 = symbol extends any ? "yes" : "no"
type Test4t4 = never extends any ? "yes" : "no"



type Test4t5<T> = {
  [k in keyof T]: T[k]
}
type Test4t6 = Test4t5<{1:"sad",2:"dsf"}>

type Test4t7<T> = T[any]; 
type Test4t8 = Test4t7<{1:"sad",2:"dsf",[x:number]: "sad" | "dsf"}>
type Test4t9 = Test4t7<{1:"sad",2:"dsf",[y:string]: "sad" | "dsf"}>
type Test4t10 = Test4t7<{[y:string]: "sad" | "dsf"}>
// TODO: [x:number]
type Test4t11 = Test4t7<{sad:"2ad",2:"dsf",[y:number]: "sad" | "dsf"}>
// type Test4t11 = Test4t7<{[y:string]: "sad" | "dsf",[x:number]: "sad1" | "dsf2"}>
