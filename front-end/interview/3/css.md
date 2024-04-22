# 第3天 在页面上隐藏元素的方法有哪些？
## 我的答案

+ `display: none;`
+ 



## 社区答案

### 占位

- `visibility: hidden;`
- `margin-left: -100%;`
- `opacity: 0;`
- `transform: scale(0);`

### 不占位

- `display: none;`
- `width: 0; height: 0; overflow: hidden;`

### 位置

+ `z-index:-99999999999`
+ `position: absolute; top:-9999px; left:-9999px;`