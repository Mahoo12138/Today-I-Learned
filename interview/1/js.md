# 用递归算法实现，生成数组长度为5且元素是随机数在2-32间不重复的值

这是一道大题目，把考点拆成了4个小项；需要侯选人用递归算法实现（限制15行代码以内实现；限制时间10分钟内完成）：
+ 生成一个长度为5的空数组 arr。
+ 生成一个（2－32）之间的随机整数 rand。
+ 把随机数 rand 插入到数组 arr 内，如果数组arr内已存在与rand相同的数字，则重新生成随机数 rand 并插入到 arr 内[需要使用递归实现，不能使用for/while等循环]
+ 最终输出一个长度为 5，且内容不重复的数组 arr。



```js
function buildArray(arr, length, min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!arr.includes(num)) { arr.push(num); }
    return arr.length === length ? arr : buildArray(arr, length, min, max);
}
var result = buildArray([], 5, 2, 32);
console.table(result);
``` 



