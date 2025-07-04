## 数字类型

ECMAScript 中的 Number 类型使用 **IEEE754** 标准来表示整数和浮点数值。所谓 IEEE754 标准，全称 IEEE 二进制浮点数算术标准，这个标准定义了表示浮点数的格式等内容。

在 IEEE754 中，规定了四种表示浮点数值的方式：单精确度（32位）、双精确度（64位）、延伸单精确度、与延伸双精确度。像 ECMAScript 采用的就是双精确度，也就是说，会用 64 位来储存一个浮点数。

### 浮点数转二进制

我们来看下 1020 用十进制的表示：

> 1020 = **1** * 10^3 + **0** * 10^2 + **2** * 10^1 + **0** * 10^0

所以 1020 用十进制表示就是 1020……(哈哈)

如果 1020 用二进制来表示呢？

> 1020 = **1** * 2^9 + **1** * 2^8 + **1** * 2^7 + **1** * 2^6 + **1** * 2^5 + **1** * 2^4 + **1** * 2^3 + **1** * 2^2 + **0** * 2^1 + **0** * 2^0

所以 1020 的二进制为 `1111111100`

那如果是 0.75 用二进制表示呢？同理应该是：

> 0.75 = a * 2^-1 + b * 2^-2 + c * 2^-3 + d * 2^-4 + ...

因为使用的是二进制，这里的 abcd……的值的要么是 0 要么是 1。

那怎么算出 abcd…… 的值呢，我们**可以两边不停的乘以 2 算出来**，解法如下：

> 0.75 = a * 2^-1 + b * 2^-2 + c * 2^-3 + d * 2^-4...

两边同时乘以 2

> 1 + 0.5 = a * 2^0 + b * 2^-1 + c * 2^-2 + d * 2^-3... (所以 a = 1)

剩下的：

> 0.5 = b * 2^-1 + c * 2^-2 + d * 2^-3...

再同时乘以 2

> 1 + 0 = b * 2^0 + c * 2^-2 + d * 2^-3... (所以 b = 1)

所以 0.75 用二进制表示就是 0.ab，也就是 0.11

然而不是所有的数都像 0.75 这么好算，我们来算下 0.1：

```
0.1 = a * 2^-1 + b * 2^-2 + c * 2^-3 + d * 2^-4 + ...

0 + 0.2 = a * 2^0 + b * 2^-1 + c * 2^-2 + ...   (a = 0)
0 + 0.4 = b * 2^0 + c * 2^-1 + d * 2^-2 + ...   (b = 0)
0 + 0.8 = c * 2^0 + d * 2^-1 + e * 2^-2 + ...   (c = 0)
1 + 0.6 = d * 2^0 + e * 2^-1 + f * 2^-2 + ...   (d = 1)
1 + 0.2 = e * 2^0 + f * 2^-1 + g * 2^-2 + ...   (e = 1)
0 + 0.4 = f * 2^0 + g * 2^-1 + h * 2^-2 + ...   (f = 0)
0 + 0.8 = g * 2^0 + h * 2^-1 + i * 2^-2 + ...   (g = 0)
1 + 0.6 = h * 2^0 + i * 2^-1 + j * 2^-2 + ...   (h = 1)
....
```

然后你就会发现，这个计算在不停的循环，所以 0.1 用二进制表示就是 0.00011001100110011……

### 浮点数的存储

虽然 0.1 转成二进制时是一个无限循环的数，但计算机总要储存吧，我们知道 ECMAScript 使用 64 位来储存一个浮点数，那具体是怎么储存的呢？这就要说回 IEEE754 这个标准了，毕竟是这个标准规定了存储的方式。

这个标准认为，一个浮点数 (Value) 可以这样表示：

> Value = sign * exponent * fraction

看起来很抽象的样子，简单理解就是科学计数法……

比如 -1020，用科学计数法表示就是:

> -1 * 10^3 * 1.02

sign 就是 -1，就是 10^3，fraction 就是 1.02

对于二进制也是一样，以 0.1 的二进制 0.00011001100110011…… 这个数来说：

可以表示为：

> 1 * 2^-4 * 1.1001100110011……

其中 sign 就是 1，exponent 就是 2^-4，fraction 就是 1.1001100110011……

而当只做二进制科学计数法的表示时，这个 Value 的表示可以再具体一点变成：

> V = (-1)^S * (1 + Fraction) * 2^E

(如果所有的浮点数都可以这样表示，那么我们存储的时候就把这其中会变化的一些值存储起来就好了)

我们来一点点看：

`(-1)^S` 表示符号位，当 S = 0，V 为正数；当 S = 1，Value 为负数。

再看 `(1 + Fraction)`，这是因为所有的浮点数都可以表示为 1.xxxx * 2^xxx 的形式，前面的一定是 1.xxx，那干脆我们就不存储这个 1 了，直接存后面的 xxxxx 好了，这也就是 Fraction 的部分。

最后再看 `2^E`：

如果是 1020.75，对应二进制数就是 1111111100.11，对应二进制科学计数法就是 1 * 1.11111110011 * 2^9，E 的值就是 9，而如果是 0.1 ，对应二进制是 1 * 1.1001100110011…… * 2^-4， E 的值就是 -4，也就是说，E 既可能是负数，又可能是正数，那问题就来了，那我们该怎么储存这个 E 呢？

我们这样解决，假如我们用 8 位来存储 E 这个数，如果只有正数的话，储存的值的范围是 0 ~ 254，而如果要储存正负数的话，值的范围就是 -127~127，我们在存储的时候，把**要存储的数字加上 127**，这样当我们存 -127 的时候，我们存 0，当存 127 的时候，存 254，这样就解决了存负数的问题。对应的，当取值的时候，我们再减去 127。

所以呢，真到实际存储的时候，我们并不会直接存储 E，而是会**存储 E + bias**，当用 8 位的时候，这个 bias 就是 127。

所以，如果要存储一个浮点数，我们存 S 和 Fraction 和 E + bias 这三个值就好了，那具体要分配多少个位来存储这些数呢？

IEEE754 给出了标准：

+ 1 位存储 S，0 表示正数，1 表示负数。

+ 11 位存储 E + bias，对于 11 位来说，bias 的值是 2^(11-1) - 1，也就是 1023。

+ 用 52 位存储 Fraction。

> V = (-1) ^ S × (1 + F) × 2 ^ (E + 1023)

举个例子，就拿 0.1 来看，对应二进制是 1 * 1.1001100110011…… * 2^-4， Sign 是 0，E + bias 是 -4 + 1023 = 1019，1019 用二进制表示是 1111111011，Fraction 是 1001100110011 ……

对应 64 位的完整表示就是：

> 0 01111111011 1001100110011001100110011001100110011001100110011010

同理, 0.2 表示的完整表示是：

> 0 01111111100 1001100110011001100110011001100110011001100110011010

所以当 0.1 存下来的时候，就已经发生了精度丢失，当我们用浮点数进行运算的时候，使用的其实是精度丢失后的数。

### 浮点数的运算

关于浮点数的运算，一般由以下五个步骤完成：对阶、尾数运算、规格化、舍入处理、溢出判断。我们来简单看一下 0.1 和 0.2 的计算。

首先是对阶，所谓对阶，就是把阶码调整为相同，比如 0.1 是 `1.1001100110011…… * 2^-4`，阶码是 -4，而 0.2 就是 `1.10011001100110...* 2^-3`，阶码是 -3，两个阶码不同，所以先调整为相同的阶码再进行计算，调整原则是小阶对大阶，也就是 0.1 的 -4 调整为 -3，对应变成 `0.11001100110011…… * 2^-3`

接下来是尾数计算:

```
  0.1100110011001100110011001100110011001100110011001101
+ 1.1001100110011001100110011001100110011001100110011010
————————————————————————————————————————————————————————
 10.0110011001100110011001100110011001100110011001100111
```

我们得到结果为 `10.0110011001100110011001100110011001100110011001100111 * 2^-3`

将这个结果处理一下，即结果规格化，变成 `1.0011001100110011001100110011001100110011001100110011(1) * 2^-2`

括号里的 1 意思是说计算后这个 1 超出了范围，所以要被舍弃了。

再然后是舍入，四舍五入对应到二进制中，就是 0 舍 1 入，因为我们要把括号里的 1 丢了，所以这里会进一，结果变成

```
1.0011001100110011001100110011001100110011001100110100 * 2^-2
```

本来还有一个溢出判断，因为这里不涉及，就不讲了。

所以最终的结果存成 64 位就是

> 0 01111111101 0011001100110011001100110011001100110011001100110100

将它转换为10进制数就得到 `0.30000000000000004440892098500626`

因为两次存储时的精度丢失加上一次运算时的精度丢失，最终导致了 0.1 + 0.2 !== 0.3

```js
// 十进制转二进制
parseFloat(0.1).toString(2);
=> "0.0001100110011001100110011001100110011001100110011001101"

// 二进制转十进制
parseInt(1100100,2)
=> 100

// 以指定的精度返回该数值对象的字符串表示
(0.1 + 0.2).toPrecision(21)
=> "0.300000000000000044409"
(0.3).toPrecision(21)
=> "0.299999999999999988898"
```

### 浮点数的指数缩放

1. **在 [1,2) 区间** (指数固定为 1023)
   - **尾数范围**：52 位二进制，对应 $$0∼(1−2^{−52})$$
   - **可表示数字数量**：$$2^{52}$$个
   - **均匀间隔**：固定步长 $$2^{-52}$$ (即 JavaScript 中的 `Number.EPSILON`)
   - 示例序列：
     $$1.0, 1+2^{−52}, 1+2×2^{−52}, ... ,1.9999999999999998$$
2. **在其他量级区间** (如 [2,4) 区间)
   - **指数变化**：指数增加 1 → 值范围扩大一倍
   - **可表示数字数量**：仍然是 $$2^{52}$$个
   - **间隔变化**：步长变为 $$2^{-51}$$ (前一个区间的 2 倍)
   - 示例序列（[2,4) 区间）：
     $$2.0, 2+2^{−51}, 2+2×2^{−51}, ... ,3.9999999999999996$$

| 特性                    | [1,2) 区间  | [2,4) 区间    | [0.5,1) 区间    |
| :---------------------- | :---------- | :------------ | :-------------- |
| **指数偏移值**          | 1023        | 1024          | 1022            |
| **步长**                | $$2^{-52}$$ | $$2^{-51}$$   | $$2^{-53}$$     |
| **步长与 EPSILON 关系** | = EPSILON   | = 2 × EPSILON | = 0.5 × EPSILON |
| **可表示数字数量**      | $$2^{52}$$  | $$2^{52}$$    | $$2^{52}$$      |
| **覆盖范围**            | 1.0 → 2.0   | 2.0 → 4.0     | 0.5 → 1.0       |