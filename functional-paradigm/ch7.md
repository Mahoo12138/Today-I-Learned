---
title: Hindley-Milner 类型签名
---
# 第七章：Hindley-Milner 类型签名

## 初识类型

刚接触函数式编程的人很容易深陷类型签名（type signatures）的泥淖。类型（type）是让所有不同背景的人都能高效沟通的元语言。很大程度上，类型签名是以 “Hindley-Milner” 系统写就的，本章我们将一起探究下这个系统。

类型签名在写纯函数时所起的作用非常大，大到英语都不能望其项背。这些签名轻轻诉说着函数最不可告人的秘密。短短一行，就能暴露函数的行为和目的。类型签名还衍生出了 “自由定理（free theorems）” 的概念。因为类型是可以推断的，所以明确的类型签名并不是必要的；不过你完全可以写精确度很高的类型签名，也可以让它们保持通用、抽象。类型签名不但可以用于编译时检测（compile time checks），还是最好的文档。所以类型签名在函数式编程中扮演着非常重要的角色——重要程度远远超出你的想象。

JavaScript 是一种动态类型语言，但这并不意味着要一味否定类型。我们还是要和字符串、数值、布尔值等等类型打交道的；只不过，语言层面上没有相关的集成让我们时刻谨记各种数据的类型罢了。别担心，既然我们可以用类型签名生成文档，也可以用注释来达到区分类型的目的。

JavaScript 也有一些类型检查工具，比如 [Flow](http://flowtype.org/)，或者它的静态类型方言 [TypeScript](http://www.typescriptlang.org/) 。由于本书的目标是让读者能够熟练使用各种工具去书写函数式代码，所以我们将选择所有函数式语言都遵循的标准类型系统。

## 神秘的传奇故事

从积尘已久的数学书，到浩如烟海的学术论文；从每周必读的博客文章，到源代码本身，我们都能发现 Hindley-Milner 类型签名的身影。Hindley-Milner 并不是一个复杂的系统，但还是需要一些解释和练习才能完全掌握这个小型语言的要义。

```js
//  capitalize :: String -> String
var capitalize = function(s){
  return toUpperCase(head(s)) + toLowerCase(tail(s));
}

capitalize("smurf");
//=> "Smurf"
```

这里，`capitalize` 接受一个 `String` 并返回了一个 `String`。先别管实现，我们感兴趣的是它的类型签名。

在 Hindley-Milner 系统中，函数都写成类似 `a -> b` 这个样子，其中 `a` 和`b` 是任意类型的变量。因此，`capitalize` 函数的类型签名可以理解为“一个接受 `String` 返回 `String` 的函数”。换句话说，它接受一个 `String` 类型作为输入，并返回一个 `String` 类型的输出。

再来看一些函数签名：

```js
//  strLength :: String -> Number
var strLength = function(s){
  return s.length;
}

//  join :: String -> [String] -> String
var join = curry(function(what, xs){
  return xs.join(what);
});

//  match :: Regex -> String -> [String]
var match = curry(function(reg, s){
  return s.match(reg);
});

//  replace :: Regex -> String -> String -> String
var replace = curry(function(reg, sub, s){
  return s.replace(reg, sub);
});
```

`strLength` 和 `capitalize` 类似：接受一个 `String` 然后返回一个 `Number`。

至于其他的，第一眼看起来可能会比较疑惑。不过在还不完全了解细节的情况下，你尽可以把最后一个类型视作返回值。那么 `match` 函数就可以这么理解：它接受一个 `Regex` 和一个 `String`，返回一个 `[String]`。但是，这里有一个非常有趣的地方，请允许我稍作解释。

对于 `match` 函数，我们完全可以把它的类型签名这样分组：

```js
//  match :: Regex -> (String -> [String])
var match = curry(function(reg, s){
  return s.match(reg);
});
```

是的，把最后两个类型包在括号里就能反映更多的信息了。现在我们可以看出 `match` 这个函数接受一个 `Regex` 作为参数，返回一个从 `String` 到 `[String]` 的函数。因为 curry，造成的结果就是这样：给 `match` 函数一个 `Regex`，得到一个新函数，能够处理其 `String` 参数。当然了，我们并非一定要这么看待这个过程，但这样思考有助于理解为何最后一个类型是返回值。

```js
//  match :: Regex -> (String -> [String])

//  onHoliday :: String -> [String]
var onHoliday = match(/holiday/ig);
```

每传一个参数，就会弹出类型签名最前面的那个类型。所以 `onHoliday` 就是已经有了 `Regex` 参数的 `match`。

```js
//  replace :: Regex -> (String -> (String -> String))
var replace = curry(function(reg, sub, s){
  return s.replace(reg, sub);
});
```

但是在这段代码中，就像你看到的那样，为 `replace` 加上这么多括号未免有些多余。所以这里的括号是完全可以省略的，如果我们愿意，可以一次性把所有的参数都传进来；所以，一种更简单的思路是：`replace` 接受三个参数，分别是 `Regex`、`String` 和另一个 `String`，返回的还是一个 `String`。

最后几点：

```js
//  id :: a -> a
var id = function(x){ return x; }

//  map :: (a -> b) -> [a] -> [b]
var map = curry(function(f, xs){
  return xs.map(f);
});
```

这里的 `id` 函数接受任意类型的 `a` 并返回同一个类型的数据。和普通代码一样，我们也可以在类型签名中使用变量。把变量命名为 `a` 和 `b` 只是一种约定俗成的习惯，你可以使用任何你喜欢的名称。对于相同的变量名，其类型也一定相同。这是非常重要的一个原则，所以我们必须重申：`a -> b` 可以是从任意类型的 `a` 到任意类型的 `b`，但是 `a -> a` 必须是同一个类型。例如，`id` 可以是 `String -> String`，也可以是 `Number -> Number`，但不能是 `String -> Bool`。

相似地，`map` 也使用了变量，只不过这里的 `b` 可能与 `a` 类型相同，也可能不相同。我们可以这么理解：`map` 接受两个参数，第一个是从任意类型 `a` 到任意类型 `b` 的函数；第二个是一个数组，元素是任意类型的 `a`；`map` 最后返回的是一个类型 `b` 的数组。

辨别类型和它们的含义是一项重要的技能，这项技能可以让你在函数式编程的路上走得更远。不仅论文、博客和文档等更易理解，类型签名本身也基本上能够告诉你它的函数性（functionality）。要成为一个能够熟练读懂类型签名的人，你得勤于练习；不过一旦掌握了这项技能，你将会受益无穷，不读手册也能获取大量信息。

这里还有一些例子，你可以自己试试看能不能理解它们。

```js
//  head :: [a] -> a
var head = function(xs){ return xs[0]; }

//  filter :: (a -> Bool) -> [a] -> [a]
var filter = curry(function(f, xs){
  return xs.filter(f);
});

//  reduce :: (b -> a -> b) -> b -> [a] -> b
var reduce = curry(function(f, x, xs){
  return xs.reduce(f, x);
});
```

`reduce` 可能是以上签名里让人印象最为深刻的一个，同时也是最复杂的一个了，所以如果你理解起来有困难的话，也不必气馁。为了满足你的好奇心，我还是试着解释一下吧；尽管我的解释远远不如你自己通过类型签名理解其含义来得有教益。

不保证解释完全正确...（译者注：此处原文是“here goes nothing”，一般用于人们在做没有把握的事情之前说的话。）注意看 `reduce` 的签名，可以看到它的第一个参数是个函数，这个函数接受一个 `b` 和一个 `a` 并返回一个 `b`。那么这些 `a` 和 `b` 是从哪来的呢？很简单，签名中的第二个和第三个参数就是 `b` 和元素为 `a` 的数组，所以唯一合理的假设就是这里的 `b` 和每一个 `a` 都将传给前面说的函数作为参数。我们还可以看到，`reduce` 函数最后返回的结果是一个 `b`，也就是说，`reduce` 的第一个参数函数的输出就是 `reduce` 函数的输出。知道了 `reduce` 的含义，我们才敢说上面关于类型签名的推理是正确的。

## 缩小可能性范围

一旦引入一个类型变量，就会出现一个奇怪的特性叫做 *parametricity*（http://en.wikipedia.org/wiki/Parametricity ）。这个特性表明，函数将会*以一种统一的行为作用于所有的类型*。我们来研究下：

```js
// head :: [a] -> a
```

注意看 `head`，可以看到它接受 `[a]` 返回 `a`。我们除了知道参数是个**数组**，其他的一概不知；所以函数的功能就只限于操作这个数组上。在它对 `a` 一无所知的情况下，它可能对 `a` 做什么操作呢？换句话说，`a` 告诉我们它不是一个**特定**的类型，这意味着它可以是**任意**类型；那么我们的函数对*每一个*可能的类型的操作都必须保持统一。这就是 *parametricity* 的含义。要让我们来猜测 `head` 的实现的话，唯一合理的推断就是它返回数组的第一个，或者最后一个，或者某个随机的元素；当然，`head` 这个命名应该能给我们一些线索。

再看一个例子：

```js
// reverse :: [a] -> [a]
```

仅从类型签名来看，`reverse` 可能的目的是什么？再次强调，它不能对 `a` 做任何特定的事情。它不能把 `a` 变成另一个类型，或者引入一个 `b`；这都是不可能的。那它可以排序么？答案是不能，没有足够的信息让它去为每一个可能的类型排序。它能重新排列么？可以的，我觉得它可以，但它必须以一种可预料的方式达成目标。另外，它也有可能删除或者重复某一个元素。重点是，不管在哪种情况下，类型 `a` 的多态性（polymorphism）都会大幅缩小 `reverse` 函数可能的行为的范围。

这种“可能性范围的缩小”（narrowing of possibility）允许我们利用类似 [Hoogle](https://www.haskell.org/hoogle) 这样的类型签名搜索引擎去搜索我们想要的函数。类型签名所能包含的信息量真的非常大。

## 自由定理

类型签名除了能够帮助我们推断函数可能的实现，还能够给我们带来*自由定理*（free theorems）。下面是两个直接从 [Wadler 关于此主题的论文](http://ttic.uchicago.edu/~dreyer/course/papers/wadler.pdf) 中随机选择的例子：

```js
// head :: [a] -> a
compose(f, head) == compose(head, map(f));

// filter :: (a -> Bool) -> [a] -> [a]
compose(map(f), filter(compose(p, f))) == compose(filter(p), map(f));
```

不用写一行代码你也能理解这些定理，它们直接来自于类型本身。第一个例子中，等式左边说的是，先获取数组的**头部**（译者注：即第一个元素），然后对它调用函数 `f`；等式右边说的是，先对数组中的每一个元素调用 `f`，然后再取其返回结果的**头部**。这两个表达式的作用是相等的，但是前者要快得多。

你可能会想，这不是常识么。但根据我的调查，计算机是没有常识的。实际上，计算机必须要有一种形式化方法来自动进行类似的代码优化。数学提供了这种方法，能够形式化直观的感觉，这无疑对死板的计算机逻辑非常有用。

第二个例子 `filter` 也是一样。等式左边是说，先组合 `f` 和 `p` 检查哪些元素要过滤掉，然后再通过 `map` 实际调用 `f`（别忘了 `filter` 是不会改变数组中元素的，这就保证了 `a` 将保持不变）；等式右边是说，先用 `map` 调用 `f`，然后再根据 `p` 过滤元素。这两者也是相等的。

以上只是两个例子，但它们传达的定理却是普适的，可以应用到所有的多态性类型签名上。在 JavaScript 中，你可以借助一些工具来声明重写规则，也可以直接使用 `compose` 函数来定义重写规则。总之，这么做的好处是显而易见且唾手可得的，可能性则是无限的。

# 类型约束

最后要注意的一点是，签名也可以把类型约束为一个特定的接口（interface）。

```js
// sort :: Ord a => [a] -> [a]
```

胖箭头左边表明的是这样一个事实：`a` 一定是个 `Ord` 对象。也就是说，`a` 必须要实现 `Ord` 接口。`Ord` 到底是什么？它是从哪来的？在一门强类型语言中，它可能就是一个自定义的接口，能够让不同的值排序。通过这种方式，我们不仅能够获取关于 `a` 的更多信息，了解 `sort` 函数具体要干什么，而且还能限制函数的作用范围。我们把这种接口声明叫做*类型约束*（type constraints）。

```js
// assertEqual :: (Eq a, Show a) => a -> a -> Assertion
```

这个例子中有两个约束：`Eq` 和 `Show`。它们保证了我们可以检查不同的 `a` 是否相等，并在有不相等的情况下打印出其中的差异。

我们将会在后面的章节中看到更多类型约束的例子，其含义也会更加清晰。

## 总结

Hindley-Milner 类型签名在函数式编程中无处不在，它们简单易读，写起来也不复杂。但仅仅凭签名就能理解整个程序还是有一定难度的，要想精通这个技能就更需要花点时间了。从这开始，我们将给每一行代码都加上类型签名。

[第 8 章: 特百惠](ch8.md)
