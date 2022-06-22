package com.mahoo;

import java.util.Comparator;
import java.util.LinkedList;
import java.util.Queue;

import com.mahoo.printer.BinaryTreeInfo;

public class BinarySearchTree<E> implements BinaryTreeInfo{
	private int size;
	private Node<E> root;
	private Comparator<E> comparator;
	
	public BinarySearchTree(){
		this(null);
	}
	
	public BinarySearchTree(Comparator<E> comparator){
		this.comparator = comparator;
	}
	
	//元素的数量
	int size() {
		return size;
	}
	//是否为空
	boolean isEmpty() {
		return size == 0;
	}
	// 清空所有元素
	void clean() {	
		
	}
	// 添加元素
	void add(E element) {
		elementNotNullCheck(element);
		if(root == null) {
			root = new Node<E>(element, null); 
			return;
		}
		
		Node<E> node = root;	//	寻找节点
		Node<E> parent = root;	//  父节点
		int cmp = 0;
		
		while(node != null) {
			parent = node;
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
		if(cmp > 0) {
			parent.right = newNode;
		}else {
			parent.left = newNode;
		}
		size++;
	}
	
	

	
	// 是否包含某元素
	boolean contains (E element) {
		return false;
	}
	
	// 元素比较
	private int compare(E e1, E e2) {
		if(comparator != null) {
			return comparator.compare(e1, e2);
		}
		return ((Comparable<E>) e1).compareTo(e2);
	}
	
	private void elementNotNullCheck(E e) {
		if(e == null) {
			throw new IllegalArgumentException("element must not be null");
		}
	}
	
	// 删除元素
	public void remove(E element) {
		remove(node(element));
	}
	
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

	public int height1() {
		return height(root);
	}
	
	public int height2() {
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
	
	private int height(Node<E> node) {
		if(node == null) return 0;
		return 1 + Math.max(height(node.left),height(node.right));
	}
	
	public boolean isComplete() {
		if(root == null) return false;
		Queue<Node<E>> queue = new LinkedList<>();
		boolean leaf = false;
		queue.offer(root);
		
		while(!queue.isEmpty()) {
			Node<E> node = queue.poll();
			
			if(leaf && !node.isLeaf()) return false;
			
//			if(node.left != null && node.right != null) {
//				queue.offer(node.left);
//				queue.offer(node.right);
//			}else if(node.left == null && node.right != null) {
//				return false;
//			}else {
//				leaf = true;
//				if(node.left != null) {
//					queue.offer(node.left);
//				}
//			}
//		}
//		return true;
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
		}
		return true;
		
	}
	
	public void preorder(Visitor<E> visitor) {
		if(root == null || visitor == null) return;
		preorder(root, visitor);

	}
	
	private void preorder(Node<E> node, Visitor<E> visitor) {
		if(node == null || visitor.stop) return;

		visitor.stop = visitor.visit(node.element);

		preorder(node.left, visitor);
		preorder(node.right, visitor);
	}
	
	public void preorderTraversal() {
		this.preorderTraversal(root);
	}
	
	private void preorderTraversal(Node<E> node) {
		if(node == null) return;
		System.out.print(node.element + " ");
		preorderTraversal(node.left);
		preorderTraversal(node.right);
	}
	
	public void inorderTraversal() {
		this.inorderTraversal(root);
	}
	
	private void inorderTraversal(Node<E> node) {
		if(node == null) return;
		inorderTraversal(node.left);
		System.out.println(node.element);
		inorderTraversal(node.right);
	}
	
	public void postorderTraversal() {
		this.postorderTraversal(root);
	}
	
	private void postorderTraversal(Node<E> node) {
		if(node == null) return;
		postorderTraversal(node.left);
		postorderTraversal(node.right);
		System.out.println(node.element);
	}
	
	public void levelOrderTraversal() {
		if(root == null) return;

		Queue<Node<E>> queue = new LinkedList<>();
		
		queue.offer(root);
		
		while(!queue.isEmpty()) {
			Node<E> node = queue.poll();
			System.out.print(node.element + " ");
			
			if(node.left != null) {
				queue.offer(node.left);
			}
			
			if(node.right != null) {
				queue.offer(node.right);
			}
		}
	}
	
	public void levelOrder(Visitor<E> visitor) {
		if(root == null) return;

		Queue<Node<E>> queue = new LinkedList<>();
		
		queue.offer(root);
		
		while(!queue.isEmpty()) {
			Node<E> node = queue.poll();
			boolean stop = visitor.visit(node.element);
			
			if(stop) return ;
			
			if(node.left != null) {
				queue.offer(node.left);
			}
			
			if(node.right != null) {
				queue.offer(node.right);
			}
		}
	}

	public static abstract class Visitor<E> {
		boolean stop;
		abstract boolean visit(E element);
	}
	
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

	@Override
	public Object root() {
		return this.root;
	}

	@Override
	public Object left(Object node) {
		return ((Node<E>) node).left;
	}

	@Override
	public Object right(Object node) {
		return ((Node<E>) node).right;
	}

	@SuppressWarnings("unchecked")
	@Override
	public Object string(Object node) {
		Node<E> item = ((Node<E>) node);
		return item.element.toString() +"_" + (item.parent != null ? item.parent.element : "root"); 
	}
	
}
