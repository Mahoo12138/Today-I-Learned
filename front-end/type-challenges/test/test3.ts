type AAA = {
  A: "aaa"
}


type BBB = {
  B: "bbb"
  A: "ccc"
}


type CCC = AAA & BBB;

// const c : CCC = {
//   A: "aaa",
//   B: "bbb"
// }

type AAAA = {
  A: string
}


type BBBB = {
  B: "bbb"
  readonly A: string
}


type CCCC = AAAA & BBBB;
const cccc: CCCC = {
  A: "aaa",
  B: "bbb"
}


cccc.A = "aaa";
cccc.B = "bbb";

type DA = {bar: string} & {readonly bar:string}

const da :DA = {
  bar : "52"
}

da.bar = "dsfds";

function test(x: {theFlag: boolean} & {readonly theFlag: boolean} ){
  x.theFlag = true;
}

type T30 = Pick<{ readonly p: any } | { p: any }, "p">

type T31 = Pick<{ readonly p: any } & { p: any }, "p">


type T32 = {get prop(): string;} & {set prop(v: string)};
function aaa1(a: T32) {
  a.prop = 'aaa';
}

type T33 = {readonly prop: string;} & {prop: string};
function aaa2(a: T33) {
  a.prop = 'aaa';
}