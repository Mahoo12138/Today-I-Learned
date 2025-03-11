## exports

它在 Node.js 12+ 中作为 `"main"`的替代方案，它可以支持定义**子路径导出**和**条件导出**，同时使内部未导出的模块有一个很好的封装性。

```json
{ 
	"name": "xxx", 
	"exports": { 
		".": "./index.js" 
	} 
}
```

上述的语法，也有糖，导出语法糖：

```json
{
  "exports": "./index.js"
} 
```

### **子路径导出**

你可以像下面这样定义子路径模块的映射规则：

```json
{
  "exports": {
    ".": "./index.js",
    "./submodule.js": "./src/submodule.js"
  }
}
```

### **条件导出**

条件导出提供了在不同条件下使用不同的模块解析规则的方法，

```js
{
  "exports": {
    ".": {
      // node-addons, node, import 这些 key 表示条件，且都是 node 支持的
      "node-addons": "./c-plus-native.node",
      "node": "./can-be-esm-or-cjs.js",
      "import": "./index-module.mjs",
      "require": "./index-require.cjs",
      "default": "./fallback-to-this-pattern.js"
    }
  }
}
```

> 条件导出具有优先级，各个条件的**优先级取决于它声明的顺序**，越前面的越高。


### 自定义条件

社区有很多广泛使用的自定义条件：

- `"types"`
- `"deno"`
- `"browser"`
- `"react-native"`
- `"development"`
- `"production"`

```json
{
  "name": "a-lib",
  "exports": {
    ".": {
      "xxx": "./dist/index.js",
      "require": null,
      "default": null
    }
  }
}
```

如果想让 nodejs 能够处理 `xxx` 条件，你可以在运行 node 指定 `conditions` 参数：

```json
node --conditions=xxx apps/commonjs-app/index.js
```

### **嵌套条件**

```json
{
  "exports": {
    "node": {
      "import": "./feature-node.mjs",
      "require": "./feature-node.cjs"
    },
    "default": "./feature.mjs"
  }
}
```

在 node 环境下，兼容 esmodule 和 commonjs 两种模块导入方式。

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "development": "./src",
        "default": "./dist/es/index.mjs"
      }
    }
  },
  "publishConfig": {
    "exports": {
      ".": {
        "import": "./dist/es/index.mjs"
      }
    }
  }
}
```

开发环境使用使用自定义条件`development`引用 src 下的源码，因此修改源码也能热更新。当发布出去时我们不需要保留 `development` 这个条件，可使用 `publishConfig` 配置来在 `npm publish` 时覆盖 `exports` 配置。
