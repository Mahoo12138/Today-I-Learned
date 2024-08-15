# [A different way to think about typescript](https://www.rob.directory/a-different-way-to-think-about-typescript)

## Types -> Sets

The TypeScript type system can be thought of as a purely functional language that operates over types. But what does it mean to operate over a type? For me, I find resolving types into the set of items it can construct very useful. This set would contain every real value that is assignable to that type.

TypeScript 类型系统可以被看作是一种操作类型（即类型上的操作）的纯函数语言。但是，对类型进行操作意味着什么呢？对我来说，我发现将类型解析为它可以构造的项的集合非常有用。这个集合包含了可以赋值给该类型的所有实际值。

Then TypeScript's core syntax is functionality to operate over items in any given set, just like how you might operate over a real set in a normal programming language.

然后，TypeScript 的核心语法可以用来操作任何给定集合中的项的功能，就像在普通编程语言中操作真实集合一样。

Because TypeScript is a [structural type system](https://www.typescript-training.com/course/fundamentals-v3/05-structural-vs-nominal-types/), as opposed to nominal, this "set" the type constructs can be more useful than the actual type definition itself (but not always).

由于 TypeScript 是一个结构化类型系统，而不是命名类型系统，这个类型构造的 “集合” 有时比实际的类型定义更有用（但并非总是如此）。

If we think of each type as the set of [literals](https://www.typescriptlang.org/docs/handbook/literal-types.html)- real values- it can construct, we could say a string is just the infinite set of every permutation of characters, or a `number` is the infinite set of every permutation of digits.

如果我们将每种类型都视为它可以构造的字面量的集合 —— 实际值，那么可以说，一个字符串就是所有字符排列的无限集合，而一个整数就是所有数字排列的无限集合。

![](07-numbers-and-strings.webp)

Once you start thinking about the type system as a proper functional programming language that is meant solely for processing sets, more advanced features can get a little easier.

一旦你开始将类型系统视为一种专门用于处理集合的高级功能编程语言，那么一些更高级的功能就会变得更加容易理解。

This article will go through most of typescripts features through the lens of: types are the sets they can create and typescript is a functional programming language that operates on sets.

本文将通过 “类型是它们可以创建的集合” 这一视角，深入探讨 TypeScript 的众多特性，因为 TypeScript 是一种基于集合的函数式编程语言。

> **Note** I am not implying that sets and types are equivalent, [they are not.](https://cs.stackexchange.com/questions/91330/what-exactly-is-the-semantic-difference-between-set-and-type#answer-91345)
> 
> 我要强调的是，集合和类型并不等同，它们是不同的概念。
## Breaking apart TypeScript primitives 分解 TypeScript 原始类型

### Intersection (&) 交集

Intersection (&) is a great example where this mental model helps you reason about the operation better. Given the following example:

交集（&）是一个很好的例子，这种心智模型有助于你更好地理解操作。考虑以下示例：

```typescript
type Bar = { x: number };
type Baz = { y: number };
type Foo = Bar & Baz;
```

We are intersecting Bar and Baz. Your first though might be the intersection operation was applied the following way:

我们正在对 Bar 和 Baz 进行交集操作。你可能会首先想到交集操作是以如下方式进行的：

![](07-wrong-intersection.webp)

Where we identify the overlap between the 2 objects, and take that as a result. But... there is no overlap? The left hand side (LHS) solely has x, and the right hand side (RHS) solely has y, albeit both numbers. So why would the intersection result in a type where this is allowed:

我们会在两个对象之间寻找重叠区域，并将其作为结果。但... 如果找不到重叠区域呢？左侧（LHS）只有 x，右侧（RHS）只有 y，尽管两个数都有。那么为什么交集会导致允许以下操作的类型：

```typescript
 let x: Foo = { x: 2, y: 2 };
```

An easier way to think about what is happening is to resolve the types `Bar` and `Baz` into the sets they construct, not what it looks like in text.

用更简单的方式来思考这个问题的方法是将类型 Bar 和 Baz 解析为它们所构建的集合，而不是它们在文本中的表现形式。

When we define a type of `{ y: number }`, we can construct an infinite set of object literals that at least have the property y in them, where y is a number:

当我们定义一种 `{ y: number }` 类型时，我们可以构造出一个包含至少具有属性 y 的无限对象字面量的集合，其中 y 是一个数字：

![](07-correct-set.webp)

> **Note:** Notice how I said "set of object types that at least have the property y in them". That's why properties other than y exist in some object types. If you had a variable that had type `{y: number}`, it wouldn't matter to you if the object had more properties than y inside of it, hence why TypeScript allows it.
> 
> 注意：请注意我说的是 “至少具有 y 属性的对象类型集合”。这就是为什么某些对象类型中存在其他属性的原因。如果你有一个类型为 `{y: number}` 的变量，那么即使对象中有比 y 更多的属性也无所谓，这就是为什么 TypeScript 允许这种情况。

Now that we know how to replace types with the sets they construct, intersections make a lot more sense:

现在我们知道如何用构造它们的集合来替换类型，那么交集的意义就更加清晰了：

![](07-correct-intersection.webp)

### Unions 联合类型

Using the previous mental model we established, this is trivial, we just take the union of 2 sets to get our new set.

使用我们之前建立的心智模型，这很简单，我们只需将两个集合的并集作为新集合即可。

```typescript
type Foo = { x: number };
type Baz = { y: number };
type Bar = Foo | Baz;  
```

![](07-correct-union.webp)

### Type Introspection 类型内省

Because the TypeScript maintainers thought it would be convenient, they built primitives into the language to let us introspect these sets. For example, we can check if one set is the subset of another, and return a new set in the true/false case using the `extends` keywords.

因为 TypeScript 的维护者认为这很方便，他们在语言中内置了一些基本类型，让我们可以查看这些集合。例如，我们可以使用 `extends` 关键字检查一个集合是否是另一个集合的子集，并在 true/false 情况下返回一个新集合。

```typescript
type IntrospectFoo = number | null | string extends number
? "number | null | string constructs a set that is a subset of number"
: "number | null | string constructs a set that is not a subset of number";

// IntrospectFoo = "number | null | string is not a subset of number"
```

Where we are checking if the LHS set of the [extends keyword](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) is a subset of the RHS set.

在这里，我们正在检查 extends 关键字 的左侧集合是否是右侧集合的子集。

This is quite powerful because we can arbitrarily nest these.

这非常强大，因为我们可以任意嵌套这些结构。

```typescript
type Foo = null 
type IntrospectFoo = Foo extends number | null
	? Foo extends null
		? "Foo constructs a set that is a subset of null"
		: "Foo constructs a set that of number"
	: "Foo constructs a set that is not a subset of number | null"; 
	
// Result = "Foo constructs a set that is a subset of null"
```

But things get weird when we use type parameters and pass unions as type arguments. TypeScript makes the decision to perform the subset check for every member of the union individually when type parameters are used, as opposed to resolving the union to a constructed set first.

但当我们使用类型参数并将联合类型作为类型参数传递时，事情会变得有些奇怪。与先将联合体解析为构造集合后再进行子集检查的做法不同，TypeScript 会在使用类型参数时对联合体中的每个成员分别进行子集检查。

So, when slightly altering the previous example to use type parameters:

因此，当稍微改变前面的例子以使用类型参数时：

```typescript
type IntrospectT<T> = T extends number | null
	? T extends null
		? "T constructs a set that is a subset of null"
		: "T constructs a set that of number"
	: "T constructs a set that is not a subset of number | null"; 

type Result = IntrospectT<number | string>;
```

Typescript will transform `Result` into:

TypeScript 将 `Result` 转换为：

```typescript
type Result = IntrospectFoo<number> | IntrospectFoo<string>;
```

making `Result` resolve to:

使 Result 解析为：

`"T constructs a set containing only number" | "T constructs a set with items not included in number | null";`

Which is simply because this is more convenient for most operations. But, we can force TypeScript to not do this using tuple syntax.

这只是因为这对大多数操作来说更加方便。但是，我们可以使用元组语法强制 TypeScript 不这样做。

```typescript
type IntrospectFoo<T> = [T] extends [number | null]
	? T extends null
		? "T constructs a set that is a subset of null"
		: "T constructs a set that of number"
	: "T constructs a set that is not a subset of number | null";
	
type Result = IntrospectFoo<number | string>; 
// Result = "T constructs a set that is not a subset of number | null"
```

which is because we are no longer applying the conditional type on a union, we are applying it to a tuple which happens to have a union inside of it.

这是因为我们不再将条件类型应用于联合体，而是将其应用于包含联合体的元组。

This edge case is important because it goes to show the mental model of always resolving types to the sets they construct immediately is not perfect.

这个特殊情况很重要，因为它说明了一个事实，即总是将类型映射到它们立即构造的集合上的思维模型并不完美。
### Type mapping 类型映射

In a normal programming language, you can iterate over a set (however that may be done in the language) to create a new set. For example, in python if you wanted to flatten a set of tuples, you may do the following:

```python
nested_set = {(1,3,5,6),(1,2,3,8), (9,10,2,1)}
flattened_sed = {}
for tup in nested_set:
  for integer in tup:
    flattened_set.add(integer)
```

Our goal is to do this in TypeScript types. If we think of `Array<number>` as the set of all permutations of arrays containing numbers:

我们的目标是在 TypeScript 类型中完成这一操作。如果我们将 `Array<number>` 视为包含数字数组的所有排列的集合：

![](07-array-set.webp)

We want to apply some transformation to select the numbers out of each item and place them in the set.

我们想对每个项目中的数字进行一些转换，并将它们放入集合中。

![](07-array-flat.webp)

Instead of using imperative syntax, we can do this declaratively in typescript. For example:

相反，我们可以使用 TypeScript 的声明式语法来实现。例如：

```typescript
type InsideArray<T> = T extends Array<infer R>
	? R
	: "T is not a subset of Array<unknown>";
	
type TheNumberInside = InsideArray<Array<number>>; 
// TheNumberInside = number
```

This statement does the following:

- Checks if T is a subset of the set `Array<any>` constructs (R does not exist yet, so we substitute it with any)
    - If it is, for each array in the set T constructs, place the items of every array into a new set called R'
        - Infer what type would construct R', and place that type inside R, where R is only available in the true branch
        - Return R as the final type
    - If it's not, provide an error message

这个声明执行以下操作：

+ 检查 T 是否是 `Array<any>` 构造的集合的子集（R 还不存在，所以我们用 any 代替）
	+ 如果是，对于 T 构造的集合中的每个数组，将每个数组的项放入一个名为 R' 的新集合中
		- 推断出可以构造 R' 的类型，并将该类型放入 R 中，其中 R 仅在 true 分支中可用
		- 将 R 作为最终类型返回
	- 如果不是，则提供错误信息

> **Note** This is not based on a spec of how infer is implemented, this is only a way to reason about how infer works with the mental model of sets.
> 
> 注意 这不是基于 infer 实现的规范，这仅仅是一种通过集合心智模型来推理 infer 如何工作的方式。

Visually we can describe this process as:

从视觉上来说，我们可以把这个过程描述为：

![](07-infer-diagram.webp)

With this mental model, TypeScript using the word `infer` actually makes sense. It's automatically finding a type that would describe how to create the set we made- R'.

有了这个思维模型，使用 TypeScript 中的 `infer` 实际上就很有意义了。它会自动找到一个能够描述如何创建我们创建的集合（R'）的类型。

### Type Transformation - mapped types 类型转换 —— 映射类型

We just described how TypeScript allows us to check very precisely whether or not a set looks like something, and map them based on that. Though, it would be useful if we could be more expressive in what each item in a set, constructed by a type, looks like. If we can describe this set well, we can make whatever we want:

我们刚刚描述了 TypeScript 如何让我们精确地检查一个集合是否看起来像某种类型，并根据该类型对它们进行映射。不过，如果我们能更具表达力地描述由一个类型构造的集合中的每个项的特征，那就更有用了。如果我们能很好地描述这个集合，我们可以创建任何我们想要的东西：

- [SQL parser in TypeScript types](https://github.com/codemix/ts-sql)
- [GraphQL parser in TypeScript types](https://github.com/Svehla/Typescript-GraphQL-AST-parser)

Mapped types are a good example of this, and have a very simple initial use, map over every item in the set to create an object type.

映射类型是一个很好的例子，其最初的使用非常简单，对集合中的每个元素进行映射，创建一个对象类型。

For example:

例如：

```typescript
type OnlyBoolsAndNumbers = {   [key: string]: boolean | number; };
```

![](07-mapped-types.webp)

The last step would be done in our minds- mapping the object type back to a set.

最后一步是在我们头脑中完成的 —— 将对象类型映射回集合。

We can also map over a subset of strings:

我们也可以对字符串的子集进行映射：

```typescript
type SetToMapOver = "string" | "bar"; type Foo = { [K in SetToMapOver]: K };
```

Here we map over the set `["string", "bar"]` to create an object type => `{string: "string", bar: "bar"}` which then describes a set that can be constructed.

我们在这里对 `["string", "bar"]` 集合进行映射，创建一个对象类型 => `{string: "string", bar: "bar"}` ，然后它描述了一个可以构造的集合。

We can perform arbitrary type level computation on the key and value of the object type:

我们可以对对象类型的键和值执行任意类型级别的计算：

```typescript
type SetToMapOver = "string" | "bar"; 
type FirstChacter<T> = T extends `${infer R}${infer _}` ? R : never; 
type Foo = {   
	[K in SetToMapOver as `IM A ${FirstChacter<K>}`]: FirstChacter<K>;
};
```

> **Note:** `never` is the empty set- there exists no values in the set- so a value with type never can **never** be assigned anything
> 
> 注意：`never` 是一个空集合，集合中不存在任何值，因此具有类型 `never` 的值永远无法被赋值任何值。

Now we mapped over the set `["string", "bar"]` to create the new type =>`{["IM A s"]: "s", ["IM A b"]: "b"}`.

现在我们将集合 `["string", "bar"]` 映射为新的类型 => `{["IM A s"]: "s", ["IM A b"]: "b"}`。
### Repetitive logic 重复逻辑

What if we wanted to perform some transformation to a set, but the transformation is quite difficult to represent. It needs to run its inner computation some arbitrary amount of times before moving to the next item. In a runtime programming language we would trivially reach for loops. But as TypeScript's type system is a functional language, we will reach for recursion.

如果我们想对一个集合执行某种转换，但这个转换非常难以表示。它需要在处理下一个元素之前进行任意次数的内部计算。在运行时编程语言中，我们很容易使用循环来实现。但由于 TypeScript 的类型系统是函数式语言，我们需要使用递归来实现。

```typescript
type FirstLetterUppercase<T extends string> =
	T extends `${infer R}${infer RestWord} ${infer RestSentence}`
		// recurssive call
		? `${Uppercase<R>}${RestWord} ${FirstLetterUppercase<RestSentence>}`     
		: T extends `${infer R}${infer RestWord}`
		// base case
		? `${Uppercase<R>}${RestWord}`
		: never; 

type UppercaseResult = FirstLetterUppercase<"upper case me">
// UppercaseResult = "Upper Case Me"
```

Now first... lol what. This may look insane, but it's really just dense code, it's not complicated. Lets write a TypeScript runtime version to expand what's happening:

首先…… 哈哈，这看起来可能很疯狂，但实际上只是一些密集的代码，并不复杂。让我们用 TypeScript 运行时版本来扩展一下发生了什么：

```typescript
const separateFirstWord = (t: string) => {   
	const [firstWord, ...restWords] = t.split(" ");
	return [firstWord, restWords.join(" ")];
}; 
const firstLetterUppercase = (t: string): string => {
	if (t.length === 0) {     
		// base case     
		return "";   
	}   
	const [firstWord, restWords] = separateFirstWord(t);
	// recursive call
	return `${firstWord[0].toUpperCase()}${firstWord.slice(1)}${firstLetterUppercase(restWords)}`;  
};
```
We get the first word of the current sentence, upper case the words first letter, and then do the same for the rest of the words, concatenating them in the process.

我们获取当前句子的第一个单词，并将其首字母大写，然后对其余单词也这样做，在过程中将它们连接起来。

Comparing the runtime example to the type level example:

- if statements to generate a base case are replaced with if subset checks (`extends`)
    - this looks a lot like an if statement because each of the sets made using `infer` (`R`, `RestWord`, `RestSentence`) only contain a single string literal
- splitting a sentence into the first word and the rest of the sentence, using destructuring, is replaced with `infer` mapping over 3 sets- `${infer R}${infer RestWord} ${infer RestSentence}`
- function parameters are replaced with type parameters
- recursive function calls are replaced with recursive type instantiations

将运行时示例与类型级示例进行比较：

- 用于生成基本情况的 if 语句被子集检查 (`extends`) 替代
	- 这看起来很像一个 if 语句，因为使用 infer 生成的每个集合（`R`、`RestWord`、`RestSentence`）仅包含一个字符串字面量
- 使用解构将句子拆分为第一个词和句子的其余部分，替换为 infer 映射 3 个集合 ——`${infer R}${infer RestWord} ${infer RestSentence}`
- 函数参数被类型参数替代
- 递归函数调用被递归类型实例化替代

We have the ability to describe any computation using these abilities (the type system is turing complete).

我们可以使用这些能力描述任何计算（类型系统是图灵完备的）。

## Conclusion 总结

If you are able to think of TypeScript as being a very expressive way to operate over sets, and using those sets to enforce strict compile time checks, you will most likely start to get more comfortable with advanced typescript features (if not already), allowing you catch more bugs early.

如果你能把 TypeScript 看作是一种非常强大的操作集合的方式，并使用这些集合来强制执行严格的编译时检查，那么你很可能会开始更熟悉高级的 TypeScript 功能（如果尚未熟悉的话），从而能够更早地发现更多的 bug。

This mental model is not perfect, but it holds up pretty well even with some of TypeScript's most advanced features.

这种思维模式并非完美无缺，但在处理一些 TypeScript 的高级特性时仍然相当适用。