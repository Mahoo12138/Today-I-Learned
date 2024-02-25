对于 `p:nth-child(2)` 表示这个元素要是 p 标签，且是第二个子元素，是两个必须满足的条件;
而 `·p:nth-of-type(2)` 表示父标签下的第二个 p 元素，显然，被选中的元素之前有多少其他元素，都不影响选中第二个 p 元素。

+ p:nth-child(-n+3)：匹配子元素中前三个 p 标签；
+ p:nth-child(0n+1)：子元素中第一个 p 标签，等价于与 `:first-child`；
+ p:nth-child(2n)：匹配子元素中的偶数位的 p 元素，等价于 `:nth-child(even)`；
+ p:nth-child(2n + 1)：匹配子元素中的奇数位的 p 元素，等价于 `:nth-child(odd)`；
+ 3n+4 匹配位置为 4、7、10、13...的元素