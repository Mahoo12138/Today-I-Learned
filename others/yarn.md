# Yarn 工作区系统性学习

Yarn Workspaces（工作空间/工作区，本文使用工作空间这一名称）是 Yarn 提供的`Monorepo`依赖管理机制，从Yarn 1.0开始默认支持，用于在代码仓库的**根目录**下管理**多个project**的依赖。
 Yarn Workspaces的目标是使使用[Monorepo](**Monorepository**)变得简单，以一种更具声明性的方式处理`yarn link`的主要使用场景。

简而言之，它们允许多个项目共存在同一个代码库中，并相互**交叉引用**，并且保证一个项目源代码的任何修改都会立即应用到其他项目中。

Menorepo的优点是可以在一个仓库里维护多个 package，可统一构建，跨 package 调试、依赖管理、版本发布都十分方便，搭配工具还能统一生成 CHANGELOG；

代价是即使只开发其中一个package也需要安装整个项目的依赖。以[jest](**jest**)为例，其Monorepo代码结构为：

```js
| jest/
| ---- package.json
| ---- packages/
| -------- babel-jest/
| ------------ package.json
| -------- babel-plugin-jest-hoist/
| ------------ package.json
| -------- babel-preset-jest/
| ------------ package.json
| -------- .../
```

> Your dependencies can be linked together, which means that your workspaces can depend on one another while always using the most up-to-date code available. This is also a better mechanism than `yarn link` since it only affects your workspace tree rather than your whole system. 
>
> 工作区内的依赖关系可以链接在一起，这意味着工作区可以相互依赖，同时始终使用最新的可用代码。这也是一个相对于`yarn link`更好的机制，因为它只影响你的工作空间树，而不是整个系统。
>
> All your project dependencies will be installed together, giving Yarn more latitude to better optimize them.
>
>  所有的项目依赖关系都将被安装在一起，为Yarn提供更多的自由度来更好地优化它们。
>
> Yarn will use a single lockfile rather than a different one for each project, which means fewer conflicts and easier reviews. 
>
> 对于每个项目，Yarn将使用一个公共的的锁文件而不是为每个工程使用一个不同的锁文件，这意味着更少的冲突和更容易的版本审查。

## Yarn Workspaces 配置

```json
{
  "private": true,
  "workspaces": ["app1", "app2"] 
   // 具名 Workspace, 名字任意，但需跟子项目中 package.json 中 name 属性值一致
}
// 当Workspace很多时，也可以采用全目录引用的方式
// 假设项目代码在projects目录下
{
  "private": true,
  "workspaces": ["projects/*"]
}
```

> Note that the private: true is required! Workspaces are not meant to be published, so we’ve added this safety measure to make sure that nothing can accidentally expose them.
>  注意：`private: true`配置是必需的！工作区并不意味着要被发布，所以需要添加了这个安全措施，以确保不会发布到npm仓库。

+ 使用`yarn workspaces info [--json]`命令可以获得整个workspace的目录结构；
+ `yarn install` 命令既可以在 workspace-root 目录下执行，也可以在任何一个 workspace 目录下执行，效果是一样的；
+ 工作区目录下的 node_modules 目录不是必然存在的，只有在依赖了不同版本的同一个依赖或者存在自己的特有依赖时才会出现；
+ `workspaceDependencies`列出了该 workspace 依赖的其他 workspace；

## Yarn Workspaces 常用CLI

在指定的 workspace 下执行 command，即 command 作用域为某个 workspace：

```bash
yarn workspace <workspace_name> <command>

# 为 app1 安装 react
yarn workspace app1 add react --save
# 执行 app1 中的 start 脚本
yarn workspace app1 run start
# 在 app1 中，将工作区 app2 作为依赖安装 (link
yarn workspace app1 add app2@1.0.0
```

将在每个工作区中运行所选择的 Yarn 命令，即遍历所有 workspace 执行 command 命令：

```bash
yarn workspaces run <command>

# 在所有workspace中执行yarn start命令
yarn workspaces run start
# 在所有workspace中执行yarn test命令
yarn workspaces run test
```

### Yarn 2.x新增

**在Yarn 2.x中删除了yarn workspaces info指令**

```bash
# 安装单个工作区及其依赖项
yarn workspaces focus
```

> 要使用此命令，请先安装 workspace-tools 插件：`yarn plugin import workspace-tools`

```bash
# 在所有工作空间上运行command命令
yarn workspaces foreach [command]
yarn workspaces foreach run start
```

> 要使用此命令，请先安装workspace-tools插件：`yarn plugin import workspace-tools`

```bash
# 在 workspace-root 下执行，列出所有可用的工作区
yarn workspaces list
```

## Yarn Workspaces 实践

```text
|-- node_modules        
|   |-- module-a (link)       
|   |   `-- package.json
|   |-- module-b (link)        
|   |   |-- node_modules
|   |   |-- package.json
|   |   |-- yarn-error.log
|   |   `-- yarn.lock
|   |-- plugin-a (link)
|   |   `-- package.json
|   `-- plugin-b (link)
|       `-- package.json
|-- package.json
|-- packages
|   |-- module-a
|   |   `-- package.json
|   `-- module-b
|       |-- node_modules
|       |-- package.json
|       |-- yarn-error.log
|       `-- yarn.lock
|-- plugins
|   |-- plugin-a
|   |   `-- package.json
|   `-- plugin-b
|       `-- package.json
`-- yarn.lock
```

执行命令，为工作区 module-a 安装工作区依赖 plugin-a ：

```bash
$ $ yarn workspace module-a add plugin-a@1.0.0
...
...
$ yarn workspaces info --json
yarn workspaces v1.22.19
{
  "module-a": {
    "location": "packages/module-a",
    "workspaceDependencies": [
      "plugin-a"
    ],
    "mismatchedWorkspaceDependencies": []
  },
  "module-b": {
    "location": "packages/module-b",
    "workspaceDependencies": [],
    "mismatchedWorkspaceDependencies": []
  },
  "plugin-a": {
    "location": "plugins/plugin-a",
    "workspaceDependencies": [],
    "mismatchedWorkspaceDependencies": []
  },
  "plugin-b": {
    "location": "plugins/plugin-b",
    "workspaceDependencies": [],
    "mismatchedWorkspaceDependencies": []
  }
}
```

## Workspaces 软链过程

1. 判断当前 Monorepo 中，是否存在匹配 `module-a` 所需版本的 `plugin-a`；
2. 若存在，执行 **link** 操作，`module-a` 直接使用本地 `plugin-a`；
3. 若不存在，从远端 npm 仓库拉取符合版本的 `plugin-a` 供 `module-a` 使用；
4. 若远端 npm 仓库也找不到 `plugin-a` 组件，则报错：`error An unexpected error occurred: "https://registry.npmjs.org/plugin-a: Not found".`

## Yarn Workspaces 限制与不足

+ yarn workspace 并没有像 lerna 那样封装大量的高层API，整个 workspace 整体上还是依赖于整个 yarn 命令体系；
+ workspace 不支持嵌套（只能有一个 workspace-root）；
+ workspace 采用的是向上遍历，所以 workspace 并不能识别 workspace-root 之外的依赖；
+ 依赖引用版本不确定性，如上文的 plugins/plugin-a，当开发者将其发布到了 npm 仓库并且npm 仓库的版本号跟本地版本号不一致时，容易出现此问题；
+ yarn workspace link 的依赖需要添加到 webpack/rollup/vite 等构建工具的构建路径中，增加构建时成本，发布变慢；
+ yarn.lock 容易出现冲突。

## Yarn Workspaces 使用规范推荐

针对 Yarn Workspaces 存在的上述问题，推荐一套项目级别的实施规范。以利用其长处，避免其短处。

1. yarn workspace link 的 Packages 设置为私有

	> 在需要本地依赖的组件的`package.json`中设置`private：true`，目的是防止其被误上传至 npm 远程仓库。强制限定只能通过本地源码link的方式引用，这样就可以有效避免问题4。

1. 所有 workspace 的依赖声明收敛到 workspace-root 中

    > 即各个workspace的 pakcage.json 中不再声明 dependencies、devDependencies，依赖的注册全部收敛到workspace-root的package.json中。
    >
    > 对于新的项目可以在一开始就只使用`yarn -W add [package] [--dev]`进行安装，对于历史项目可以手工修改各 workspace 的 package.json，将依赖剪切到根目录的 package.json 里。
    > 这样做的好处是统一各个子 workspace 的依赖版本，避免同一依赖安装不同版本，保持整个 worktree 下项目里依赖版本的统一，并在各 workspace 间共享依赖。
    >
    > 对于全局共享依赖带来的项目初始化安装时间的增加，是可以接受的，因为只是首次安装耗时长而已，后续因为有缓存，安装时间将大大缩减。

1. 禁止 workspace 独立新增依赖

    > 所有新增的依赖需要通过`yarn -W add [package] [--dev]`进行安装，这一条可以认识是对第二条规范的补充。

1. `yarn.lock`必须提交，冲突必须解决

    > yarn.lock是yarn依赖版本控制的基础，在全局共享依赖的框架下，yarn.lock文件的维护变得尤其重要。保证提交是为了确保新增依赖能够纳入到yarn版本管控中，正确解决冲突则是确保依赖版本的唯一性、统一性。

1. 在 Yarn Workspace 跟目录中添加 eslint、prettier 配置，各子 workspace 继承 root 的配置

    > eslint和prettier配置已经成为规范项目代码的标配，既然是配置当然要在整个Workspace范围内保持统一。

1. 日常开发应当在workspace-root目录下

    > 这是对规范5补充，确保全局代码规范能够生效；
    >  也能让开发者方便查看 yarn workspace link 的 Packages
