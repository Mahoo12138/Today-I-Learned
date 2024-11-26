## 概述

一个工作空间是由多个 `package` 组成的集合，它们共享同一个 `Cargo.lock` 文件、输出目录和一些设置(例如 profiles : 编译器设置和优化)。组成工作空间的 `packages` 被称之为工作空间的成员。

## 工作空间类型

工作空间有两种类型：`root package` 和虚拟清单( virtual manifest )。

### 根 package

**若一个 `package` 的 `Cargo.toml` 包含了`[package]` 的同时又包含了 `[workspace]` 部分，则该 `package` 被称为工作空间的根 `package`**。

大名鼎鼎的 [ripgrep](https://github.com/BurntSushi/ripgrep/blob/master/Cargo.toml) 就在最外层的 `package` 中定义了 `[workspace]` :

```toml
[package]
name = "ripgrep"
version = "14.1.1"

[workspace] 
members = [   
  "crates/globset",   
  "crates/grep",   
  "crates/cli",   
  "crates/matcher",   
  "crates/pcre2",   
  "crates/printer",   
  "crates/regex",   
  "crates/searcher",   
  "crates/ignore", 
]
```

那么最外层的目录就是 `ripgrep` 的工作空间的根。

### 虚拟清单

若一个 `Cargo.toml` 有 `[workspace]` 但是没有 `[package]` 部分，则它是虚拟清单类型的工作空间。

**对于没有主 `package` 的场景或你希望将所有的 `package` 组织在单独的目录中时，这种方式就非常适合。**

例如 [rust-analyzer](https://github.com/rust-analyzer/rust-analyzer) 就是这样的项目，它的根目录中的 `Cargo.toml` 中并没有 `[package]`，说明该根目录不是一个 `package`，但是却有 `[workspace]` :

```toml
[workspace] 
members = ["xtask/", "lib/*", "crates/*"]
exclude = ["crates/proc_macro_test/imp"]
```

结合 rust-analyzer 的目录布局可以看出，**该工作空间的所有成员 `package` 都在单独的目录中，因此这种方式很适合虚拟清单的工作空间。**

## 关键特性

工作空间的几个关键点在于：

- 所有的 `package` 共享同一个 `Cargo.lock` 文件，该文件位于工作空间的根目录中；
- 所有的 `package` 共享同一个[输出目录]，该目录默认的名称是 `target` ，位于工作空间根目录下；
- 只有工作空间根目录的 `Cargo.toml` 才能包含 `[patch]`, `[replace]` 和 `[profile.*]`，而成员的 `Cargo.toml` 中的相应部分将被自动忽略；

## \[workspace\]

Cargo.toml 中的 `[workspace]` 部分用于定义哪些 packages 属于工作空间的成员。

若某个本地依赖包是通过 path 引入，且该包位于工作空间的目录中，则该包自动成为工作空间的成员。

剩余的成员需要通过 workspace.members 来指定，里面包含了各个成员所在的目录(成员目录中包含了 Cargo.toml )。

如果一个空的 `[workspace]` 直接联合 `[package]` 使用，那么工作空间的成员则有根 `package`和通过 `path` 引入的本地依赖(位于工作空间目录下)。