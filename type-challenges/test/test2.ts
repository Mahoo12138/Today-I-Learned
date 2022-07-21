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