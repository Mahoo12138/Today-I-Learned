`iter::Peekable` 是 Rust 标准库中一个非常有用的迭代器适配器。它允许你在遍历迭代器时提前查看下一个元素（称为 _peek_ 操作），而不会消耗迭代器的状态。适合在需要根据下一个元素决定当前操作的场景中使用，比如解析器、令牌流分析等。

### 工作原理

`Peekable` 封装了一个基础迭代器，并提供了一种机制，将下一个元素缓存在内部。如果你调用了 `peek` 方法，`Peekable` 会检查是否已经缓存了下一个元素：

- 如果已经缓存，则直接返回**引用**。
- 如果没有缓存，则从基础迭代器中取出下一个元素并缓存它。

这个机制保证了：

- 你可以多次查看下一个元素而不会消耗它。
- 继续调用 `next` 时，会消耗缓存的元素。

`Peekable` 是一个泛型结构体，定义如下：

```rust
pub struct Peekable<I: Iterator> {
    iter: I,
    /// Remember a peeked value, even if it was None.
    peeked: Option<Option<I::Item>>,
}
```

+ `iter` 是底层迭代器。
+ `peeked` 是一个缓存字段，表示是否已经提前取出了下一个元素。

## **常用方法**

1. **`peek`**：返回迭代器中的下一个元素的引用（如果有），但不消耗它。

   ```rust
   fn peek(&mut self) -> Option<&I::Item>;
   ```

2. **`next`**：返回迭代器的下一个元素，同时消耗它（包括已缓存的元素）。

   ```rust
   fn next(&mut self) -> Option<I::Item>;
   ```

3. **`peek_mut`**：提供对下一个元素的可变引用，允许你修改元素。

   ```rust
   fn peek_mut(&mut self) -> Option<&mut I::Item>;
   ```

4. **`advance_by`**：跳过指定数量的元素，但如果遇到缓存的元素，它会消耗缓存的值。





## **使用示例**

### 1. **基本使用**

快速了解 `peek` 和 `next` 的协同工作：

```rust
fn main() {
    let v = vec![1, 2, 3];
    let mut iter = v.into_iter().peekable();

    // 查看下一个元素
    if let Some(&next) = iter.peek() {
        println!("Next value: {}", next); // 输出 1
    }

    // 消耗元素
    println!("Consumed: {:?}", iter.next()); // 输出 1

    // 再次查看
    if let Some(&next) = iter.peek() {
        println!("Next value: {}", next); // 输出 2
    }
}
```

### 2. **跳过特定元素**

使用 `peek` 来决定是否跳过某些元素：

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];
    let mut iter = v.into_iter().peekable();

    while let Some(&value) = iter.peek() {
        if value % 2 == 0 {
            println!("Skipping: {}", value);
            iter.next(); // 消耗偶数
        } else {
            println!("Processing: {}", value);
            iter.next(); // 消耗奇数
        }
    }
}
```

### 3. **解析字符串中的单词和标点符号**

一个常见场景是解析令牌流。假设我们有一个字符串，想把字母和标点符号分开：

```rust
fn main() {
    let input = "hello,world!";
    let mut chars = input.chars().peekable();

    while let Some(&ch) = chars.peek() {
        if ch.is_alphabetic() {
            let mut word = String::new();
            while let Some(&ch) = chars.peek() {
                if ch.is_alphabetic() {
                    word.push(ch);
                    chars.next(); // 消耗字母
                } else {
                    break;
                }
            }
            println!("Word: {}", word);
        } else if ch.is_ascii_punctuation() {
            println!("Punctuation: {}", ch);
            chars.next(); // 消耗标点符号
        } else {
            chars.next(); // 跳过其他字符
        }
    }
}
```

### 4. **修改缓存的值**

用 `peek_mut` 修改即将被访问的元素：

```
rust复制代码fn main() {
    let v = vec![1, 2, 3];
    let mut iter = v.into_iter().peekable();

    if let Some(next) = iter.peek_mut() {
        *next *= 10; // 修改缓存的值
    }

    println!("First value after modification: {:?}", iter.next()); // 输出 10
}
```
