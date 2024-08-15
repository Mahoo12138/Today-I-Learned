---
title: V8 Math.random()
---
# [V8 Deep Dives] Random Thoughts on Math.random()

Every JS developer uses `Math.random()` once in a while in their applications for various use cases. The general wisdom says that `Math.random()` is good for anything, but security. That said, this function is not backed by a [CSPRNG](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator) (cryptographically secure pseudorandom number generator) and shouldn’t be used in security-related tasks, like UUID v4 generation (note: if you [dare](https://security.stackexchange.com/a/157277) to use UUIDs for such tasks).

Today we’ll try to understand how exactly V8 implements `Math.random()` function and then try to match our findings with the general wisdom.

TL;DR fans may want to jump to the last section of the blog post where you may find a summary.

**Disclaimer.** What’s written below are implementation details specific to V8 9.0 bundled with a recent dev version of Node.js ([commit 52f9aaf](https://github.com/nodejs/node/commit/52f9aafeab02390ff78447a390651ec6ed94d166) to be more precise). As usual, you should not expect any behavior beyond the spec, as implementation details are subject to change in any V8 version.
## Spec All the Things

Before looking at the code, let’s see what ECMAScript 2020 specification [says](https://262.ecma-international.org/11.0/#sec-math.random) about `Math.random()` function:

> Returns a Number value with positive sign, greater than or equal to 0 but less than 1, chosen randomly or pseudo randomly with approximately uniform distribution over that range, using an implementation-dependent algorithm or strategy. This function takes no arguments.
> 
> Each Math.random function created for distinct realms must produce a distinct sequence of values from successive calls.

Ehmm, that’s not much. It appears that the spec leaves a lot of freedom for the implementers, like JS engines, leaving security-related aspects out of scope.

No luck with the spec and now, with a clean conscience, we can dive into V8 source code.

## The Nitty-gritty Details

Our journey starts from the `Math.random()` [code](https://github.com/nodejs/node/blob/52f9aafeab02390ff78447a390651ec6ed94d166/deps/v8/src/builtins/math.tq#L439) written in [Torque language](https://v8.dev/docs/torque):

```torque
// ES6 #sec-math.random
extern macro RefillMathRandom(NativeContext): Smi;

transitioning javascript builtin
MathRandom(js-implicit context: NativeContext, receiver: JSAny)(): Number {
  let smiIndex: Smi = *NativeContextSlot(ContextSlot::MATH_RANDOM_INDEX_INDEX);
  if (smiIndex == 0) {
    // refill math random.
    smiIndex = RefillMathRandom(context);
  }
  const newSmiIndex: Smi = smiIndex - 1;
  *NativeContextSlot(ContextSlot::MATH_RANDOM_INDEX_INDEX) = newSmiIndex;

  const array: FixedDoubleArray =
      *NativeContextSlot(ContextSlot::MATH_RANDOM_CACHE_INDEX);
  const random: float64 =
      array.floats[Convert<intptr>(newSmiIndex)].ValueUnsafeAssumeNotHole();
  return AllocateHeapNumberWithValue(random);
}
```

We can see that `Math.random()` (`MathRandom` here) calls the `RefillMathRandom` macro defined elsewhere (see `extern macro`). We’ll see what this macro does a bit later.

Next, we see that the value (`random` number) is not generated directly, but instead returned from a fixed-size array (`array` variable). Let’s call this array “entropy pool” (or simply “pool”) to make it recognizable through the rest of the text. The index (`newSmiIndex` integer) is decremented on each call and periodically, when it becomes zero, the `RefillMathRandom` macro gets called which intuitively should refill the pool, but we’re not sure about that yet.

The `MathRandom` macro is [defined](https://github.com/nodejs/node/blob/52f9aafeab02390ff78447a390651ec6ed94d166/deps/v8/src/codegen/code-stub-assembler.cc#L13856) in the `CodeStubAssembler` C++ class and does not contain anything spectacular. It simply calls the `MathRandom::RefillCache` method through an [external reference](https://github.com/nodejs/node/blob/52f9aafeab02390ff78447a390651ec6ed94d166/deps/v8/src/codegen/external-reference.cc#L771). Hence, [the code](https://github.com/nodejs/node/blob/52f9aafeab02390ff78447a390651ec6ed94d166/deps/v8/src/numbers/math-random.cc#L35) we expect to refill the entropy pool is written in C++ and looks more or less like the following:

```cpp
Address MathRandom::RefillCache(Isolate* isolate, Address raw_native_context) {
  // ...
  State state = pod.get(0);
  // #1: Initialize state if not yet initialized.
  if (state.s0 == 0 && state.s1 == 0) {
    uint64_t seed;
    isolate->random_number_generator()->NextBytes(&seed, sizeof(seed));
    state.s0 = base::RandomNumberGenerator::MurmurHash3(seed);
    state.s1 = base::RandomNumberGenerator::MurmurHash3(~seed);
    // ...
  }

  FixedDoubleArray cache = FixedDoubleArray::cast(native_context.math_random_cache());
  // #2: Generate random numbers using xorshift128+.
  for (int i = 0; i < kCacheSize; i++) {
    base::RandomNumberGenerator::XorShift128(&state.s0, &state.s1);
    cache.set(i, base::RandomNumberGenerator::ToDouble(state.s0));
  }
  pod.set(0, state);

  Smi new_index = // ...
  return new_index.ptr();
}
```

The above code is trimmed and simplified for readability purposes. As we expected, its overall logic is to generate and refill the entropy pool (the `cache` array). But there are a couple of other interesting details here.

First of all, block #1 from the snippet describes the initialization of the seed to be used in the subsequent number generation. This block runs only once and uses the PRNG available in the current V8 [isolate](https://v8.dev/blog/embedded-builtins#isolate--and-process-independent-code) to generate the seed. Then it calculates [murmur3](https://en.wikipedia.org/wiki/MurmurHash) hash codes based on the seed and stores it in the initial state.

The [PRNG](https://github.com/nodejs/node/blob/52f9aafeab02390ff78447a390651ec6ed94d166/deps/v8/src/base/utils/random-number-generator.cc#L32) can be supplied by embedders, like Node.js or Chromium browser. If a PRNG is not supplied by the embedder, V8 falls back to a system-dependent source of randomness, like `/dev/urandom` in Linux.

Then, block #2 uses the state struct to generate and fill all `kCacheSize` values in the pool with a [xorshift128+](https://v8.dev/blog/math-random) random number generator. The size of the pool is 64, i.e. after each 64 `Math.random()` calls the pool needs to be refilled.

Our takeaways here are the following. First, despite the fact that the initial seed used by `Math.random()` function may be generated with a cryptographically secure PRNG (note: that depends on the embedder and/or OS), the subsequent number generation doesn’t involve this PRNG. Instead, it uses xorshift128+ which is a fast random number generator algorithm, but it’s not cryptographically secure. Thus, we have found proof of the general wisdom and, indeed, V8’s implementation of `Math.random()` is not supposed to be used for security stuff.

Second, it also means that the generated number sequence will be deterministic in the case of the same initial seed value. Luckily, V8 supports the `--random_seed` flag to override the initial seed, so let’s see if our thinking is correct.

```shell
$ node --random_seed=42
Welcome to Node.js v16.0.0-pre.
Type ".help" for more information.
> Math.random()
0.7939112874678715
> for (let i = 0; i < 1000; i++) Math.random();
0.6681221903420669
> Math.random()
0.009229884165582902
> 
$ node --random_seed=42
Welcome to Node.js v16.0.0-pre.
Type ".help" for more information.
> Math.random()
0.7939112874678715
> for (let i = 0; i < 1000; i++) Math.random();
0.6681221903420669
> Math.random()
0.009229884165582902
> 
```

As expected, we used 42 as the seed value in two separate Node.js [REPL](https://nodejs.org/api/repl.html) sessions, and both times `Math.random()` produced exactly the same sequence of numbers.

Now, when we have a better understanding of the implementation, let’s try to understand the performance aspect of the entropy pool.
## Some Silly Benchmarks

Before we go any further, I need to warn you that the following microbenchmarks are totally non-scientific, unfair benchmarks, so take them with a grain of salt. Benchmarks were done on my dev machine with i5–8400H CPU, Ubuntu 20.04, and Node.js v16.0.0-pre (commit 52f9aaf).

Our microbenchmark is terribly simple this time:

```js
'use strict'

const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

suite.add('Math.random', Math.random)

suite
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Benchmark is complete')
  })
  .run({ 'async': false })
```

When run, it calls `Math.random()` in a loop and outputs the resulting throughput.

Armed with the benchmark, we’re going to compare `kCacheSize=64` (the default) and `kCacheSize=1` (no pool) builds of Node.js. Here is the measured result.

![](05-math-random-benchmark.webp)

The benchmark shows that removing the pool makes `Math.random()` 22% slower. The difference is relatively small, yet the pool improves the throughput by removing the overhead of JS-to-C++ switches in each `Math.random()` call. Interestingly, that [uuid](https://github.com/uuidjs/uuid/pull/513) npm package and, later, [crypto.randomUUID()](https://github.com/nodejs/node/pull/36729) standard function from Node.js also employ a similar approach with the entropy pool (note: the difference is that they use a CSPRNG and the performance boost is much more significant).

It’s time to wrap up and summarize our findings.

## 