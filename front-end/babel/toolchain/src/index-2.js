const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const code = `function square(n) {
  return n * n;
}`;

const ast = parser.parse(code);

traverse(ast, {
  enter(path) {
    if (path.isIdentifier({ name: "n" })) {
      path.node.name = "x";
    }
  },
});



const code2 = `// 变量v1
let v1 = 1;
function fn() {
  // 变量v2
  let v2 = 2;
  console.log(v2);
}

fn();`;

const ast2 = parser.parse(code2);

traverse(ast2, {
  Identifier(path) {
    if (path.node.name === "v2") {
      console.log(path.scope)
      console.log(path.scope.parent)
    }
  },
});