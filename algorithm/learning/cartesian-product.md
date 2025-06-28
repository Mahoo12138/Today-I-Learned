---
title: 笛卡尔积
---

## 概述

笛卡尔积（Cartesian Product）是数学和计算机科学中一个非常基础且重要的概念，尤其在组合数学、关系数据库理论、算法设计（如搜索、组合生成）和编程中经常遇到。

### 核心定义

笛卡尔积是指给定两个或多个集合（设它们为 A, B, C, ...），从**每个集合中各取一个元素**，组成一个有序元组（tuple），所有可能的这种元组构成的集合，就是这些集合的笛卡尔积。

**记法：**

- 两个集合 A 和 B 的笛卡尔积记为 `A × B`。
- `A × B = {(a, b) | a ∈ A and b ∈ B}`
- 多个集合 `A₁ × A₂ × ... × Aₙ` 的结果是所有形如 `(a₁, a₂, ..., aₙ)` 的元组的集合，其中 `aᵢ ∈ Aᵢ`。

### 关键特性

1. **有序性：** 结果元组中元素的顺序很重要。`(a, b)` 和 `(b, a)` 是不同的（除非 a = b）。
2. **不要求集合相关：** 参与笛卡尔积的集合可以完全不同类型，彼此之间不需要有任何关联。
3. **基数（大小）：** 如果集合 A 有 m 个元素，集合 B 有 n 个元素，那么 `A × B` 就有 `m * n` 个元素。扩展到 n 个集合 `|A₁ × A₂ × ... × Aₙ| = |A₁| * |A₂| * ... * |Aₙ|`。结果的大小呈指数级增长。
4. **空集：** 如果任何一个参与笛卡尔积的集合是空集，那么结果也是空集。

## 直观例子

1. **坐标平面：** 最经典的例子。设集合 `X = {1, 2}`, `Y = {3, 4}`。
   - 笛卡尔积 `X × Y = {(1, 3), (1, 4), (2, 3), (2, 4)}`
   - 这正好对应平面直角坐标系上点 (1,3), (1,4), (2,3), (2,4)。整个坐标平面 `(实数集 R × 实数集 R)` 就是笛卡尔积，记为 `R²`。
2. **扑克牌：**
   - 集合 `花色 = {♥, ♦, ♠, ♣}`
   - 集合 `点数 = {A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K}`
   - 一副标准扑克牌（不含大小王）就是这两个集合的笛卡尔积 `花色 × 点数`，总共有 4 * 13 = 52 张牌，每张牌是一个有序对，如 (♥, A) 代表红心A。
3. **商品规格组合：**
   - 商品“T恤”：
     - `颜色 = {红色, 白色, 黑色}`
     - `尺码 = {S, M, L, XL}`
   - 所有可购买的 SKU 就是 `颜色 × 尺码 = {(红色, S), (红色, M), (红色, L), (红色, XL), (白色, S), ..., (黑色, XL)}`，共 3 * 4 = 12 种组合。

## 应用场景

1. **组合生成：** 当需要生成所有可能的组合情况时，本质就是在计算多个集合的笛卡尔积。
   - **例子：** 生成所有可能的密码组合（字符集 × 字符集 × ... × 字符集）、生成测试用例的所有参数组合、游戏中的关卡/物品组合生成。
2. **搜索与回溯：** 在状态空间搜索中，每一步的选择往往可以看作一个集合，从初始状态到达某个状态的所有可能路径集合，可以看作是这些选择集合的笛卡尔积（或受约束的子集）。
3. **关系数据库：** 这是笛卡尔积最核心的应用领域之一。
   - `SQL` 中的 `CROSS JOIN` 操作符显式地计算两个表的笛卡尔积。
   - 即使没有显式写 `CROSS JOIN`，`SQL` 中 `FROM table1, table2`（旧式语法）或者不带任何连接条件的 `INNER JOIN` / `JOIN` 也会产生笛卡尔积。**通常这不是想要的结果（会导致巨大结果集），必须谨慎使用或配合 `WHERE`/`ON` 进行过滤（此时得到的是连接结果）。**
4. **多循环嵌套：** 最直观的生成笛卡尔积的代码实现就是多层嵌套循环。
5. **参数网格搜索：** 在机器学习中调整超参数时，常常需要尝试所有超参数组合的可能值，这本质上是在计算超参数取值集合的笛卡尔积。
6. **编译器理论：** 在词法分析中，确定有限自动机（DFA）的状态转换可以看作是状态集和输入字符集的笛卡尔积的子集。

## 算法实现

#### 迭代法（多层循环）

适用于集合数量固定的场景，直接使用嵌套循环：

```typescript
function cartesianProductFixed<T1, T2>(setA: T1[], setB: T2[]): [T1, T2][] {
  const result: [T1, T2][] = [];
  
  for (const a of setA) {
    for (const b of setB) {
      result.push([a, b]);
    }
  }
  
  return result;
}

// 使用示例
const colors = ["红", "白", "黑"];
const sizes = ["S", "M", "L"];
const result = cartesianProductFixed(colors, sizes);
console.log(result);
/* 输出:
[
  ["红", "S"], ["红", "M"], ["红", "L"],
  ["白", "S"], ["白", "M"], ["白", "L"],
  ["黑", "S"], ["黑", "M"], ["黑", "L"]
]
*/
```

#### 通用迭代法（任意数量集合）

使用数组的 `reduce` 方法处理任意数量的集合：

```typescript
function cartesianProduct<T>(sets: T[][]): T[][] {
  return sets.reduce<T[][]>(
    (results, set) => {
      const newResults: T[][] = [];
      
      for (const result of results) {
        for (const item of set) {
          newResults.push([...result, item]);
        }
      }
      
      return newResults;
    },
    [[]] // 初始值: 包含一个空数组的数组
  ).filter(arr => arr.length > 0); // 过滤掉初始的空数组
}

// 使用示例
const sets = [
  ["iPhone 15", "Galaxy S24"],
  ["128GB", "256GB", "512GB"],
  ["黑色", "白色", "蓝色"]
];

const products = cartesianProduct(sets);
console.log(products);
/* 输出:
[
  ["iPhone 15", "128GB", "黑色"],
  ["iPhone 15", "128GB", "白色"],
  ...
  ["Galaxy S24", "512GB", "蓝色"]
] (共 2×3×3=18 种组合)
*/
```

#### 生成器实现（惰性求值）

```typescript
function* cartesianProductGenerator<T>(sets: T[][]): Generator<T[]> {
  // 递归辅助函数
  function* helper(current: T[], index: number): Generator<T[]> {
    if (index === sets.length) {
      yield current;
      return;
    }
    
    for (const item of sets[index]) {
      yield* helper([...current, item], index + 1);
    }
  }
  
  yield* helper([], 0);
}

// 使用示例
const colorSet = ["金", "银"];
const sizeSet = ["标准版", "Pro版"];

const generator = cartesianProductGenerator([colorSet, sizeSet]);

// 按需获取结果
console.log(generator.next().value); // ["金", "标准版"]
console.log(generator.next().value); // ["金", "Pro版"]
console.log(generator.next().value); // ["银", "标准版"]
console.log(generator.next().value); // ["银", "Pro版"]

// 或者遍历所有结果
for (const combo of cartesianProductGenerator([colorSet, sizeSet])) {
  console.log(combo);
}
```

