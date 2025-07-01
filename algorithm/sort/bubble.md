---
title: 冒泡排序
---

## 概述

冒泡排序并无明确的发明者，但最早记录可追溯至1950年代，随着电子计算机的兴起而广为人知。

名称“Bubble Sort”来自于数据元素像水中气泡一样逐渐“浮”到正确位置的过程。



## 核心思想

1. **相邻比较**：遍历数组，比较相邻元素。
2. **交换位置**：若顺序错误（如升序中 `arr[j] > arr[j+1]`），交换它们。
3. **多轮迭代**：重复遍历，每轮将至少一个元素放到正确位置。
4. **提前终止**：若一轮无交换，说明数组已有序，结束排序。


## 代码实现

```typescript
function bubbleSort(arr: number[]): number[] {
    let n = arr.length;
    let swapped: boolean;

    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        // 每轮遍历后，最大元素已沉底，减少比较范围
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                // 交换相邻元素
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        // 无交换则提前结束
        if (!swapped) break;
    }
    return arr;
}
```

## 复杂度分析

| 条件     | 时间复杂度 | 空间复杂度 | 稳定性 |
| -------- | ---------- | ---------- | ------ |
| 最好情况 | 𝑂(n)       | 𝑂(1)       | 稳定   |
| 平均情况 | 𝑂(n²)      | 𝑂(1)       | 稳定   |
| 最坏情况 | 𝑂(n²)      | 𝑂(1)       | 稳定   |

- **最好情况**：数组已排好序，仅需一趟检查。
- **最坏情况**：数组逆序，执行最多的交换。
- **空间复杂度**为常数，因为是原地排序。
- **稳定性**：相等元素不会交换顺序，因此是稳定排序。

## 扩展变体

### 鸡尾酒排序（双向冒泡）

在一次遍历中进行从左到右，再从右到左两次交换，更适合在部分有序的情况下。

```typescript
function cocktailSort(arr: number[]): number[] {
    let left = 0, right = arr.length - 1;
    let swapped: boolean;
    
    while (left < right) {
        swapped = false;
        // 从左到右
        for (let i = left; i < right; i++) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                swapped = true;
            }
        }
        right--;
        // 从右到左
        for (let i = right; i > left; i--) {
            if (arr[i] < arr[i - 1]) {
                [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
                swapped = true;
            }
        }
        left++;
        if (!swapped) break;
    }
    return arr;
}
```

### 梳排序（Comb Sort）

改进了冒泡排序对小间距元素效率低的问题，引入“间隔”概念减少总比较次数。

+ 比较的元素不局限于相邻，通过“缩小间隔”加速交换，使小元素更快向前移动。

+ 每次迭代将“间隔”按固定缩减因子（常用1.3）减少，最终变为1，相当于退化成冒泡排序。

```typescript
function combSort(arr: number[]): number[] {
    const shrinkFactor = 1.3;
    let gap = arr.length;
    let swapped = true;

    while (gap > 1 || swapped) {
        gap = Math.floor(gap / shrinkFactor);
        if (gap < 1) gap = 1;

        swapped = false;
        for (let i = 0; i + gap < arr.length; i++) {
            if (arr[i] > arr[i + gap]) {
                [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
                swapped = true;
            }
        }
    }

    return arr;
}
```

### 递归冒泡排序

通过递归实现排序过程，更具教学意义。

+ 每轮将最大元素“冒泡”至末尾，然后对前`n-1`个元素递归排序。
+ 终止条件：数组长度为1或已排序。

```typescript
function recursiveBubbleSort(arr: number[], n: number = arr.length): number[] {
    if (n <= 1) return arr;

    for (let i = 0; i < n - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
    }

    return recursiveBubbleSort(arr, n - 1);
}
```

