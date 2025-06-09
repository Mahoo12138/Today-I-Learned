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

## 基本类型

大多数情况下，你所需要做的只是使用 GraphQL schema language 指定你的 API 需要的类型，然后作为参数传给 `buildSchema` 函数；

GraphQL schema language 支持的标量类型有 `String`、`Int`、`Float`、`Boolean` 和 `ID`，因此你可以在传给 `buildSchema` 的 schema 中直接使用这些类型。

默认情况下，每个类型都是可以为空的 —— 意味着所有的标量类型都可以返回 `null`。使用感叹号可以标记一个类型不可为空，如 `String!` 表示非空字符串。

如果是列表类型，使用方括号将对应类型包起来，如 `[Int]` 就表示一个整数列表。

```typescript
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
 
// 使用 GraphQL schema language 构建一个 schema
const schema = buildSchema(`
  type Query {
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
  }
`);
 
// root 将会提供每个 API 入口端点的解析函数
const root = {
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },
  random: () => {
    return Math.random();
  },
  rollThreeDice: () => {
    return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6));
  },
};
 
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');
```

## 传递参数

就像 REST API 一样，在 GraphQL API 中，通常向入口端点传入参数，在 schema language 中定义参数，并自动进行类型检查。每一个参数必须有名字和数据类型。

如我们将上例中的掷骰子改成掷任意个骰子，

```js
type Query {
  rollDice(numDice: Int!, numSides: Int): [Int]
}
```

`Int!` 中的感叹号表示参数 `numDice` 不能为 null ；解析器需要接受参数对象：

```js
var root = {
  rollDice: (args) => {
    var output = [];
    for (var i = 0; i < args.numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
    }
    return output;
  }
};
```

在Web端调用时，代码如下：

```json
{
  rollDice(numDice: 3, numSides: 6)
}
```

在脚本中发起请求时，可以使用字符串模板：

```js
const dice = 3;
const sides = 6;
const query = `query RollDice($dice: Int!, $sides: Int) {
  rollDice(numDice: $dice, numSides: $sides)
}`;
 
fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: { dice, sides },
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));
```

## 对象类型

在 GraphQL schema language 中，定义一个新的对象类型就和我们在示例中定义的 `Query` 类型一样。每个对象可以有返回指定类型的字段，以及带有参数的方法。

例如之前提到的`rollDice`的例子，如果随着时间的推移，我们想要有越来越多的基于随机骰子的方法，我们可以实现一个 `RandomDie` 的**对象类型**来替代：

```js
type RandomDie {
  roll(numRolls: Int!): [Int]
}
 
type Query {
  getDie(numSides: Int): RandomDie
}
```

对于 `RandomDie` 类型的根级别解析器来说，我们可以用 ES6 的 class 语法来替代，这样的话这些解析器就是这个类的实例方法了：

```js
class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }
 
  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }
 
  roll({numRolls}) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}
```

对于那些不使用任何参数的字段来说，你可以使用对象属性或实例方法来表示。对于上面的示例方法，不论是 `numSides` 还是 `rollOnce` 实际上都可以被用来实现 GraphQL 的字段，所以上面的代码同样可以以 schema 的方式来实现：

```js
type RandomDie {
  numSides: Int!
  rollOnce: Int!
  roll(numRolls: Int!): [Int]
}
 
type Query {
  getDie(numSides: Int): RandomDie
}
```

当你对一个返回对象类型的 API 发出 GraphQL 查询时，你可以通过嵌套 GraphQL 字段名来一次性调用对象上的多个方法。例如，如果你想在调用 `rollOnce` 方法掷 1 次骰子的同时也调用 `roll` 方法来掷 3 次骰子的话，你可以这么做：

```javascript
{
  getDie(numSides: 6) {
    rollOnce
    roll(numRolls: 3)
  }
}
```

你可以只用一次请求就能获取到所有信息，而不是一次请求只能获取到一个对象的相关信息，然后还要请求一系列 API 才能获取到其他对象的信息。这样不仅节省了带宽、让你的应用跑得更快，同时也简化了你客户端应用的逻辑。

## 变更和输入类型

用于处理变更数据或插入数据，在 GraphQL 中，你应该将这个入口端点做为 `Mutation` 而不是 `Query`；

假设我们有一个“今日消息”服务器，每个人都可以在上面更新“今日消息”，或者阅读当前的“今日消息”。这个服务器的 GraphQL schema 很简单：

```graphql
type Mutation {
  setMessage(message: String): String
}
 
type Query {
  getMessage: String
}
```

将一个变更（mutation）映射到数据库的 create 或者 update 操作会很方便，如 `setMessage`，其会返回数据库所存的数据。这样一来，你修改了服务端的数据，客户端就能获知这个修改。

不论是变更还是查询，**根级解析器**都能够处理，因此实现 schema 的 root 可以如下：

```javascript
var fakeDatabase = {};
var root = {
  setMessage: ({message}) => {
    fakeDatabase.message = message;
    return message;
  },
  getMessage: () => {
    return fakeDatabase.message;
  }
};
```

通常情况下，你会发现有多个不同的变更接受相同的输入参数。常见的案例是在数据库中创建对象和更新对象的接口通常会接受一样的参数。你可以使用“输入类型”来简化 schema，**使用 `input` 关键字而不是 `type` 关键字即可。**

例如，我们每天有多条而不是一条消息，在数据库中以 `id` 字段为索引，每条消息都有一个 `content` 和 `author` 字符串。我们需要一个变更 API，用于创建新消息和更新旧消息。我们可以使用这个 schema：

```graphql
input MessageInput {
  content: String
  author: String
}
 
type Message {
  id: ID!
  content: String
  author: String
}
 
type Query {
  getMessage(id: ID!): Message
}
 
type Mutation {
  createMessage(input: MessageInput): Message
  updateMessage(id: ID!, input: MessageInput): Message
}
```

此处的变更返回一个 `Message` 类型，因此客户端通过变更的请求就能获取到新修改的 `Message` 的信息。

**输入类型的字段不能是其他对象类型，只能是基础标量类型、列表类型或者其他输入类型。**

一个有用的惯例是在 schema 的末尾使用 `Input` 命名输入类型，因为对于单一概念对象，通常你想要输入和输出类型之间只有略微不同。

你必须在你的 GraphQL 查询前面使用关键字 `mutation` 才能调用变更，并将数据作为 JSON 对象以传入输入类型。如果用上面定义的服务器，你可以使用以下操作创建一条消息并返回这条消息的 `id`：

```graphql
mutation {
    createMessage(input: {
        author: "andy",
        content: "hope is a good thing",
	}) {
		id
	}
}
```

## 认证和 Express 中间件

Express 中间件可以很方便地结合 `express-graphql` 使用，这也是一个良好的认证处理模式。

你可以就像普通 Express 应用使用中间件一样把中间件和 GraphQL 解析器一起使用。然后 `request` 对象就会作为解析函数的第三参数传入；

举个例子，假设我们想要服务器记录每个请求的 IP 地址，并编写一个返回调用者 IP 地址的 API。前者我们通过中间件完成，后者在解析器中取 `request` 对象即可。下面是实现这个功能的服务端代码：

```typescript
import express, { Request, Response, NextFunction } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Query {
    ip: String
  }
`);

const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('ip:', req.ip);
  next();
}

const root = {
  ip: function (args: any, request: Request) {
    return request.ip;
  }
};

const app = express();
app.use(loggingMiddleware);
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
```

**在 REST API 中，认证通常是借由 header 处理的**，其中包含一个 auth token 用于识别发出请求的用户。

Express 中间件会处理这些 header，并将认证数据放进 Express 的 `request` 对象。像这样处理认证的中间件模块有 [Passport](http://passportjs.org/)、 [express-jwt](https://github.com/auth0/express-jwt) 和 [express-session](https://github.com/expressjs/session)。这些模块每一个都能配合 `express-graphql` 使用。

