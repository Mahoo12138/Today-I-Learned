## Esbuild 初体验

创建一个工程：

```tree
|-- package.json
|-- public
|   `-- index.html
`-- src
    `-- index.js
```

在 `public/index.html` 中引入 js 文件，当然现在还没有该文件，需要使用 esbuild 进行处理：

```html
<script type="module" src="./main.js"></script>
```

安装 esbuild ：

```bash
$ npm install esbuild --save-dev 
```

使用如下命令转译 js 文件，也可以将其写入 package.json 中：

```bash
$ npx esbuild --bundle src/index.js --outfile=www/main.js
```

`--outfile` 参数指定转译后的 js 输入路径，如果不提供将会输出到标准输出流；

## 自动热重载

可使用的方式有两种：

### 检测模式

即使用 esbuild 提供的 `--watch` 选项：

```bash
$ npx esbuild --bundle src/index.js --outfile=www/main.js --watch
```

这样每次代码发生变动，则会立即自动转译了。

### 开发服务器

即使用 esbuild 提供的开发服务器：

```bash
$ esbuild --bundle src/index.js --outfile=www/main.js --servedir=public
```

这样，每次重新加载页面都会触发 esbuild 重新转译。

### 简单技巧

当我们把上述的命令都写到 package.json 中时，可能会像这样：

```json
"build": "esbuild --bundle src/index.js --outfile=www/main.js",
"start": "esbuild --bundle src/index.js --outfile=www/main.js --servedir=www",
"watch": "esbuild --bundle src/index.js --outfile=www/main.js --watch"
```

这样看起来很整齐，实际上太冗余了，完全可以再优化一下：

```json
"build": "esbuild --bundle src/index.js --outfile=www/main.js",
"start": "npm run build -- --servedir=www",
"watch": "npm run build -- --watch"
```

### 完全热重载

需要安装依赖 [esbuild-serve](https://github.com/nativew/esbuild-serve)：

```bash
$ npm install esbuild-serve -D
```

之后根据 esbuild-server [文档](https://github.com/nativew/esbuild-serve#use)，编写 `esbuild.config.js` 配置文件：

```js
#!/usr/bin/env node

import esbuildServe from "esbuild-serve";

esbuildServe(
  {
    logLevel: "info",
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "www/main.js",
  },
  { root: "www" }
);
```

我们有两种方式来运行这个配置文件：

- `node esbuild.config.js`，仅是转译
- `node esbuild.config.js -w`， 开启一个服务

> 如果运行时报错`import esbuildServe from "esbuild-serve";`，
>
> 那么需要在 `package.json`中指明：`"type": "module"`；

如此一来，则可以更新 `package.json` 中的命令了：

```json
"build": "node esbuild.config.js",
"start": "node esbuild.config.js -w"
```

这样就完成了开发是随改随编译的热更新了。

## 处理 CSS

esbuild 可以直接转译 css 文件，如：

```bash
$ esbuild style.css --outfile=out.css --bundle
```

也能处理在 js 引入的 css 文件：

```CSS
/* /src/style.css */
body {
  color: #66f;
}
```

然后在 js 文件中引入

```js
// src/index.js
import "./style.css";

const header = document.createElement("h1");

header.innerHTML = "Hello world";

document.body.appendChild(header);
```

默认情况下，esbuild 会配置对 css 的加载，不过不会打包进入 js 文件；

当我们运行`npm run build` 或使用 `npm run start`运行服务器后，会发现 header 并没有颜色改变；

这是因为样式被打包到了一个与 js 输出的打包文件同名的 css 文件中了，所以我们需要在 html 中引入：

```html
 <link rel="stylesheet" type="text/css" href="./main.css"/>
```

## 处理图片

处理图片，常用两种方案，一是使用 base64 引入，二是直接使用文件链接导入；

在 esbuild 中，导入图片可使用 `import` 语句：

```js
import png_url from './image.png'
import jpg_url from './image.jpg'
```

在转译时，可对每一种扩展名进行不同的处理，例如：

```bash
$ esbuild input_image.js --bundle --loader:.png=dataurl --loader:.jpg=file --outfile=out_image.js
```

## 编写构建脚本

我们能使用一个外部的 js 脚本来处理 esbuild ：

```bash
$ touch build.js
$ chmod +x build.js
```

并在文件顶部标注为使用 node 执行：

```shell
#!/usr/bin/env node
```

之后，我们可以将 `npm run build` 的逻辑简单改写到脚本中：

```js
#!/usr/bin/env node

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "www/main.js",
  })
  .catch(() => process.exit(1));
```

所以在 `package.json` 中也随之简化：

```json
"build": "./build.js"
```

但是，显而易见，这样处理之后，`--watch`这样的参数则不起作用了。

## 生成 SourceMap

只需要在之前的`esbuild.config.js`文件中，开启配置即可：

```js
esbuildServe(
  {
    ...
    outfile: "public/main.js",
+   sourcemap: true,
  },
  { root: "public" }
);
```

重启服务后，在浏览器的开发工具的源代码选项中，则可以看到 `src/index.js`了

## 转译 TypeScript

### 使用命令行

我们新建一个 ts 文件，简单几句代码：

```typescript
// hello.ts
let message: string = "Hello, esbuild!";
function sayHello(hi:string){
  console.log(hi);
}

sayHello(message)
```

然后执行转译命令：

```bash
$ npx esbuild src/hello.ts --outfile=hello.js --bundle --loader:.ts=ts
```

`--loader` 选项用于指定扩展名加载 ts 文件，该选项是可以省略的，esbuild 会基于文件扩展名判断；

`--bundle `用于将所有依赖内联到当前的入口点文件，例如一个 js/ts 文件：

```js
// index.js
import { SayHello } from "./library";

SayHello();
```

然后还有它的依赖：

```js
// library.js
export function SayHello() {
  console.log("Hello, esbuild!");
}
```

如果单纯使用命令打包：`esbuild index.js` ，转译出来的产物是不带依赖的；

### 使用配置文件

配置文件下，可直接选择 ts 文件作为入口点：

```js
import esbuildServe from "esbuild-serve";

esbuildServe(
  {
    logLevel: "info",
    entryPoints: ["src/main.ts"],
    bundle: true,
    sourcemap: true,
    outfile: "public/main.js",
  },
  { root: "public" }
);
```

## 打包 React 项目

简单测试一下，安装依赖：

```bash
$ npm install react react-dom
```

挂载代码：

```jsx
import React from "react";
import ReactDOM from "react-dom";

function App() {
  return (
    <div>Hello, esbuild!</div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

并且在 html 中挂载 root 元素以及引入 打包后的 js ：

```html
<body>
  <div id="root"></div>
  <script src="AppBundle.js"></script>
</body>
```

命令转译：

```bash
$ npx esbuild src/app.js --minify --bundle 
	--outfile=public/AppBundle.js 
	--loader:.js=jsx
	--target=chrome58,firefox57,safari11,edge16
```

`--minify` 选项用于压缩代码，`--target` 选项用于设置浏览器环境，做一些针对性的 polyfills

## 使用插件

esbuild 原生不支持打包 sass 文件，可通过社区插件进行处理；

我们随便选一个来试试：

```bash
$ npm install esbuild-plugin-sass
```

使用 build API 进行转译打包：

```js
const sassPlugin = require("esbuild-plugin-sass");

require("esbuild").build({
  entryPoints: ["style.scss"],
  outfile: "bundle.css",
  bundle: true,
  plugins: [sassPlugin()]
})
.then(() => console.log("⚡ Done"))
.catch(() => process.exit(1));
```

