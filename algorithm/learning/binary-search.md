## 概述

二分查找是一种**分治策略**的经典应用，通过不断将有序数据集对半分割，将搜索范围指数级缩小，达到 `O(log n)`的时间复杂度。

**核心原理**

1. **有序性依赖**：输入数组必须有序（升序/降序）
2. **三指针操作**：
   - `left`：当前搜索范围左边界
   - `right`：当前搜索范围右边界
   - `mid`：中间位置（决策点）
3. **循环不变量**：在`[left, right]`区间内搜索目标值

## 搜索区间

| 表达方式        | 数学含义     | 包不包含端点？              |
| --------------- | ------------ | --------------------------- |
| `[left, right]` | 左闭右闭区间 | 包含 `left` 和 `right`      |
| `[left, right)` | 左闭右开区间 | 包含 `left`，不包含 `right` |
| `(left, right)` | 左开右开区间 | 不包含 `left` 和 `right`    |

### 左闭右闭区间 `[left, right]`

#### 初始值设置

```typescript
let left = 0;                   // 包含第一个元素
let right = arr.length - 1;     // 包含最后一个元素
```

**为什么这样设置？**确保初始区间 `[0, arr.length-1]` 包含数组的所有可能索引

#### 循环条件

```typescript
while (left <= right) { ... }
```

**为什么是 `<=`？**当 `left == right` 时，区间 `[left, right]` 仍包含一个有效元素（即 `left/right` 指向的元素）

#### 边界更新规则

```typescript
if (arr[mid] < target) {
    left = mid + 1;  // 排除mid及左侧
} else {
    right = mid - 1; // 排除mid及右侧
}
```

**为什么这样更新？**由于区间包含端点：

- 当目标大于中间值：`mid` 及其左侧已排除 → `left = mid + 1`
- 当目标小于中间值：`mid` 及其右侧已排除 → `right = mid - 1`

### 左闭右开区间 `[left, right)`

#### 初始值设置

```typescript
let left = 0;               // 包含第一个元素
let right = arr.length;     // 不包含，指向数组末尾之后
```

**为什么这样设置？**初始区间 `[0, arr.length)` 等价于数学中的 `[0, arr.length-1]`

#### 循环条件

```typescript
while (left < right) { ... }
```

**为什么是 `<` 而不是 `<=`？**当 `left == right` 时，区间 `[left, right)` 为空（无元素）

#### 边界更新规则

```typescript
if (arr[mid] < target) {
    left = mid + 1;  // 排除mid及左侧
} else {
    right = mid;     // 排除mid及右侧，但保留左边界
}
```

**为什么右边界更新不同？**由于右边界不包含：

- 设置 `right = mid` 后新区间为 `[left, mid)`，自然排除了 `mid`
- 左边界更新与闭区间一致，因为左边界包含

### 左开右开区间 `(left, right)`

#### 初始值设置

```typescript
let left = -1;              // 第一个元素之前
let right = arr.length;     // 最后一个元素之后
```

**为什么这样设置？**初始区间 `(-1, arr.length)` 等价于 `[0, arr.length-1]`

#### 循环条件

```typescript
while (left + 1 < right) { ... }
```

**为什么是这个条件？**

确保区间至少包含一个元素：`left + 1 < right` ⇒ `(left, right)` 至少包含 `left+1` 到 `right-1`

#### 边界更新规则

```typescript
if (arr[mid] < target) {
    left = mid;  // 移动左边界到mid，但不包含mid
} else {
    right = mid; // 移动右边界到mid，但不包含mid
}
```

**为什么这样更新？**由于两个边界都不包含：

- 移动边界到 `mid` 后，`mid` 自动被排除在新区间外
- 无需 `±1` 调整，边界更新更统一

## 三种区间对比

| **特性**         | 左闭右闭 `[left, right]` | 左闭右开 `[left, right)` | 左开右开 `(left, right)`   |
| :--------------- | :----------------------- | :----------------------- | :------------------------- |
| **初始值**       | `left=0, right=len-1`    | `left=0, right=len`      | `left=-1, right=len`       |
| **区间含义**     | 包含左右端点             | 包含左端点，不包含右端点 | 不包含左右端点             |
| **空区间条件**   | `left > right`           | `left >= right`          | `left+1 >= right`          |
| **循环条件**     | `while (left <= right)`  | `while (left < right)`   | `while (left + 1 < right)` |
| **左边界更新**   | `left = mid + 1`         | `left = mid + 1`         | `left = mid`               |
| **右边界更新**   | `right = mid - 1`        | `right = mid`            | `right = mid`              |
| **有效元素数量** | `right - left + 1`       | `right - left`           | `right - left - 1`         |
| **优势**         | 直观，易于理解           | 适合查找插入位置         | 边界更新简单统一           |
| **缺点**         | 边界更新需±1             | 右边界处理需要额外注意   | 初始值不够直观             |