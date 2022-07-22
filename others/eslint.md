## 前言

### lint 工具简史

> 在计算机科学中，lint是一种工具的名称，它用来标记代码中，某些可疑的、不具结构性（可能造成bug）的语句。它是一种静态程序分析工具，最早适用于C语言，在UNIX平台上开发出来。后来它成为通用术语，可用于描述在任何一种编程语言中，用来标记代码中有疑义语句的工具。— by wikipedia

在 JavaScript 20 多年的发展历程中，也出现过许许多多的 lint 工具，文章介绍主流的三款 lint 工具：JSLint，JSHint，ESLint；

JSLint 可以说是**最早出现**的 JavaScript 的 lint 工具，由 Douglas Crockford (《JavaScript 语言精粹》作者) 开发。从《JavaScript 语言精粹》的笔风就能看出，Douglas 是个眼里容不得瑕疵的人，所以 JSLint 也继承了这个特色，JSLint 的所有规则都是由 Douglas 自己定义的，可以说这是一个**极具 Douglas 个人风格**的 lint 工具，如果你要使用它，就必须接受它所有规则。值得称赞的是，JSLint **依然在更新**，而且也提供了 node 版本：node-jslint。

由于 JSLint 让很多人无法忍受它的规则，感觉受到了压迫，所以 Anton Kovalyov (现在在 Medium 工作) **基于 JSLint** 开发了 JSHint。JSHint 在 JSLint 的基础上**提供了丰富的配置项**，给了开发者极大的自由，JSHint 一开始就保持着开源软件的风格，由**社区进行驱动**，发展十分迅速。早期 jQuery 也是使用 JSHint 进行代码检查的，不过现在已经转移到 ESLint 了。

ESLint 由 Nicholas C. Zakas (《JavaScript 高级程序设计》作者) 于2013年6月创建，它的出现因为 Zakas 想使用 JSHint 添加一条**自定义的规则**，但是发现 JSHint 不支持，于是自己开发了一个。

ESLint 号称下一代的 JS Linter 工具，它的**灵感来源于 PHP Linter**，**将源代码解析成 AST**，然后检测 AST 来判断代码是否符合规则。ESLint 使用 esprima 将源代码解析成 AST，然后就可以使用任意规则来检测 AST 是否符合预期，这也是 ESLint **高可扩展性**的原因。

但是，那个时候 ESLint 并没有大火，因为需要将源代码转成 AST，**运行速度上输给了 JSHint** ，并且 JSHint 当时已经有完善的生态（编辑器的支持）。真正让 ESLint 大火是因为 ES6 的出现。

ES6 发布后，因为**新增了很多语法**，JSHint 短期内无法提供支持，而 ESLint 只需要有合适的解析器就能够进行 lint 检查。这时 **babel 为 ESLint 提供了支持**，开发了 *babel-eslint*，让 ESLint 成为最快支持 ES6 语法的 lint 工具。

在 2016 年，ESLint整合了与它同时诞生的另一个 lint 工具：JSCS，因为它与 ESLint 具有异曲同工之妙，都是通过生成 AST 的方式进行规则检测。

自此，ESLint 在 JS Linter 领域一统江湖，成为前端界的主流工具。

### lint 工具的意义

Lint 工具对工程师来说到底是代码质量的保证还是一种束缚？

以下是 ESLint 官网给出的答案：

> 代码检查是一种静态的分析，常用于寻找有问题的模式或者代码，并且不依赖于具体的编码风格。对大多数编程语言来说都会有代码检查，一般来说编译程序会内置检查工具。
>
> JavaScript 是一个动态的弱类型语言，在开发中比较容易出错。因为没有编译程序，为了寻找 JavaScript 代码错误通常需要在执行过程中不断调试。像 ESLint 这样的可以让程序员在编码的过程中发现问题而不是在执行的过程中。
>

再引用一下 ESLint 官网的介绍。

> 「Find Problems」：ESLint statically analyzes your code to quickly find problems. ESLint is built into most text editors and you can run ESLint as part of your continuous integration pipeline.
> 「Fix Automatically」：Many problems ESLint finds can be automatically fixed. ESLint fixes are syntax-aware so you won't experience errors introduced by traditional find-and-replace algorithms.
> 「Customize」：Preprocess code, use custom parsers, and write your own rules that work alongside ESLint's built-in rules. You can customize ESLint to work exactly the way you need it for your project.

也就是三部分：「**找出代码问题**」，「**自动修复**」，「**自定义规则**」。于此可可以归纳 Lint 工具的优势：

+ 避免低级 bug，找出可能发生的语法错误。使用未声明变量、修改 const 变量……

+ 提示删除多余的代码。声明而未使用的变量、重复的 case ……

+ 确保代码遵循最佳实践。可参考 airbnb style、javascript standard

+ 统一团队的代码风格。加不加分号？使用 tab 还是空格？

ESLint 经过许多年的发展已经非常成熟，加上社区诸多开发者的不断贡献，目前社区也已经积累了许多优秀的代码写法约定，为了项目代码的健康，也为了开发人员的身心健康，尽早地引入合适的 ESLint 规则是非常有必要的。

## ESLint 使用

### 初始化

在现有的项目中引入 ESLint ，可运行如下几个命令：

```bash
# 全局安装 ESLint
$ npm install -g eslint
# 进入项目
$ cd ~/eslint-demo
# 初始化 ESLint 配置
$ eslint --init  
# 或者直接使用快捷指令
$ npm init @eslint/config
```

在命令执行后，会出现很多用户配置项，具体可以参考：eslint cli 部分的源码；经过一系列一问一答的环节后，你会发现在你文件夹的根目录生成了一个 `.eslintrc.js` 文件，即 ESLint 的配置文件；

### 配置方式

**0. 在命令行中进行规则配置**

严格来看，这并不算对规则进行了配置，而是一种测试，可以快速测试某个或某一些规则的效果：

```bash
$ eslint src --rule "{eqeqeq: off}"
```

**1. 使用注释把 lint 规则直接嵌入到源代码中**

这是最简单粗暴的方式，直接在源代码中使用 ESLint 能够识别的注释方式，进行 lint 规则的定义：

```js
/* eslint eqeqeq: "error" */
var num = 1
num == '1'
```

如上，则是定义了一个规则 `eqeqeq`，该规则要求使用 === 和 !== ：

```bash
$ eslint src

D:\Code\eslint-demo\src\index.js
  5:5  error  Expected '===' and instead saw '=='  eqeqeq     

✖ 1 problem (1 error, 0 warnings)
```

当然我们一般使用注释是为了临时禁止某些严格的 lint 规则出现的警告：

```js
alert('该注释放在文件顶部，整个文件都不会出现 lint 警告')	/* eslint-disable */
alert('重新启用 lint 告警')		/* eslint-enable */
alert('只禁止某一个或多个规则')	 /* eslint-disable eqeqeq */
alert('当前行禁止 lint 警告')      /* eslint-disable-next-line */
alert('当前行禁止 lint 警告') 	    // eslint-disable-line
```

**2. 使用配置文件进行 lint 规则配置**

即使用我们之前在项目中初始化 ESLint 时生成的配置文件；在初始化时，有一个选项就是选择何种文件类型进行 lint 配置，官方一共提供了三个选项：

1. JavaScript (.eslintrc.js)
2. YAML (eslintrc.yaml)
3. JSON (eslintrc.json)

此外，也还可以自己在 **package.json** 文件中添加 `eslintConfig` 字段进行配置；并具有不同的优先级：

```
.eslintrc.js > .eslintrc.yaml  > .eslintrc.yml > .eslintrc.json > .eslintrc > package.json
```

也还有可以通过命令行参数`-c` 指定配置文件路径：

```bash
$ eslint -c ./.eslintrc.js src
```

### 项目级与目录级的配置

例如，项目中有如下的目录结构：

```
|-- package.json
|-- src
|   |-- .eslintrc.js
|   `-- index.js
`-- .eslintrc.js
```

此时，有两个配置文件 **.eslintrc.js**（项目级配置） 和 **src/.eslintrc.js**（目录级配置），这两个配置文件会进行合并，但是 src/.eslintrc.js 具有更高的优先级。

不过，我们只要在 src/.eslintrc.js 中配置 “root”: true，那么 ESLint 就会认为 src 目录为根目录，不再向上查找配置：

```json
{ "root": true }
```

### 配置参数

#### 解析器配置

```json
{
    // 解析器类型
    // espima(默认), babel-eslint, @typescript-eslint/parse
    "parse": "esprima",
    // 解析器配置参数
    "parseOptions": {
        // 代码类型：script(默认), module
        "sourceType": "script",
        // es 版本号，默认为 5，也可以是用年份，比如 2015 (同 6)
        "ecamVersion": 6,
        // es 特性配置
        "ecmaFeatures": {
            "globalReturn": true, // 允许在全局作用域下使用 return 语句
            "impliedStrict": true, // 启用全局 strict mode
            "jsx": true // 启用 JSX
        },
    }
}
```

对于 `@typescript-eslint/parse` 这个解析器，主要是为了替代之前存在的 TSLint，TS 团队因为 ESLint 生态的繁荣，且 ESLint 具有更多的配置项，不得不抛弃 TSLint 转而实现一个 ESLint 的解析器。同时，该解析器拥有不同的[配置](https://www.npmjs.com/package/@typescript-eslint/parser#configuration)：

```json
{
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "useJSXTextNode": true,
        "project": "./tsconfig.json",
        "tsconfigRootDir": "../../",
        "extraFileExtensions": [".vue"]
    }
}
```

#### 环境与全局变量

ESLint 会检测未声明的变量，并发出警告，但是有些变量是我们引入的库声明的，这里就需要提前在配置中声明。

```json
{
    "globals": {
        // 声明 jQuery 对象为全局变量
        "$": false // true 表示该变量为 writeable，而 false 表示 readonly
    }
}
```

在 `globals` 中一个个的进行声明未免有点繁琐，这个时候就需要使用到 `env` ，这是对一个环境定义的一组全局变量的预设（类似于 babel 的 presets）。

```json
{
    "env": {
        "amd": true,
        "commonjs": true,
        "jquery": true
    }
}
```

可选的环境很多，预设值都在这个文件中进行定义，查看源码可以发现，其预设变量都引用自 globals 包。

#### 规则设置

ESLint 附带有大量的规则，你可以在配置文件的 rules 属性中配置你想要的规则。每一条规则接受一个参数，参数的值如下：

+ “off” 或 0：关闭规则

+ “warn” 或 1：开启规则，warn 级别的错误 (不会导致程序退出)

+ “error” 或 2：开启规则，error级别的错误(当被触发的时候，程序会退出)

事情往往没有我们想象中那么简单，ESLint 的规则不仅只有关闭和开启这么简单，**每一条规则还有自己的配置项**。如果需要对某个规则进行配置，就**需要使用数组形式的参数**。

我们以 quotes 规则为例，对照[中文官网文档](http://eslint.cn/docs/rules/quotes)，该规则有两个选项，一个是字符串，一个是对象：

+ 字符串选项：

  + "double" (默认) 要求尽可能地使用双引号

  + "single" 要求尽可能地使用单引号

  + "backtick" 要求尽可能地使用反勾号

+ 对象选项：

  + "avoidEscape": true 允许字符串使用单引号或双引号，只要字符串中包含了一个其它引号，否则需要转义

  + "allowTemplateLiterals": true 允许字符串使用反勾号

```json
{
    "rules": {
        // 使用数组形式，对规则进行配置
        // 第一个参数为是否启用规则
        // 后面的参数才是规则的配置项
        "quotes": [
            "error",
            "single",
            {
                "avoidEscape": true 
            }
        ]
    }
}
```

#### 扩展

扩展就是直接使用别人已经写好的 lint 规则，方便快捷。扩展一般支持三种类型：

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "eslint-config-standard",
  ]
}
```

+ **eslint**： 开头的是 ESLint 官方的扩展，一共有两个：`eslint:recommended` 、`eslint:all`。
+ **plugin**：开头的是扩展是插件类型，也可以直接在 `plugins` 属性中进行设置，后面一节会详细讲到。

+ 最后一种扩展来自 npm 包，官方规定 npm 包的扩展必须以 `eslint-config-`开头，使用时可以省略这个头，上面案例中 `eslint-config-standard` 可以直接简写成 standard。

如果你觉得自己的配置十分满意，也可以将自己的 lint 配置发布到 npm 包，只要将包名命名为 `eslint-config-xxx` 即可，同时，需要在 package.json 的 `peerDependencies` 字段中声明你依赖的 ESLint 的版本号。

### 插件

#### 使用插件

虽然官方提供了上百种的规则可供选择，但是这还不够，因为官方的规则只能检查标准的 JavaScript 语法，如果你写的是 JSX 或者 Vue 单文件组件，ESLint 的规则就开始束手无策了。

这个时候就需要安装 ESLint 的插件，来定制一些特定的规则进行检查。ESLint 的插件与扩展一样有固定的命名格式，以 `eslint-plugin-` 开头，使用的时候也可以省略这个前缀。

```bash
$ npm install --save-dev eslint-plugin-vue eslint-plugin-react
```

```json
{
  "plugins": [
    "react", // eslint-plugin-react
    "vue",   // eslint-plugin-vue
  ]
}
```

或者是在扩展中引入插件，前面有提到 `plugin:` 开头的是扩展是进行插件的加载。

```json
{
  "extends": [
    "plugin:react/recommended",
  ]
}
```

通过扩展的方式加载插件的规则如下：

```js
extPlugin = `plugin:${pluginName}/${configName}`
```

对照上面的案例，插件名(pluginName) 为 react，也就是之前安装 `eslint-plugin-react` 包，配置名(configName)为 `recommended`。那么这个配置名又是从哪里来的呢？

可以看到 `eslint-plugin-react` 的源码。

```js
module.exports = {
  // 自定义的 rule
  rules: allRules,
  // 可用的扩展
  configs: {
    // plugin:react/recommended
    recomended: {
      plugins: [ 'react' ]
      rules: {...}
    },
    // plugin:react/all
    all: {
      plugins: [ 'react' ]
      rules: {...}
    }
  }
}
```

配置名是插件配置的 `configs` 属性定义的，**这里的配置其实就是 ESLint 的扩展**，通过这种方式即可以加载插件，又可以加载扩展。

#### 开发插件

ESLint 官方为了方便开发者，提供了 Yeoman 的模板（generator-eslint）。

```bash
# 安装模块
$ npm install -g yo generator-eslint

# 创建目录
$ mkdir eslint-plugin-demo
$ cd eslint-plugin-demo

# 创建模板
$ yo eslint:plugin
```

创建好项目之后，就可以开始创建一条规则了，幸运的是 generator-eslint 除了能够生成插件的模板代码外，还具有创建规则的模板代码。

打开之前创建的 `eslint-plugin-demo` 文件夹，在该目录下添加一条规则，我希望这条规则能检测出我的代码里面是否有 console ，所以，我给该规则命名为 *disable-console*。

```bash
$ yo eslint:rule
```

接下来我们看看如何来指定 ESLinte 的一个规则；打开 `lib/rules/disable-console.js` ，可以看到默认的模板代码如下：

```js
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "disable console",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    // any helper functions should go here or else delete this section
    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      // visitor functions for different types of nodes
    };
  },
};
```

简单的介绍下其中的参数（更详细的介绍可以查看[官方文档](http://eslint.cn/docs/developer-guide/working-with-rules)）：

+ **meta**：规则的一些描述元信息：

  + **type (string)** 指示规则的类型，值为 "problem"、"suggestion" 或 "layout"；

  + **docs (object)** ：规则核心的描述对象：
    + descrition(string)：规则的简短描述
    + category(string)：规则的类别，具体类别[参考文档](http://eslint.cn/docs/rules/)
    + recommended(boolean)：配置文件中是否加入 `eslint:recommended`
  + **schema(array)**：规则所接受的[配置项](http://eslint.cn/docs/developer-guide/working-with-rules#options-schemas)
  + **fixable**：如果规则不是可修复的，就省略 fixable 属性，否则需要实现 `fix`功能

+ **create**：返回一个对象，该对象包含 ESLint 在遍历 JavaScript 代码 AST 时，所触发的一系列事件勾子。

ESLint 使用了一个叫做 [Espree](https://github.com/eslint/espree) 的 JavaScript 解析器来把 JavaScript 代码解析为一个 AST 。然后深度遍历 AST，每条规则都会对匹配的过程进行监听，每当匹配到一个类型，相应的规则就会进行检查。

[astexplorer](https://astexplorer.net/) 是一个工具网站，能十分清晰的查看一段代码解析成 AST 之后的样子；如果你想找到所有 AST 节点的类型，可以查看 espree。

当我们在左侧的代码输入框中键入`console.log("hello world")`时，可以看到` console.log()` 属于 **ExpressionStatement**(表达式语句) 中的 **CallExpression**(调用语句)。

```json
{
    "type": "ExpressionStatement",
    "expression": {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "Identifier",
                "name": "console"
            },
            "property": {
                "type": "Identifier",
                "name": "log"
            },
            "computed": false
        },
        "arguments": [
                {
                  "type": "Literal",
                  "value": "hello world",
                  "raw": "\"hello world\""
                }
              ]
    }
}
```

所以，我们要判断代码中是否调用了 console，可以在 `create` 方法返回的对象中，**写一个 CallExpression 方法**，在 ESLint 遍历 AST 的过程中，**对调用语句进行监听**，然后检查该调用语句是否为 console 调用。

```js
module.exports = {
  create: function(context) {
    return {
      CallExpression(node) {
        // 获取调用语句的调用对象
        const callObj = node.callee.object
        if (!callObj) {
          return
        }
        if (callObj.name === 'console') {
          // 如果调用对象为 console，通知 ESLint
          context.report({
            node,
            message: 'error: should remove console'
          })
        }
      },
    }
  }
}
```

可以看到我们最后通过 `context.report` 方法，告诉 ESLint 这是一段有问题的代码，具体要怎么处理，就要看 ESLint 配置中，该条规则是 [off, warn, error] 中的哪一个了。

之前介绍规则的时候，有讲到规则是可以接受配置的，下面看看我们自己制定规则的时候，要如何接受配置项。

其实很简单，只需要在 `meta` 对象的 `schema` 中定义好参数的类型，然后在 `create` 方法中，通过 `context.options` 获取即可。

下面对 disable-console 进行修改，毕竟禁止所有的 console 太过严格，我们可以添加一个参数，该参数是一个数组，表示允许调用的 console 方法。

```js
module.exports = {
  meta: {
    docs: {
      description: "disable console", // 规则描述
      category: "Possible Errors",    // 规则类别
      recommended: false
    },
    schema: [ // 接受一个参数
      {
        type: 'array', // 接受参数类型为数组
        items: {
          type: 'string' // 数组的每一项为一个字符串
        }
      }
    ]
  },

  create: function(context) {
    const logs = [ // console 的所以方法
        "debug", "error", "info", "log", "warn", 
        "dir", "dirxml", "table", "trace", 
        "group", "groupCollapsed", "groupEnd", 
        "clear", "count", "countReset", "assert", 
        "profile", "profileEnd", 
        "time", "timeLog", "timeEnd", "timeStamp", 
        "context", "memory"
    ]
    return {
      CallExpression(node) {
         // 接受的参数
        const allowLogs = context.options[0]
        const disableLogs = Array.isArray(allowLogs)
          // 过滤掉允许调用的方法
          ? logs.filter(log => !allowLogs.includes(log))
          : logs
        const callObj = node.callee.object
        const callProp = node.callee.property
        if (!callObj || !callProp) {
          return
        }
        if (callObj.name !== 'console') {
          return
        }
        // 检测掉不允许调用的 console 方法
        if (disableLogs.includes(callProp.name)) {
          context.report({
            node,
            message: 'error: should remove console'
          })
        }
      },
    }
  }
}
```

规则写完之后，打开 `tests/rules/disable-console.js` ，编写测试用例：

```js
const ruleTester = new RuleTester();
ruleTester.run("disable-console", rule, {
  valid: [{
    code: "console.info(test)",
    options: [['info']]
  }],

  invalid: [
    {
      code: "console.log()",
      errors: [{ message: "error: should remove console" }],
    },
  ],
});
```

之后使用命令 `npm test`，运行测试用例；最后，只需要引入插件，然后开启规则即可：

```js
// eslintrc.js
module.exports = {
  plugins: [ 'demo' ],
  rules: {
    'demo/disable-console': [
      'error', [ 'info' ]
    ],
  }
}
```

> 这里插一点相关的，当前我们的插件还未发布到 npm 仓库，可以在 `eslint-plugin-demo` 路径下使用 `npm link`，接着再到之前的项目 `eslint-demo`路径下执行 `npm link eslint-plugin-demo`，即可连接到一起了；

最后是测试一下是否正常使用：

```js
// console.js
console.log('');
console.info('');
```

```bash
$ eslint ./src/console.js

D:\Code\eslint-demo\src\console.js
  1:1  error  error: should remove console  demo/disable-console

✖ 1 problem (1 error, 0 warnings)
```

### 最佳配置

业界有许多 JavaScript 的推荐编码规范，较为出名的就是下面两个：

+ [airbnb style](https://github.com/airbnb/javascript)
+ [javascript standard](https://github.com/standard/standard)

同时这里也推荐 AlloyTeam 的 [eslint-config-alloy](https://github.com/AlloyTeam/eslint-config-alloy)。

但是代码规范这个东西，最好是团队成员之间一起来制定，确保大家都能够接受，如果实在是有人有异议，就只能少数服从多数了。虽然这节的标题叫最佳配置，但是软件行业并有没有什么方案是最佳方案，即使 javascript standard 也不是 javascript 标准的编码规范，它仅仅只是叫这个名字而已，只有适合的才是最好的。

最后安利一下，**将 ESLint 和 Prettier 结合使用**，不仅统一编码规范，也能统一代码风格。

## ESLint 工作原理

ESLint 使用 espree 生成 AST 的，对其进行遍历，然后在遍历到「不同的节点」或者「特定的时机」的时候，触发相应的处理函数，然后在函数中，可以抛出错误，给出提示。

### 读取配置


