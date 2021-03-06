package com.mahoo.tree;

import java.util.Comparator;

public class AVLTree<E> extends BinarySearchTree<E> {

	public AVLTree() {
		this(null);
	}
	public AVLTree(Comparator<E> comparator) {
		super(comparator);
	}
	@Override
	protected void afterAdd(Node<E> node) {
		while((node = node.parent) != null) {
			if(isBanlance(node)) {
				// 更新高度
				updateHeight(node);
			}else {
				// 恢复平衡
				rebalance(node);
				break;
			}
		}
	}
	@Override
	protected void afterRemove(Node<E> node) {
		while((node = node.parent) != null) {
			if(isBanlance(node)) {
				// 更新高度
				updateHeight(node);
			}else {
				// 恢复平衡
				rebalance(node);
			}
		}
	} 
	private boolean isBanlance(Node<E> node) {
		return Math.abs(((AVLNode<E>)node).balanceFactor()) <= 1; 
	}
	
	private void updateHeight(Node<E> node){
	    ((AVLNode<E>)node).updateHeight();
	}
	
	private void rebalance(Node<E> grand) {
		Node<E> parent = ((AVLNode<E>)grand).tallerChild();
		Node<E> node = ((AVLNode<E>)parent).tallerChild();
		if(parent.isLeftChild()) { // L
			if(node.isLeftChild()) { // LL
				rotateRight(grand);
			}else { // LR
				rotateLeft(parent);
				rotateRight(grand);
			}
		}else {	// R
			if(node.isLeftChild()) { // RL
				rotateRight(parent);
				rotateLeft(grand);
			}else { //RR
				rotateLeft(grand);
			}
		}
	}
	
	private void rotateLeft(Node<E> grand){
		Node<E> parent = grand.right;
		Node<E> child = parent.left;
		// 旋转
		grand.right = child;
		parent.left = grand;
		
		afterRotate(grand, parent,child);
	}
	private void rotateRight(Node<E> grand){
		Node<E> parent = grand.left;
		Node<E> child = parent.right;
		// 旋转
		grand.left = child;
		parent.right = grand;
		afterRotate(grand, parent,child);
	}
	
	private void afterRotate(Node<E> grand,Node<E> parent,Node<E> child) {
		// 维护 parent --> grand.parent, parent 成为子树根节点 
		parent.parent = grand.parent;

		
		if(grand.isLeftChild()) {
			grand.parent.left = parent;
		}else if(grand.isRightChild()){
			grand.parent.right = parent;
		}else {
			root = parent;
		}
		// 维护 grand --> parent
		grand.parent = parent;
		
		// 维护 child --> grand
		if(child != null) {
			child.parent = grand;
		}
		
		// 更新高度
		updateHeight(grand);
		updateHeight(parent);
	}
	
	
	private static class AVLNode<E> extends Node<E> {
		int height = 1;
		public AVLNode(E element, Node<E> parent) {
			super(element, parent);
		}
		
		public int balanceFactor() {
			int leftHeight = left == null ? 0 : ((AVLNode<E>)left).height;
			int rightHeight = right == null ? 0 : ((AVLNode<E>)right).height;
			return leftHeight - rightHeight;
		}
		
		public void updateHeight() {
			int leftHeight = left == null ? 0 : ((AVLNode<E>)left).height;
			int rightHeight = right == null ? 0 : ((AVLNode<E>)right).height;
			height = 1 + Math.max(leftHeight, rightHeight);
		}
		
		public Node<E> tallerChild(){
			int leftHeight = left == null ? 0 : ((AVLNode<E>)left).height;
			int rightHeight = right == null ? 0 : ((AVLNode<E>)right).height;
			if(leftHeight > rightHeight) return left;
			if(rightHeight > leftHeight) return right;
			return isLeftChild() ? left : right;
		}

		@Override
		public String toString() {
			String parentString = "null";
			if(parent != null) {
				parentString = parent.element.toString();
			}
			return element + "_p(" + parentString + ")_h(" + height + ")";
		}
		
		
		
	}

	@Override
	protected Node<E> createNode(E element, Node<E> parent) {
		return new AVLNode<>(element, parent);
	}
	
	
	
	
	
}
