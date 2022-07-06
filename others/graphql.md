## GraphQL.js 入门

### 脚本中运行

```typescript
import { graphql, buildSchema } from 'graphql';
 
// 使用 GraphQL schema language 构建一个 schema
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);
 
// 根节点为每个 API 入口端点提供一个 resolver 函数
const root = {
  hello: () => {
    return 'Hello world!';
  },
};
 
// 运行 GraphQL query '{ hello }' ，输出响应
graphql({schema, source: '{ hello }', rootValue: root}).then((response) => {
  console.log(JSON.stringify(response));
});
```
### 服务端中运行

```typescript
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
 
// 使用 GraphQL Schema Language 创建一个 schema
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);
 
// root 提供所有 API 入口端点相应的解析器函数
var root = {
  hello: () => {
    return 'Hello world!';
  },
};
 
var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
```
服务器启动后，会跳转到一个web页面，向左侧中 GraphQL 中查询 `{ hello }`，返回结果为 `{ data: { hello: 'Hello world!' } }`；

### 客户端中运行
```bash
curl -X POST \
-H "Content-Type: application/json" \
-d '{"query": "{ hello }"}' \
http://localhost:4000/graphql
```

案例中的查询是硬编码的字符串。一旦你的应用变得复杂，你添加了像**传递参数**中描述的那种接收参数的 GraphQL 入口端点，就会想在客户端代码中使用参数构建 GraphQL 查询。你可以在查询中包含一个以$开头的关键字，并传递额外的 variables 字段给载荷来完成这个。