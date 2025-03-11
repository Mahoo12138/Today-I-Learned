## moduleResolution

**模块解析策略**（ moduleResolution）描述了当前项目对于模块，包括相对路径以及非相对路径（也就是第三方库，亦或者说 npm 包）是按照怎样的规则去查找的。

### classic

TypeScript 1.6 版本前使用的方式，举个例子就很好理解，例如对于下面这个导入第三方依赖 `pkg` 的代码：

```typescript
/* /root/src/folder/index.js */
import 'pkg';
```

会经历下面的步骤来查找 `pkg`:

1. `/root/src/folder/pkg.js`
2. `/root/src/pkg.js`
3. `/root/pkg.js`
4. `/pkg.js`

简单来说这种模块解析策略就是一直递归往上找同名文件，当前目录找不到同名文件就往父级目录找。官方文档已经不推荐使用了。

### node

现在被称为 `'node10'`，是 node.js V10 的解析模块的策略，即 `require.resolve` 实现。

对于下面这段 nodejs 代码：

```javascript
/* /root/src/index.js */
require('pkg');`
```

会按照下面的步骤来查找 `pkg`：

1. 同级目录的 `node_modules` 找同名的 js 文件： `/root/src/node_modules/pkg.js`
2. 同级目录 `node_modules` 里面找包含 `package.json` 的名为 `pkg` 文件夹：`/root/src/node_modules/pkg/package.json`
	1. `package.json` 不存在，则查找当前路径下的 `index.js`；
	2. 存在，读取 `package.json` 中的 `"main"` 字段；
	3. `"main"` 指定的是模块的入口文件（相对于 `package.json` 所在目录）；
	4. 如果 `"main"` 为空或无效，默认查找 `index.js`；
	5. 如果 `"main"` 指定的是目录，则会继续解析该目录下的 `index.js`
3. 还是找不到的话，那就往上一级目录重复前面的查找步骤
4. `/root/node_modules/pkg.js`
5. `/root/node_modules/pkg/package.json`
6. `/root/node_modules/pkg/index.js`

完整的 nodejs 解析策略可以看官方文档：[Modules: CommonJS modules | Node.js v23.9.0 Documentation](https://nodejs.org/api/modules.html#all-together)。


### node16

`node16` 的主要区别在于 **对 ECMAScript Modules (ESM) 的支持**，尤其是 **package.json 的 `"exports"` 字段、文件扩展名解析、`package.json` 的 `"type"` 字段等**。

`nodenext` 模块解析策略严格按照最新的 `nodejs` 模块解析算法判断一个 ts 文件是 `commonjs` 模块还是 esm 模块：

+ 最近的 `package.json` 设置了 `"type": "module"`
+ 扩展名是 `.mjs`

这就导致了两个问题：

1. 相对路径需要要扩展名
2. 写类型要写两套

### bundler

TypeScript5.0 新增的一个模块解析策略，它的出现解决的最大痛点就是：可以让你使用 `exports` 声明类型的同时，**使用相对路径模块可以不写扩展名**。

上述的模块策略存在很多不足：

- node：不支持 `exports`
- `node16` / `nodenext`: 强制要求使用相对路径模块时必须写扩展名