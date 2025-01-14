在 Rust 中，`#cfg` 和 `#![cfg]` 是**条件编译**的核心工具，允许我们根据特定的编译条件（如平台、特性标志）来有选择地编译代码。

## `#cfg`：条件编译属性

**声明条件编译的代码块** 使用 `#[cfg(...)]` 在编译期决定是否包含代码片段：

```rust
#[cfg(target_os = "windows")] 
fn platform_specific_function() { 
	println!("This is Windows-specific code");
}
#[cfg(target_os = "linux")] 
fn platform_specific_function() { 
	println!("This is Linux-specific code"); 
}
```

**条件编译模块** 可以控制整个模块是否被包含：

```rust
#[cfg(feature = "my_feature")] 
mod my_module { 
	pub fn feature_function() { 
		println!("Feature-specific function"); 
	} 
}
```

启用功能标志：

```bash
$ cargo build --features my_feature
```

**可以逻辑组合多个条件** 使用：
```rust
#[cfg(all(unix, feature = "my_feature"))] 
fn my_function() { 
	println!("This runs on Unix with the 'my_feature' enabled."); 
} 
#[cfg(any(windows, feature = "my_feature"))] 
fn my_function() { 
	println!("This runs on Windows or if 'my_feature' is enabled."); 
}
```


## `cfg!`：运行时条件检测

`cfg!` 是一个**编译时宏**，返回一个布尔值，用于在运行时检测配置条件：

```rust
if cfg!(target_os = "windows") { 
	println!("Running on Windows!"); 
} else if cfg!(target_os = "linux") { 
	println!("Running on Linux!"); 
} else { 
	println!("Running on an unknown platform!"); 
}
```


## **`#[cfg]` 和 `cfg!` 的对比**

| 特性            | `#[cfg(...)]`    | `cfg!(...)`       |
| ------------- | ---------------- | ----------------- |
| **用途**        | 控制代码的编译与否        | 返回布尔值，控制运行时逻辑     |
| **未满足条件时的代码** | 直接从最终二进制中移除，不被编译 | 代码仍会保留，但条件分支不会被执行 |
| **执行时机**      | 编译时              | 编译时决定逻辑，但运行时进行判断  |
| **典型场景**      | 平台特定代码、模块声明      | 运行时动态判断执行逻辑       |
## 配置选项

例如 `target_os`， `target_arch` 等编译器设置集，还有几个：
+ `test`：在编译测试套件时启用，使用 `--test` 命令行参数来完成此启用；
+ `debug_assertions`：在开发中启用额外的代码调试功能，启用标准库的 `debug_assert!`宏；
+ `proc_macro`：指定当前 crate 的编译输出文件类型 (crate-type)为 `proc_macro`；

配置选项在 crate 编译期时就静态确定，自定义条件使用 `--cfg` 标记来传给 `rustc`：

```bash
$ rustc --cfg some_condition main.rs
```


## cfg_attr 配置属性

```rust
#[cfg_attr(target_os = "linux", path = "linux.rs")] 
#[cfg_attr(windows, path = "windows.rs")] 
mod os;

#[cfg_attr(feature = "magic", sparkles, crackles)] 
fn bewitched() {} 

// 当启用了 `magic` 特性时, 上面的代码将会被展开为: 
#[sparkles] 
#[crackles] 
fn bewitched() {}


use proc_macro::TokenStream;

#[proc_macro_attribute] 
pub fn sparkles(_attr: TokenStream, item: TokenStream) -> TokenStream { 
	// 这里可以处理和生成新的代码 
	println!("The `#[sparkles]` attribute was applied!"); 
	item // 返回原始代码，不做任何修改 
}
```
