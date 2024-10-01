---
title: 搜索二叉树
date: 2022-06-16 09:46:49
mathjax: true
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/algorithm/20210418160102.png
tags:
  - 数据结构与算法
categories:
  - 学习笔记
---

## 思考

如何在 n 个动态的整数中搜索某个整数？（检测其是否存在）

Ⅰ. 考虑使用动态数组存放元素，从第 0 个位置开始遍历搜索，**平均时间复杂度：O(n)**

| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 33   | 66   | 18   | 28   | 16   | 52   | 95   | 45   | 86   | 71   |

Ⅱ. 如果是一个有序的动态数组，使用**二分搜索**，最坏的时间复杂度：**O(logn)**；添加和删除的平均时间复杂度是**O(n)**；

> 数据规模不断减半，时间复杂度一般为 O(logn)；

| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 15   | 17   | 20   | 28   | 31   | 46   | 57   | 68   | 85   | 94   |

针对这个需求是否有更好的办法？

**使用二叉搜索树**，添加、删除、搜索额最坏时间复杂度均可优化至：O(logn)；

## 二叉搜索树

二叉搜索树是二叉树的一种,是应用非常广泛的一种二叉树，英文简称为BST，又被称为二叉查找树、二叉排序；

+ 树任意一个节点的值都大于其左子树所有节点的值；
+ 任意一个节点的值都小于其右子树所有节点的值；
+ 它的左右子树也是一棵二叉搜索树；
+ 二叉搜索树存储的元素必须具有可比较性；

### 接口设计

```java
int size()						// 元素的数量
boolean isEmpty()				// 是否为空
void clean() 					// 清空所有元素
void add(E element) 			// 添加元素
void remove (E element) 		// 删除元素
boolean contains (E element)	// 是否包含某元素
```

通过接口可以看出，对于目前这个二叉树来说，元素是**没有索引的概念**的；

## 结构设计

首先，新建的二叉搜索树 `BinarySearchTree` 类，在其中需要有几个基础的属性：

+ `size`：保存节点的变量；
+ `root`：根节点的变量，二叉搜索树的操作都需要从根节点开始；
+ `elementNotNullCheck`：检查节点元素是否为空的方法；

```java
private int size;
private Node<E> root;

private void elementNotNullCheck(E e) {
    if(e == null) {
        throw new IllegalArgumentException("element must not be null");
    }
}
```

### 节点设计

在 `BinarySearchTree` 类中，需要创建一个内部类进行节点的维护，内部包括左右节点和父节点，以及存储的元素，以及后序所需要的两个方法，在构造时只需传入元素值和父节点即可：

```java
private static class Node<E>{
    E element;
    Node<E> left;
    Node<E> right;
    Node<E> parent;

    public Node(E e, Node<E> n) {
        this.element = e;
        this.parent = n;
    }
    public boolean isLeaf() {
        return left == null && right == null;
    }

    public boolean isTwoChildren() {
        return left != null && right != null;
    }
}
```

## 比较逻辑

### Comparable 接口

所有传入二叉搜索树的元素都必须实现 Comparable 接口：

```java
public interface Comparable<E> {
    int compareTo(E e);
}

public class BinarySearchTree<E extends Comparable> {
    int compare(E e1, E e2) {
        return e1.compareTo(e2);
    }
}
```

但是传入的对象实现了 Comparable  接口后，其比较逻辑其实是被限制无法改变了，如需要针对同一个对象根据其他属性进行比较是无法实现的；

### Comparator 接口

要求在构造二叉搜索树时，必须传入一个 Comparator  比较器，

```java
public interface Comparator<E> {
    int compare(E e1, E e2);
}

public class BinarySearchTree<E> {
    private Comparator<E> comparator;

    public BinarySearchTree3(Comparator<E> comparator){
        this.comparator = comparator;
    }
   int compare(E e1,E e2) {
		return comparator.compare(e1, e2);
	}
}
```

通过比较器虽然可以自定义比较逻辑，但是这样未免过于激进，不应该强制传入比较器，而应有其默认的比较逻辑；综上，**结合二者的方法**即是比较合理的实现：

```java
public class BinarySearchTree<E> {
    private Comparator<E> comparator;

    public BinarySearchTree(){
        this(null);
    }

    public BinarySearchTree(Comparator<E> comparator){
        this.comparator = comparator;
    }
    private int compare(E e1, E e2) {
        if(comparator != null) {
            return comparator.compare(e1, e2);
        }
        return ((Comparable<E>) e1).compareTo(e2);
    }
}
```

需要注意的是，上述代码中没有要求传入的元素必须实现 Comparable 接口，因为 BinarySearchTree 类默认当作元素已经实现了该接口；

## 添加逻辑

基本思路：

+ 先判断是否存在根节点，无则赋值为根节点；
+ 根据根节点，通过与插入元素比较，找到对应的父节点；
+ 创建新节点，通过 `parent.left = node` 或者 `parent.right = node`
+ 相同的值，如何处理？
  + 直接返回；
  + 覆盖原有的值（推荐）；

```java
void add(E element) {
    elementNotNullCheck(element);	// 检查 null
    if(root == null) {	// 判断是为空二叉树
        root = new Node<E>(element, null); 
        return;
    }

    Node<E> node = root;	// 寻找临时节点
    Node<E> parent = root;	// 父节点
    int cmp = 0;			// 比较结果

    while(node != null) {	// 判断条件：直到找到元素位置为 null 时
        parent = node;		// 保存父节点，在构造节点插入时需要
        cmp = compare(element, node.element);
        if(cmp > 0) {
            node = node.right;
        }else if(cmp < 0) {
            node = node.left;
        }else {
            node.element = element;
            return;		// 相等
        }
    }
    Node<E> newNode = new Node<>(element, parent);
    if(cmp > 0) {	// 判断插入左支还是右支
        parent.right = newNode;
    }else {
        parent.left = newNode;
    }
    size++;
}
```

 ## 遍历逻辑

根据节点的访问顺序的不同，可分为四种：

+ 前序遍历 (Preorder Traversal)：根节点，前序左子树，再前序右子树；
+  中序遍历 (Inorder Traversal)：中序左子树，根节点，中序右子树，可选为升序或降序；
+ 后序遍历 (Postorder Traversal)：后序左子树，后序右子树，根节点；
+ 层序遍历 (Level Order Traversal)：从上往下，从左往右，以此访问每一个节点；

### 前序遍历

递归方法：

```java
private void preorderTraversal(Node<E> node) {
    if(node == null) return;
    System.out.println(node.element);
    preorderTraversal(node.left);
    preorderTraversal(node.right);
}
```



### 中序遍历

递归方法：

```java
private void inorderTraversal(Node<E> node) {
    if(node == null) return;
    inorderTraversal(node.left);
    System.out.println(node.element);
    inorderTraversal(node.right);
}
```



### 后序遍历

递归方法：

```java
private void postorderTraversal(Node<E> node) {
    if(node == null) return;
    postorderTraversal(node.left);
    postorderTraversal(node.right);
    System.out.println(node.element);
}
```



### 层序遍历

实现思路：使用队列

1. 将根节点入队
2. 循环执行以下操作，直到队列为空
   + 将队头节点出队，进行访问
   + 将头节点的左子节点入队；
   + 将头节点的右子节点入队；

```java
public void levelOrderTraversal() {
    if(root == null) return;

    Queue<Node<E>> queue = new LinkedList<>();

    queue.offer(root);

    while(!queue.isEmpty()) {
        Node<E> node = queue.poll();
        System.out.println(node.element);

        if(node.left != null) {
            queue.offer(node.left);
        }

        if(node.right != null) {
            queue.offer(node.right);
        }
    }
}
```

## 遍历接口设计

使用一个 `Visitor` 抽象类，将用户对二叉搜索树遍历时的访问逻辑包裹传入；为什么不使用接口呢，因为需要一个 flag 进行存储是否继续遍历：

```java
public static abstract class Visitor<E> {
    boolean stop;
    abstract boolean visit(E element);
}
```

在层序遍历中，我们可以很简单地实现自定义遍历过程：

```java
public void levelOrder(Visitor<E> visitor) {
    if(root == null) return;
    Queue<Node<E>> queue = new LinkedList<>();
    queue.offer(root);
    while(!queue.isEmpty()) {
        Node<E> node = queue.poll();
        boolean stop = visitor.visit(node.element);
        // 在完成一个元素操作后，根据返回值判断是否继续
        if(stop) return ;
        if(node.left != null) {
            queue.offer(node.left);
        }
        if(node.right != null) {
            queue.offer(node.right);
        }
    }
}
```

而在其他几种遍历中，需要借助于抽象类存储的 flag，需要注意的是进行判断的位置：

```java
private void preorder(Node<E> node, Visitor<E> visitor) {
    if(node == null || visitor.stop) return;

    visitor.stop = visitor.visit(node.element);

    preorder(node.left, visitor);
    preorder(node.right, visitor);
}

private void postorder(Node<E> node, Visitor<E> visitor) {
    if(node == null || visitor.stop) return;

    preorder(node.left, visitor);
    preorder(node.right, visitor);
    
    if(visitor.stop) return;
    visitor.stop = visitor.visit(node.element);
}

private void inorder(Node<E> node, Visitor<E> visitor) {
    if(node == null || visitor.stop) return;

    preorder(node.left, visitor);
    if(visitor.stop) return;
    visitor.stop = visitor.visit(node.element);
    preorder(node.right, visitor);
}
```

### 遍历的应用

+ 前序遍历：树状结构展示(注意左右子树的顺序)
+ 中序遍历：二叉搜索树的中序遍历按升序或者降序处理节点
+ 后序遍历：适用于一些先子后父的操作
+ 层序遍历：计算二叉树的高度；判断是否一个完全二叉树

## 练习

  ### 计算二叉树的层数

递归方法：

每一次函数调用，返回该节点左右子节点层数中最大值加一，递归停止条件为，传入的子节点为`null` 时，说明已经是叶子节点，层数返回 0；

```java
private int height(Node<E> node) {
    if(node == null) return 0;
    return 1 + Math.max(height(node.left),height(node.right));
}
```

迭代方法（层序遍历）：

使用 `height` 存储层数， `levelSize` 存储每一层元素个数，初始值为 1，当出队一次减一，每次迭代节点入队时检测是否为零，为零则说明该层已经迭代完毕，可将下一层元素数量赋值给 `levelSize`，层数 `height` 加一，层序遍历完毕后，返回层数；

```java
public int height() {
		if(root == null) return 0;

		Queue<Node<E>> queue = new LinkedList<>();
		int height = 0;
		queue.offer(root);
		int levelSize = 1;

		while(!queue.isEmpty()) {
			Node<E> node = queue.poll();
			
			levelSize--;
			
			if(node.left != null) {
				queue.offer(node.left);
			}
			if(node.right != null) {
				queue.offer(node.right);
			}
			if(levelSize == 0) {
				levelSize = queue.size();
				height++;
			}
		}
		return height;
	}
```

### 完全二叉树的判断

根据完全二叉树的特点（从上到下，从左到右，依次排列），我们可以很自然地可以想到，利用层序遍历对其判断，遍历节点时，共有四种情况，分别是：

+ 树为空，返回 false

+ `node.left != null && node.right != null`，将 node.left，node.right 按顺序入队
+ `node.left == null && node.right != null`，返回 false
+ `node.left != null && node.right == null` 或者 `node.left == null && node.right == null`

最后一种情况较为特殊，这种情况下，说明该节点是一个分水岭节点，之前的节点都是度为 2 的节点，之后的节点都必须是度为 1，即叶子节点，才满足完全二叉树的条件；

此时需要设置一个 flag 对之后遍历的节点进行判断，是否为叶子节点；

```java
public boolean isComplete() {
    if(root == null) return false;
    Queue<Node<E>> queue = new LinkedList<>();
    boolean leaf = false;
    queue.offer(root);

    while(!queue.isEmpty()) {
        Node<E> node = queue.poll();

        if(leaf && !node.isLeaf()) return false;

        if(node.left != null && node.right != null) {
            queue.offer(node.left);
            queue.offer(node.right);
        }else if(node.left == null && node.right != null) {
            return false;
        }else {
            leaf = true;
            if(node.left != null) {
                queue.offer(node.left);
            }
        }
    }
    return true;
}
```

 这样其实是偏离了层序遍历的内在逻辑的，可以重构一下，减少代码量和重复判断 ：

+ 如果树为空，返回 false ；
+ 如果 node.left != null，将 node.left 入队
+ 如果 node.left == null && node.right!=null，返回 false
+ 如果 node.right != null，将 node.right 入队
+ 如果 node.right == null，分界点，设置 flag

```java
if(node.left != null) {
    queue.offer(node.left);
}else if (node.right != null){
    return false;
}

if(node.right != null) {
    queue.offer(node.right);
}else {	// node.right == null
    leaf = true;
}
```

### 二叉树的翻转

问题核心在于，二叉树的遍历，只要在二叉树的每一个节点上，对左右子树进行交换即可：

```java
TreeNode temp = node.left;
node.left = node.right;
node.right = temp;
```

而对于中序遍历来说，交换当前节点发生于左右子树递归之间，左右子树的引用已发生更换，两次需要递归同一个变量；

## 其他概念

### 前驱节点

中序遍历中的前一个节点； 

如果是二叉搜索树，前驱节点则是前一个比它小的节点，而且是左子树中的最大节点；

 通过观察，可发现，针对任意的二叉树， 任意节点的前驱节点可分为四种情况：

+ 左子节点不为空，前驱节点为其左子树的最右侧的节点；
+ 左子节点为空且父节点不为空，前驱节点为其父节点上溯到父节点的右子树位置，即该父节点；
+ 在第二种情况基础上，上溯父节点直到为空，则无前驱节点；
+ 左子节点为空，且父节点也为空，无前驱节点；

```java
private Node<E> predecessor(Node<E> node){
    if(node == null) return null;
    Node<E> p = node.left;
    if(p != null) {
        while(p.right != null) {
            p = p.right;
        }
        return p;
    }
    while(node.parent != null && node == node.parent.left) {
        node = node.parent;
    }
    return node.parent;
}
```

### 后继节点

后继节点：中序遍历时的后一个节点；

如果是二叉搜索树，后继节点就是后一个比它大的节点，且是右子树中最小的节点； 

其中，后继节点于前驱节点基本相反，实现类似，只需更改方向：

```java
private Node<E> successor(Node<E> node){
    if(node == null) return null;
    Node<E> p = node.right;
    if(p != null) {
        while(p.left != null) {
            p = p.left;
        }
        return p;
    }
    while(node.parent != null && node == node.parent.right) {
        node = node.parent;
    }
    return node.parent;
}
```

## 删除逻辑

### 度为 0 节点

叶子节点，直接删除；具体直接将父节点的左/右子节点设置为 null ；

### 度为 1 节点

用子节点替代待删除节点的位置：具体操作将待删除节点的父节点的左/右子节点直线待删除节点的左/右子节点；

如果待删除节点是根节点，即直接将 root 变量指向根节点的左/右子节点；

### 度为 2 节点

常见的做法是，使用待删除节点和前驱节点或后继节点，覆盖待删除的结点，再删除相应的前驱/后继节点；

因为若一个节点的度为 2，那么它的前驱或者后继节点的度只能是 0 或 1；原因在于，前驱和后继节点的查找特点；

### 具体实现

```java
private void remove(Node<E> node) {
    if(node == null) return ;
    if(node.isTwoChildren()) {	// 度为 2 的节点
        Node<E> s = successor(node);
        node.element = s.element;	// 覆盖值
        node = s;	// 把后继节点赋给待删除节点，做统一处理
    }
    Node<E> replace = node.left == null ? node.right : node.left;

    if(replace != null) {	// 度为 1
        replace.parent = node.parent;	// 统一处理
        if(node.parent == null) {	// 根节点
            root = replace;
        } else if(node == node.parent.left) {
            node.parent.left = replace;
        } else {
            node.parent.right = replace;
        }
    } else if (node.parent == null){	// 根节点
        root = null;
    } else {	// 度为0，叶子节点
        if(node == node.parent.left) {
            node.parent.left = null;
        }else {
            node.parent.right = null;
        }
    }
}
```

其中包含一个查找元素的方法：

```java
private Node<E> node(E element){
    Node<E> node = root;
    while(node != null) {
        int cmp = compare(element, node.element);
        if(cmp == 0) return node;
        if(cmp > 0) {
            node = node.right;
        }else {
            node = node.left;
        }
    }
    return null;
}
```

## 复杂度分析

查找、添加，删除的时间复杂度都是 O(h) = O(logn)，也就是跟树的高度有关；

如果是，从小到大添加元素，，那么二叉搜索树会退化成链表，那么时间复杂度会变成 O(h) = O(n)；

二者的性能会造成显著差距；此外，删除节点也会造成二叉树退化成链表；

有什么方法可以防止二叉树退化成链表呢？

## 平衡二叉树

**平衡**：当节点数量固定时，左右子树的高度越接近，这棵二叉树就越平衡（高度越低）；

**理想平衡**：即类似于完全二叉树和满二叉树，高度差是最小的；

### 改进二叉树

首先，节点的添加、删除顺序是无法限制的，可以认为是随机的；

所以改进方案是：在节点的添加、删除操作之后，想办法让二叉搜索树恢复平衡(减小树的高度)；

如果接着继续调整节点的位置，完全可以达到理想平衡，但是付出的代价可能会比较大口比如调整的次数会比较多，反而增加了时间复杂度；

总结来说，比较合理的改进方案是：用尽量少的调整次数达到适度平衡即可

一棵达到适度平衡的二叉搜索树，可以称之为：平衡二叉搜索树，简称为BBST。

常见的平衡二叉树有：AVL 树（在 Windows 内核中广泛使用）、红黑树（C++ STL，Linux 的进程调度等）

一般也称它们为：自平衡的二叉搜索树（Self-balance Binary Search Tree）。

