---
title: 数据结构与算法学习之搜索二叉树
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

在 `BinarySearchTree` 类中，需要创建一个内部类进行节点的维护，内部包括左右节点和父节点，以及存储的元素，在构造时只需传入元素值和父节点即可：

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

