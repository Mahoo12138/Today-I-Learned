package com.mahoo;

import java.util.Comparator;

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
	
	// 删除元素
	void remove (E element) {}
	
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

	@Override
	public Object string(Object node) {
		return ((Node<E>) node).element; 
	}
	
	
	
}
