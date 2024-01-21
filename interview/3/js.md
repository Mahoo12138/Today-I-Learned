# 第3天 去除字符串中最后一个指定的字符

## 我的答案

```js
function trimLastChar(str, char){
    let index = str.lastIndexOf(char);
    str.substring(0, index) + str.substring(index + 1, str.length);
}
```

## 社区答案

```js
function delLast(str,target) {
  let reg = new RegExp(`${target}(?=([^${target}]*)$)`)
  return str.replace(reg,'')
}
```

```js
function delLast(str, target) {
  return str.split('').reverse().join('').replace(target, '').split('').reverse().join('');
}
// 如果 pattern 是字符串，则只会替换第一个匹配项。所以先反转替换后还原。
const str = delLast('asdfghhj', 'h')
```