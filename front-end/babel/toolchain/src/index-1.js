const ast = require("@babel/parser").parse("let a = 1", {
  sourceType: "module",
});

console.log("ast: ", ast)

const parser = require("@babel/parser");

const ast2 = parser.parse(
  `
  const a: number = 1
`,
  {}
);
f;
console.log(ast2);