const parser = require("@babel/parser");
const generator = require("@babel/generator");

const ast = parser.parse(`
  const a = 1
`);

const output = generator.default(ast, {});

console.log(output)