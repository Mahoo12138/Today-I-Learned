---
title: 快速排序
---
# 快速排序

**快速排序**（英语：Quicksort），又称**分区交换排序**（partition-exchange sort），最早由图灵奖获得者[东尼·霍尔](https://zh.wikipedia.org/wiki/東尼·霍爾)于1960 年提出。在平均状况下，排序 $n$ 个项目要 $O(n\log n)$ 次比较，在最坏状况下则需要 $O(n^2)$ 次比较。

快速排序是从冒泡排序算法演变而来的，实际上是在冒泡排基础上，使用**分治法策略**来把一个序列分为较小和较大的2个子序列，然后递归地排序两个子序列，整个排序过程只需要三步：

1. 挑选基准值：从数列中挑出一个元素，称为“基准”（pivot）；
2. 分割：所有小于基准值的元素，都移到基准值的左边；所有大于基准值的元素，都移到基准值的右边；
3. 递归排序子序列：递归地将小于基准值元素的子序列和大于基准值元素的子序列排序。

递归到最底部的结束判断条件是数列的大小是零或一，此时该数列显然已经有序。

选取基准值有数种具体方法，此选取方法对排序的时间性能有决定性影响。


## 非原地排序

```js
const quickSort = function (arr) { 
	// 递归结束条件 
	if(arr.length < 2) 
		return arr; 
	// 基准 
	const pivot = arr.splice(0, 1); 
	// 左区 
	const left = []; 
	// 右区 
	const right = []; 
	// 将剩余元素按照一定规则，分配到左区、右区。 
	for(let i = 0; i < arr.length; i++) { 
		// 大于基准值的分配到右区，小于基准值的分配到左区 
		if(arr[i] > pivot[0]) { 
			right.push(arr[i]) 
		} else { 
			left.push(arr[i]) } 
		}
	}
	// 返回 左区 拼 基准 拼 右区， 再对左区、右区分别重选基准分区 
	return quickSort(left).concat(pivot).concat(quickSort(right));
}
```