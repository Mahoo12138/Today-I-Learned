在**函数式编程**中，**pointfree** 是一种编程风格，也被称为“无点风格”。它指的是在定义函数时，不显式地提及函数的参数，而是通过组合其他函数来表达逻辑。

### **核心思想**

- 关注**函数的组合**而非数据流转的细节。
- 不直接处理函数的输入（参数），而是通过已有函数的组合来描述整个过程。

### **特点**

1. **没有显式参数**：
    - 常规写法：`const double = x => x * 2;`
    - Pointfree 写法：`const double = n => multiply(2)(n);` 或进一步组合：`const double = multiply(2);`
2. **函数更加抽象**： 它使代码更偏向声明式，关注“**做什么**”而非“**怎么做**”。


### **优点**

- **可读性强**：复杂逻辑通过函数组合简化。
- **模块化**：容易拆分、测试和复用函数。
- **贴近数学模型**：代码与数学中的函数组合思想更加接近。

### 样例

假设你要写一个函数，将一个字符串数组：

- 转为小写。
- 按字母排序。
- 去掉重复的值。

**非 Pointfree 写法**：

```js
const processStrings = arr => {
  return Array.from(new Set(arr.map(s => s.toLowerCase()))).sort();
};
```

**Pointfree 写法**：

```js
const processStrings = compose(
  sort,
  uniq,
  map(toLower)
);
```

