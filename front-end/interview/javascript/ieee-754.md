## 题目代码

```js
const one = 0.1
const two = 0.2
const three = 0.3
console.log([two - one == one, three - two == one]);
```

### 输出结果

```js
[true, false]
```

### IEEE 754 浮点数精度问题

JavaScript 中的所有 `Number` 类型（除了 `BigInt`）都是**64 位双精度浮点数（IEEE 754）**。在这个表示中，有些十进制小数（比如 0.1、0.2、0.3）是无法被精确表达的。

| 数字  | 实际内部表示（近似值）   |
| ----- | ------------------------ |
| `0.1` | `0.10000000000000000555` |
| `0.2` | `0.2000000000000000111`  |
| `0.3` | `0.2999999999999999889`  |

## 正确判断方式（误差容差）

在处理浮点数计算时，应该采用误差容忍策略，即用 [[number-epsilon|Number.EPSILON]] 进行精度判断：

```js
function isEqual(a, b, epsilon = Number.EPSILON) {
  return Math.abs(a - b) < epsilon
}

console.log([
  isEqual(two - one, one),     // true
  isEqual(three - two, one)    // true
])
```


## 类似题目

### 如何判断 0.1 + 0.2 与 0.3 相等？

