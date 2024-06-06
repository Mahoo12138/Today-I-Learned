---
title: 理解 Map 内部实现
---

# Understanding Map Internals 理解 Map 内部实现

## 前言

With this blog post, I am starting V8 Deep Dives series dedicated to my experiments and findings in V8, which is, no doubt, a well-engineered and sophisticated software. Hopefully, you will find this blog post valuable and share your ideas for the next topic.

[ECMAScript 2015](http://www.ecma-international.org/ecma-262/6.0/)，也被称为 ES6，其引入了许多内置的集合类型，例如 Map，Set，WeakMap 及 WeakSet。它们似乎是 JS 标准库的优秀补充，并在库、应用程序和 Node.js 核心中被广泛采用。今天我们将专注于 Map，并尝试理解 V8 的实现细节，同时得出一些实际的结论。

The spec does not dictate a precise algorithm used to implement Map support, but instead gives some hints for possible implementations and expected performance characteristics:

该规范没有规定用于实现 Map 支持的精确算法，而是给出了一些可能实现和预期性能特征的提示：

> Map object must be implemented using either hash tables or other mechanisms that, on average, provide access times that are sublinear on the number of elements in the collection. The data structures used in this Map objects specification is only intended to describe the required observable semantics of Map objects. It is not intended to be a viable implementation model.

As we see here, the spec leaves a lot of room for each implementer, i.e., JS engine, but does not give a lot of certainty on the exact algorithm, its performance, or memory footprint of the implementation. If your application deals with Maps on its hot path or you store a lot of data in a Map, such details may be certainly of great help.

正如我们在这里看到的，规范为每个实现者(即 JS 引擎)留下了很大的空间，但没有给出关于确切的算法、性能或实现的内存占用的很多确定性。如果您的应用程序在其[[hot code |热点路径]]上处理 Map，或者您在 Map 中存储了大量数据，那么这些细节肯定会有很大帮助。

As a developer with a Java background, I got used to Java collections, where one can choose between multiple implementations of Map interface and even fine-tune it if the selected class supports that. Moreover, in Java it is always possible to the open source code of any class from the standard library and get familiar with the implementation (which, of course, may change across versions, but only in a more efficient direction). So, that is why I could not stand not to learn how Maps work in V8.

作为一个有着 Java 背景的开发者，我习惯了 Java 集合，在 Java 中可以选择多个 Map 接口的实现，甚至可以在所选类支持的情况下进行微调。此外，在 Java 中，总是可以查看标准库中任何类的开源代码，并熟悉其实现（当然，这些实现可能会随着版本的更新而改变，但只会变得更高效）。因此，这就是为什么我无法忍受不去了解 V8 中 Maps 的工作原理。

Now, let’s start the dive.

现在，让我们开始深入。

**Disclaimer.** What’s written below is implementation details specific to V8 8.4 bundled with a recent dev version of Node.js ([commit 238104c](https://github.com/nodejs/node/commit/238104c531219db05e3421521c305404ce0c0cce) to be more precise). You should not expect any behavior beyond the spec.

在开始之前，我想指出的是，下面将要讨论的是 V8 8.4 引擎，该引擎内置在 Node.js 的最新开发版本中（更确切地说，我们正在谈论 [commit 238104c](https://github.com/nodejs/node/commit/238104c531219db05e3421521c305404ce0c0cce)）。您无需期望超出规范。

## 底层算法

First of all, Maps in V8 are built on top of hash tables. The subsequent text assumes that you understand how hash tables work. If you are not familiar with the concept, you should learn it first (e.g., by reading this wiki page) and then return here.

首先，V8 中的 Maps 是基于哈希表构建的。接下来的内容假设你已经了解哈希表的工作原理。如果你不熟悉这个概念，应该先学习它（例如，通过阅读对应的维基页面），然后再回来阅读本文。

If you have substantial experience with Maps, you might already notice a contradiction here. Hash tables do not provide any order guarantees for iteration, while ES6 spec requires implementations to keep the insertion order while iterating over a Map. So, the “classical” algorithm is not suitable for Maps. But it appears that it is still possible to use it with a slight variation.

如果你有丰富的 Maps 使用经验，可能已经注意到这里的一个矛盾。哈希表在迭代时不提供任何顺序保证，而 ES6 规范要求实现必须在迭代 Map 时保持插入顺序。因此，“经典”的算法不适用于 Maps。但看起来，通过一些小的变动，仍然可以使用它。

V8 uses the so-called [deterministic hash tables algorithm](https://wiki.mozilla.org/User:Jorend/Deterministic_hash_tables) proposed by Tyler Close. The following TypeScript-based pseudo-code shows main data structures used by this algorithm:

V8 使用了 Tyler Close 提出的所谓 [deterministic hash tables algorithm](https://wiki.mozilla.org/User:Jorend/Deterministic_hash_tables)（确定性哈希表算法）。以下基于 TypeScript 的伪代码展示了该算法使用的主要数据结构：

```typescript
interface Entry {
  key: any;
  value: any;
  chain: number;
}

interface CloseTable {
  hashTable: number[];
  dataTable: Entry[];
  nextSlot: number;
  size: number;
}
```

Here `CloseTable` interface stands for the hash table. It contains `hashTable` array, which size is equal to the number of buckets. The Nth element of the array stands for the Nth bucket and holds an index of the bucket’s head element in the `dataTable` array. In its turn, `dataTable` array contains entries in the insertion order. Finally, each `Entry` has `chain` property, which points to the next entry in the bucket’s chain (or singly linked list, to be more precise).

在这个代码中，`CloseTable`接口代表哈希表。它包含一个`hashTable`数组，其大小等于桶的数量，数组的第 N 个元素代表第 N 个桶，并保存该桶的头部元素在`dataTable`数组中的索引。`dataTable`数组按插入顺序存储 `entry`。最后，每个`Entry`都有一个`chain`属性，指向桶链（或者更确切地说是单链表）中的下一个 `entry`。

> 这里桶可能一开始不好理解，很抽象。
> 
> 它是由 `dataTable` 中的实际存储的 `entry` 组成的链表，在上述的实际的数据结构中，并没有体现出来。
>  
>  每个桶都是一个链表的起点，链表中的每个节点（即`entry`）存储在`dataTable`中。每个`entry`有一个`chain`属性，这个属性指向同一桶中的下一个条目，从而形成一个链表。

Each time when a new entry is inserted into the table, it is stored in the `dataTable` array under the `nextSlot` index. This process also requires an update in the chain of the corresponding bucket, so the inserted entry becomes the new tail.

每次插入一个新 `entry` 时，它会存储在`dataTable`数组的`nextSlot`索引处。这个过程还需要更新相应桶链的链条，以便插入的`entry`成为单链表的新的最后一个元素。

When an entry is deleted from the hash table, it is removed from the `dataTable` (e.g., by setting both key and value to `undefined`). As you might notice, this means that all deleted entries still occupy space in the `dataTable`.

从哈希表中删除 `entry` 时，会将其从`dataTable`中删除（例如，通过写入其属性`key`和`value`值`undefined`）。您可能已经注意到，这意味着所有已删除的 `entries` 继续占据`dataTable`中的空间。

As the last piece of the puzzle, when a table gets full of entries (both present and deleted), it needs to be rehashed (rebuilt) with a bigger (or smaller) size.

最后，当表中充满了 `entries`（包括现存的和已删除的），它需要通过重新哈希（重建）来调整为更大（或更小）的空间大小。

With this approach, iteration over a Map is just a matter of looping through the `dataTable`. That guarantees the insertion order requirement for iteration. Considering this, I expect most JS engines (if not all of them) to use deterministic hash tables as the building block behind Maps.

通过这种方法，迭代一个 Map 只是循环遍历`dataTable`数组的问题。这保证了迭代时的插入顺序要求。考虑到这一点，我预计大多数（如果不是全部）JS 引擎都会使用确定性哈希表作为 Maps 背后的构建机制。

### Algorithm in Practice 算法实践

Let’s go through more examples to see how the algorithm works. Say, we have a `CloseTable` with 2 buckets (`hashTable.length`) and total capacity of 4 (`dataTable.length`) and the hash table is populated with the following contents:

让我们通过更多示例来看看该算法如何工作。假设我们有一个包含 2 个桶（`hashTable.length`）的`CloseTable`，总容量为 4（`dataTable.length`），哈希表填充了以下内容：

```typescript
// let's assume that we use identity hash function,
// i.e. function hashCode(n) { return n; }
table.set(0, "a"); // => bucket 0 (0 % 2)
table.set(1, "b"); // => bucket 1 (1 % 2)
table.set(2, "c"); // => bucket 0 (2 % 2)
```

> 插入时：
> 1. 计算键的哈希码并确定桶的索引。
> 2. 检查该桶是否已有条目，如果有，则通过链找到链尾并添加新条目。
> 3. 更新`dataTable`和`hashTable`，并在`dataTable`中存储新条目。
> 4. 如果容量超过负载因子，进行重新哈希。
> 
> 以下是伪代码实现：
>
> ```js
> function set(table: CloseTable, key: any, value: any) { 
>     let index = hashCode(key) % table.hashTable.length; 
>     let newEntry: Entry = { key, value, chain: null }; 
>     if (table.hashTable[index] === null) { 
>         table.hashTable[index] = table.nextSlot; 
>     } else { 
>         let current = table.hashTable[index]; 
>         while (table.dataTable[current].chain !== null) { 
>             current = table.dataTable[current].chain; 
>         } 
>         table.dataTable[current].chain = table.nextSlot; 
>     } 
>     table.dataTable[table.nextSlot] = newEntry; 
>     table.nextSlot++; 
>     if (table.nextSlot >= table.dataTable.length / 2) { 
>         rehash(table); 
>     } 
> }
> ```

In this example, the internal table representation can be expressed like the following:

在这个例子中，内部表表示可以如下表达：

```typescript
const tableInternals = {
  hashTable: [0, 1],
  dataTable: [
    {
      key: 0,
      value: "a",
      chain: 2, // index of <2, 'c'>
    },
    {
      key: 1,
      value: "b",
      chain: -1, // -1 means tail entry
    },
    {
      key: 2,
      value: "c",
      chain: -1,
    },
    // empty slot
  ],
  nextSlot: 3, // points to the empty slot
  size: 3,
};
```

>删除时：
>1. 计算键的哈希码并确定桶的索引。
>2. 遍历桶链，找到目标条目并将其标记为已删除（通常通过将其从链中移除）。
>
>以下是伪代码实现：
>
>```js
>function deleteEntry(table: CloseTable, key: any) {
>  let index = hashCode(key) % table.hashTable.length;
>  let current = table.hashTable[index];
>  let prev = null;
>
>  while (current !== null) {
>    if (table.dataTable[current].key === key) {
>      if (prev === null) {
>        table.hashTable[index] = table.dataTable[current].chain;
>      } else {
>        table.dataTable[prev].chain = table.dataTable[current].chain;
>      }
>      break;
>    }
>    prev = current;
>    current = table.dataTable[current].chain;
>  }
>}
>```


If we delete an entry by calling `table.delete(0)`, the table turns into this one:

如果我们通过调用`table.delete(0)`删除一个 `entry`，表会变成这样：

```typescript
const tableInternals = {
  hashTable: [0, 1],
  dataTable: [
    {
      key: undefined, // deleted entry
      value: undefined,
      chain: 2,
    },
    {
      key: 1,
      value: "b",
      chain: -1,
    },
    {
      key: 2,
      value: "c",
      chain: -1,
    },
    // empty slot
  ],
  nextSlot: 3,
  size: 2, // new size
};
```

If we insert two more entries, the hash table will require rehashing. We will discuss this process in more detail a bit later.

如果我们将更多记录添加到表中，则需要对其重新进行哈希处理。我们将在下面详细讨论此过程。

The same algorithm can be applied to Sets. The only difference is that Set entries do not need `value` property.

实现`Set`数据结构时可以应用相同的方法。唯一的区别是`Set`的`entries`不需要属性`value`。

Now, when we have an understanding of the algorithm behind Maps in V8, we are ready to take a deeper dive.

现在我们已经弄清了 V8 中的`Map`背后的算法，已经准备进一步深入了。

### Implementation Details 实现细节

The Map implementation in V8 is written in C++ and then exposed to JS code. The main part of it is defined in `OrderedHashTable` and `OrderedHashMap` classes. We already learned how these classes work, but if you want to read the code yourself, you may find it [here](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/objects/ordered-hash-table.h), [here](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/objects/ordered-hash-table.cc), and, finally, [here](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/builtins/builtins-collections-gen.cc).

V8 中`Map`的实现是用 C++ 编写的，允许 JS 代码访问相应的机制。与之相关的大多数代码`Map`在`OrderedHashTable`和`OrderedHashMap`类中。我们已经知道这些类如何工作。如果您想自己看看他们的代码，那么可以在这里，这里和这里找到。

As we are focused on the practical details of V8’s Map implementation, we need to understand how table capacity is selected.

由于我们专注于 V8 中`Map`的实现的实际细节，因此我们首先需要了解如何设置表的容量。

### Capacity 容量

In V8, hash table (Map) capacity is always equal to a power of two. As for the load factor, it is a constant equal to 2, which means that max capacity of a table is `2 * number_of_buckets`. When you create an empty Map, its internal hash table has 2 buckets. Thus the capacity of such a Map is 4 entries.

在 V8 中，哈希表（Map）的容量总是等于 2 的幂。至于负载因子，它是一个常数，等于 2，这意味着表的最大容量是`2 * number_of_buckets`。当你创建一个空的 Map 时，它的内部哈希表有 2 个桶。因此，这样一个 Map 的容量是 4 个`entries`。

There is also a limit for the max capacity. On a 64-bit system that number would be 2²⁷, which means that you can not store more than around 16.7M entries in a Map. This restriction comes from the on-heap representation used for Maps, but we will discuss this aspect a bit later.

还有一个最大容量限制。在 64 位系统上，这个数字是 2²⁷，这意味着你不能在一个 Map 中存储超过大约 1670 万个条目。这一限制来自于 Map 使用的堆内表示，但我们稍后会讨论这一方面。

Finally, the grow/shrink factor used for rehashing is equal to 2. So, as soon as a Map gets 4 entries, the next insert will lead to a rehashing process where a new hash table of a twice as big (or less) size will be built.

最后，用于重新哈希的增长/缩减因子等于 2。因此，一旦一个 Map 达到 4 个`entries`，下一次插入将导致重新哈希过程，其中将构建一个容量大一倍（或更小）的新哈希表。

To have a confirmation of what may be seen in the source code, I have modified V8 bundled in Node.js to expose the number of buckets as a custom `buckets` property available on Maps. You may find the result [here](https://github.com/puzpuzpuz/node/tree/experiment/expose-map-capacity). With this custom Node.js build we can run the following script:

为了确认这些在源代码中看到的内容，我修改了 Node.js 中捆绑的 V8，使其在 Map 上通过自定义`buckets`属性公开桶的数量。你可以在此处找到结果。使用这个自定义的 Node.js 构建，我们可以运行以下脚本：

```JavaScript
const map = new Map();
let prevBuckets = 0;
for (let i = 0; i < 100; i++) {
  if (prevBuckets !== map.buckets) {
    console.log(`size: ${i}, buckets: ${map.buckets}, capacity: ${map.buckets * 2}`);
    prevBuckets = map.buckets;
  }
  map.set({}, {});
}
```

The above script simply inserts 100 entries into an empty Map. It produces the following output:

上述的脚本简单的插入 100 个 `entries` 到空的 Map 中。以下是脚本的输出：

```shell
$ ./node /home/puzpuzpuz/map-grow-capacity.js
size: 0, buckets: 2, capacity: 4
size: 5, buckets: 4, capacity: 8
size: 9, buckets: 8, capacity: 16
size: 17, buckets: 16, capacity: 32
size: 33, buckets: 32, capacity: 64
size: 65, buckets: 64, capacity: 128
```

As we see here, the Map grows as a power of two when map capacity is reached. So, our theory is now confirmed. Now, let’s try to shrink a Map by deleting all items from it:

正如我们所看到的，当表被填充到容量上限时，它都会增加 2 倍。所以我们的观点现在被确定了。现在，让我们尝试通过从表中删除元素来缩小表的大小：

```js
const map = new Map();
for (let i = 0; i < 100; i++) {
  map.set(i, i);
}
console.log(
  `initial size: ${map.size}, buckets: ${map.buckets}, capacity: ${
    map.buckets * 2
  }`
);

let prevBuckets = 0;
for (let i = 0; i < 100; i++) {
  map.delete(i);
  if (prevBuckets !== map.buckets) {
    console.log(
      `size: ${map.size}, buckets: ${map.buckets}, capacity: ${map.buckets * 2}`
    );
    prevBuckets = map.buckets;
  }
}
```

This script produces the following output:

这是此脚本将输出的内容：

```shell
$ ./node /home/puzpuzpuz/map-shrink-capacity.js
initial size: 100, buckets: 64, capacity: 128
size: 99, buckets: 64, capacity: 128
size: 31, buckets: 32, capacity: 64
size: 15, buckets: 16, capacity: 32
size: 7, buckets: 8, capacity: 16
size: 3, buckets: 4, capacity: 8
size: 1, buckets: 2, capacity: 4
```

Again, we see that the Map shrinks as a power of two, once there are fewer remaining entries than `number_of_buckets / 2`.

在这里，我们可以再次看到，一旦表中的剩余元素少于 `number_of_buckets / 2`时，表的大小都会以 2 的幂进行收缩。

### Hash Function 哈希函数

So far, we did not discuss how V8 calculates hash codes for keys stored in Maps, while this is a good topic.

到目前为止，我们还没有涉及 V8 如何为存储在 `Map` 中的键计算哈希码的问题。这是一个不错的话题。

For number-like values (Smis and heap numbers, BigInts, and other similar internal stuff), it uses one or another well-known [hash function](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/utils/utils.h#L213) with low collision probability.

对于类数字值（Smis 和堆数字、BigInts 以及其他类似的内部内容），它使用一种或另一种众所周知的哈希函数，这些函数具有低碰撞概率。

For string-like values (strings and symbols), it [calculates](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/objects/string.cc#L1338) hash code based on the string contents and then caches it in the internal header.

对于类字符串值（字符串和符号），它根据字符串内容计算哈希码，然后将其缓存到内部头部中。

Finally, for objects, V8 [calculates](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/execution/isolate.cc#L3785) the hash code based on a random number and then caches it in the internal header.

最后，对于对象，V8 根据一个随机数计算哈希码，然后将其缓存到内部头部中。

## Time Complexity 时间复杂度

Most Map operations, like `set` or `delete`, require a lookup. Just like with the “classical” hash table, the lookup has O(1) time complexity.

大多数 Map 操作（如`set`或`delete`）都需要查找。与“经典”哈希表一样，查找的时间复杂度为 O(1)。

Let’s consider the worst-case when the table has N out of N entries (it is full), all entries belong to a single bucket, and the required entry is located at the tail. In such a scenario, a lookup requires N moves through the chain elements.

让我们考虑最坏的情况：表中有 N 个`entries`（已满），所有条目都属于一个桶，而所需的`entry`位于链表的尾部。在这种情况下，查找需要通过链表元素进行 N 次移动。

On the other hand, in the best possible scenario when the table is full, but each bucket has 2 entries, a lookup will require up to 2 moves.

另一方面，在最好的情况下，当表已满但每个桶只有 2 个`entries`时，查找最多需要进行 2 次移动。

It is a well-known fact that while individual operations in hash tables are “cheap”, rehashing is not. Rehashing has O(N) time complexity and requires allocation of the new hash table on the heap. Moreover, rehashing is performed as a part of insertion or deletion operations, when necessary. So, for instance, a `map.set()` call could be more expensive than you would expect. Luckily, rehashing is a relatively infrequent operation.

众所周知，虽然哈希表中的单个操作“廉价”，但重新哈希却不是。重新哈希的时间复杂度为 O(N)，并且需要在堆上分配新的哈希表。此外，重新哈希作为插入或删除操作的一部分，在必要时执行。因此，例如，`map.set()`调用可能比你预期的更昂贵。幸运的是，重新哈希是相对不频繁的操作。

## Memory Footprint 内存占用

Of course, the underlying hash table has to be somehow stored on the heap, in a so-called “backing store”. And here comes another interesting fact. The whole table (and thus, Map) is stored as a single array of fixed length. The array layout may be illustrated with the below diagram.

当然，底层哈希表必须以某种方式存储在堆上的一个所谓的“后备存储”中。这里有一个有趣的事实。整个表（以及 Map）作为一个固定长度的单一数组存储。数组的布局可以通过下面的图示来说明。

![](04-memory-footprint.webp)

Specific fragments of the backing store array correspond to the header (contains necessary information, like bucket count or deleted entry count), buckets, and entries. Each entry of a bucket chain occupies three elements of the array: one for the key, one for the value, and one for the “pointer” to the next entry in the chain.

后备存储数组的特定片段对应于头部（包含必要的信息，如桶数量或已删除`entries`数量）、桶和 `entries`。桶链的每个`entry`占据数组中的三个元素：一个用于键，一个用于值，一个用于指向链中下一个`entry`的“指针”。

As for the array size, we can roughly estimate it as `N * 3.5`, where `N` is the table capacity. To have an understanding of what it means in terms of memory footprint, let’s assume that we have a 64-bit system, and [pointer compression](https://v8.dev/blog/pointer-compression) feature of V8 is disabled. In this setup, each array element requires 8 bytes, and a Map with the capacity of 2²⁰ (~1M) should take around 29 MB of heap memory.

至于数组大小，我们可以大致估算为`N * 3.5`，其中`N`是表的容量。为了理解这在内存占用方面的意义，假设我们有一个 64 位系统，并且 V8 的 _指针压缩_ 功能被禁用。在这种设置下，每个数组元素需要 8 字节，而一个容量为 2²⁰（约 100 万个条目）的 Map 大约需要 29 MB 的堆内存。

> 估算方法如下：
>
> - N 个桶，每个桶占用 3 个数组元素（一个键、一个值、一个指针）。
> - 头部占用的额外空间可以忽略不计。
>
> 因此，总的数组元素数大约为`N * 3.5` ，每个元素 8 字节，总内存占用约为`N * 3.5 * 8`字节。对于 N = 2²⁰，这意味着： $2^{20}×3.5×8=2^{20}×28=2^{20}×2^{5}=2^{25}$ 字节=32MB。
> 所以，更精确地说，大约需要 28MB 到 32MB 之间的内存。

## Summary 总结

Gosh, that was a long journey. To wraps things up, here is a shortlist of what we have learned about Maps in V8:

天啊，这真是一段漫长的旅程。总结一下，我们已经了解了关于 V8 中 Maps 的内容：

- V8 uses deterministic hash table algorithm to implement Maps, and it is very likely that other JS engines do so.
- Maps are implemented in C++ and exposed via JS API.
- Just like with “classical” hash maps, lookups required for Map operations are O(1) and rehashing is O(N).
- On a 64-bit system, when pointer compression is disabled, a Map with 1M entries occupies ~29 MB on the heap.
- Most of the things described in this blog post can also be applied to Sets.

* V8 使用确定性哈希表算法来实现 Maps，很可能其他 JS 引擎也是如此。
* Maps 用 C++实现，通过 JS API 暴露出来。
* 就像“经典”哈希表一样，Map 操作所需的查找是 O(1)的，重新哈希是 O(N)的。
* 在 64 位系统上，当指针压缩被禁用时，一个包含 100 万个条目的 Map 在堆上占用大约 29MB 的内存。
* 本文中描述的大部分内容也适用于 Sets。

That’s it for this time. Please share your ideas for the next V8 Deep Dive.

这次就到这里。请分享你对下一次 V8 深度探讨的想法。
