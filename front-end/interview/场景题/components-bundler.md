---
title: 业务组件库打包
---
# 如果你有一个业务组件库，希望打包输出为 esm + cjs + dts，有什么思路？

## 面试官考察点

|考察维度|说明|
|---|---|
|**模块化理解**|是否清楚 ESM（ES Modules）和 CJS（CommonJS）的区别与用途|
|**打包工具认知**|是否了解 Rollup、Vite、tsup、ESBuild 等构建工具的能力与适配性|
|**工程实践经验**|是否做过组件库或 SDK 的发布，有无处理 `d.ts`、多格式输出的经验|
|**解决方案的合理性**|是否能兼顾开发体验、构建效率与产物质量（tree-shaking、类型提示）|
## 示例回答

> “对于组件库打包的场景，我通常会使用 `Rollup` 配置多入口模式，自动遍历组件目录，为每个组件输出 ESM + CJS + d.ts 三种格式，同时配置自动生成 `package.json` 的 `exports` 和 `typesVersions`，实现按需导入和良好的类型提示支持。这样既能保持组件解耦，确保现代工具链友好，也方便消费端 tree-shaking。”

### tsup.config.ts

```ts
import { defineConfig } from 'tsup';
import { readdirSync } from 'fs';
import { join } from 'path';

// 动态读取 src 下所有组件目录
const components = readdirSync('src', { withFileTypes: true })
  .filter(f => f.isDirectory())
  .map(dir => `src/${dir.name}/index.tsx`);

export default defineConfig({
  entry: components, // 多组件入口
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  splitting: false, // 每个组件是独立的，不需要 chunk 拆分
});
```

### package.json

```json
{
  "name": "my-component-lib",
  "exports": {
    "./button": {
      "import": "./dist/button/index.js",
      "require": "./dist/button/index.cjs"
    },
    "./input": {
      "import": "./dist/input/index.js",
      "require": "./dist/input/index.cjs"
    }
  },
  "typesVersions": {
    "*": {
      "button": ["dist/button/index.d.ts"],
      "input": ["dist/input/index.d.ts"]
    }
  }
}
```

## 关键点

| 关注点                    | 描述                                        |
| ------------------------- | ------------------------------------------- |
| 多入口支持                | 每个组件独立打包，提升 tree-shaking 友好性  |
| 类型文件输出              | `index.d.ts` 放在每个组件目录中             |
| package.json exports 配置 | 按组件声明 ESM / CJS / 类型入口             |
| 可维护性                  | 使用文件系统动态生成入口，避免手写          |
| 可选全量导入入口          | `src/index.ts` 聚合所有组件用于完整引入场景 |

