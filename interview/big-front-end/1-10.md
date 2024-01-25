## 1. implement curry()

```js
const join = (a, b, c) => {
   return `${a}_${b}_${c}`
}

const curriedJoin = curry(join)

curriedJoin(1, 2, 3) // '1_2_3'

curriedJoin(1)(2, 3) // '1_2_3'

curriedJoin(1, 2)(3) // '1_2_3'

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length){
      return fn.apply(this, args)
    } else {
      return (...other) => {
        return curried.apply(this, args.concat(other))
      }
    }
  }
}
```

> + https://javascript.info/currying-partials
>
> + https://lodash.com/docs/4.17.15#curry

## 2. implement curry() with placeholder support

```js
const  join = (a, b, c) => {
   return `${a}_${b}_${c}`
}

const curriedJoin = curry(join)
const _ = curry.placeholder

curriedJoin(1, 2, 3) // '1_2_3'

curriedJoin(_, 2)(1, 3) // '1_2_3'

curriedJoin(_, _, _)(1)(_, 3)(2) // '1_2_3'
```

第二题，相比于第一题，多了一个 placeholder 占位符的处理，根据样例，后来的参数需要放置在之前的placeholder的地方。 大概想法和第一问是一样的，除了在**判断参数是否够用的时候，需要过滤掉 placeholder**：

```js
const expectedArgLength = func.length
const isArgsEnough = args.length >= expectedArgLength &&
  args.slice(0, expectedArgLength)
    .every(arg => arg !== curry.placeholder)
```

如果参数不够，和之前一样我们需要把参数和后来调用的参数合并在一起，再递归。 但是 这里不能简单的  `concat`，而需要寻找 placeholder 然后 merge：

```js
function curry(fn) {
  return function curried(...args) {
    const expectedArgLength = fn.length
    const isArgsEnough = args.length >= expectedArgLength &&
      args.slice(0, expectedArgLength)
        .every(arg => arg !== curry.placeholder)
    if (isArgsEnough) {
      return fn.apply(this, args)
    } else {
      return function (...newArgs) {
        const finalArgs = []
        let i = 0
        let j = 0
        while (i < args.length && j < newArgs.length) {
          if (args[i] === curry.placeholder) {
            finalArgs.push(newArgs[j])
            i += 1
            j += 1
          } else {
            finalArgs.push(args[i])
            i += 1
          }
        }

        while (i < args.length) {
          finalArgs.push(args[i])
          i += 1
        }

        while (j < newArgs.length) {
          finalArgs.push(newArgs[j])
          j += 1
        }
        return curried(...finalArgs)
      }
    }
  }
}
```

## 3. implement Array.prototype.flat()

```js
function flat(arr, depth = 1) {
  return depth ? 
    arr.reduce((acc, curr) => {
      return [...acc, ...(Array.isArray(curr) ? flat(curr, depth - 1) : [curr])]
    }, []) : arr;
}
```

