declare function zip<A, B>(a: ReadonlyArray<A>, b: ReadonlyArray<B>): Array<[A, B]>;

type a = typeof zip

type Horse = {}

type OnlyBoolsAndHorses = {
  [key: string]: boolean | Horse;
};

const conforms: OnlyBoolsAndHorses = {
  del: true,
  rodney: false,
};

type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};

interface A {
  x: number;
}
interface B {
  y: string;
}
let q: A | B = {x:7};
if ('x' in q) {
  // q: A
  q
} else {
  // q: B
  q
}
type Person ={
  name:string
  age:number
}
type p = Partial<Person>;
const person :p  = {

};

type MRecord<K extends keyof any, T> = {
  [P in K]: T;
};

type dog = Record<string | number, string | number | undefined>; 
type fox = Record<number, string>; 


type cat = MRecord<string | number, string | number | undefined>; 

const puppy : dog = {
  name: "ds",
  sex: undefined,
  232: 23
}
// console.log(puppy[232])

type ExcludeDog = Exclude<dog , "name" | "age">;

type P<T> = T extends any ? string : number;
// never是所有类型的子类型
type A1 = never extends any ? string : number; // string


type A2 = P<never> // never



type testRecord = Record<"name", string> & Record<"name",number>

// 互斥的值被成为 never
type result0 = testRecord extends Record<"name",never> ? "yes" : "no"

type testRecord1 = Record<string, string> & Record<string,number>

export type MergeInsertions<T> =
  T extends object
    ? { [K in keyof T]: MergeInsertions<T[K]> }
    : T
    
type result0_1 = MergeInsertions<testRecord1> // { [x: string]: never; }

type result1 = testRecord1 extends Record<string,never> ? "yes" : "no"

const test_record : testRecord1  = {
  // @ts-expect-error: Type 'number' is not assignable to type 'never'
  "name": 324
}

type testRecord2 = Record<number, string> & Record<string,number>

const test_record2: testRecord2 = {
  1: "dfsf",
  // @ts-expect-error
  "2": 12312
}
type result2_0 = testRecord2 extends Record<string, number> ? "yes" : "no"
type result2_1 = testRecord2 extends Record<number, string> ? "yes" : "no"
type result2_2 = testRecord2 extends Record<string | number, number> ? "yes" : "no"
type result2_3 = testRecord2 extends Record<string, number | string> ? "yes" : "no"
type result2_4 = testRecord2 extends Record<string | number, number | string> ? "yes" : "no"

const test232 = {
  // 1:"dsaf",
  "2d": 321
}

const test2_0 : testRecord2 = {}

test2_0[2] = "dsfas"

const test2_1 : testRecord2 = test232