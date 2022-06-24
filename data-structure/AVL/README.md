## 基本概念

AVL 是最早发明的自平衡二叉搜索树之一，名称来源于 G. M. **A**delson-**V**elsky 和 E. M. **L**andis (两位来自苏联的科学家)；

**平衡因子**：某节点的左右子树的高度差；

而在 AVL 树中每个节点的平衡因子只能是 1，0，-1；

即绝对值 ≤ 1，大于 1 则称之为**失衡**；也就是说每个节点的左右子树高度差不超过 1；搜索、添加、删除的时间复杂度是 O(logn)；

## 添加失衡

当在二叉搜索树中添加一个元素时，最坏的情况可能会导致所有祖先都失衡，父节点其他的非祖先节点不会失衡；

添加导致的失衡可以通过旋转节点进行调整高度，达到重新平衡，有四种情况：

### LL - 右旋转

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/algorithm/LL.png)

首先解释一下这个分类名称，**LL** 表示新添加的节点 n 是在由其导致失衡的最近的祖先节点即 g 节点的 left 的 left 处；而有右旋转是将这种失衡状态重新平衡的方法，即：

+ `g.left = p.right`
+ `p.right = g`
+ 让 p 成为该子树的根节点
+ 维护 parent 以及更新节点高度

经过旋转之后，仍然是一颗二叉搜索树：T0 < n < T1 < p < T2 < g < T3；

### RR - 左旋转

![RR](D:\Workbench\每日学习\data-structure\AVL\res\RR.png)

+ `g.right= p.left`
+ `p.left= g`
+ 让 p 成为该子树的根节点；
+ 维护 parent 以及更新节点高度；

### LR - 左旋转，右旋转

![](D:\Workbench\每日学习\data-structure\AVL\res\LR.png)

经过两次旋转：先将 p 节点左旋，即形成 LL 情况，再右旋 g 节点；

### RL - 右旋转，左旋转

![](D:\Workbench\每日学习\data-structure\AVL\res\RL.png)

经过两次旋转：先将 p 节点右旋，即形成 RR 情况，再左旋 g 节点；

## 失衡调整

