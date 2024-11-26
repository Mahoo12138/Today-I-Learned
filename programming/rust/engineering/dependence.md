---
title: 依赖处理
---
## 指定依赖项

### 多引用方式混合

可以同时使用多种方式来引入同一个包，例如本地引入和 `crates.io` :

```toml
[dependencies] 
# 本地使用时，通过 path 引入, 
# 发布到 `crates.io` 时，通过 `crates.io` 的方式引入：version = "1.0" 
bitflags = { path = "my-bitflags", version = "1.0" }  
# 本地使用时，通过 git 仓库引入 
# 当发布时，通过 `crates.io` 引入： version = "1.0" 
smallvec = { git = "https://github.com/servo/rust-smallvec", version = "1.0" }  
# N.B. 若 version 无法匹配，Cargo 将无法编译
```

### 根据平台引入依赖

我们还可以根据特定的平台来引入依赖:

```toml
[target.'cfg(windows)'.dependencies] 
winhttp = "0.4.0"  
[target.'cfg(unix)'.dependencies] 
openssl = "1.0.1"  
[target.'cfg(target_arch = "x86")'.dependencies] 
native = { path = "native/i686" }  
[target.'cfg(target_arch = "x86_64")'.dependencies] 
native = { path = "native/x86_64" }
```

### 重命名依赖

如果你想要实现以下目标：

- 避免在 Rust 代码中使用 `use foo as bar`
- 依赖某个包的多个版本
- 依赖来自于不同注册服务的同名包

那可以使用 Cargo 提供的 `package key` :

```toml
[package] 
name = "mypackage" 
version = "0.0.1"

[dependencies] 
foo = "0.1" 
bar = { git = "https://github.com/example/project", package = "foo" } 
baz = { version = "0.1", registry = "custom", package = "foo" }
```

此时，你的代码中可以使用三个包：

```rust
extern crate foo; // 来自 crates.io 
extern crate bar; // 来自 git repository 
extern crate baz; // 来自 registry `custom` 
```

## 依赖覆盖

