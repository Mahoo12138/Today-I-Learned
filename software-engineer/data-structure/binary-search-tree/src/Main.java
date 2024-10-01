package com.mahoo;

import java.util.Comparator;
import java.util.Random;

import com.mahoo.BinarySearchTree.Visitor;
import com.mahoo.printer.BinaryTrees;

public class Main {

	public static void main(String[] args) {
//		test5();
		test6();
	}
	
	static void test1(){
		Integer data[] = new Integer[] {7,4,9,2,5,8,11,3,12,1};
		
		BinarySearchTree<Integer> bst = new BinarySearchTree<>();
		
		for(int i= 0;i< data.length;i++) {
			bst.add(data[i]);
		}
	}
	static void test2() {
		BinarySearchTree<Person> bst = new BinarySearchTree<>(new Comparator<Person>() {

			@Override
			public int compare(Person o1, Person o2) {
				
				return o1.getAge() - o2.getAge();
			}
			
		});
		
		for(int i= 0;i< 10;i++) {
			Random r = new Random();
			int num = r.nextInt(i + 10);
			bst.add(new Person(num, "Mahoo" + num));
		}
		BinaryTrees.println(bst);
		bst.preorderTraversal();
	}
	static void test3() {
		BinarySearchTree<Person> bst = new BinarySearchTree<>(new Comparator<Person>() {

			@Override
			public int compare(Person o1, Person o2) {
				
				return o1.getAge() - o2.getAge();
			}
			
		});
		
		for(int i= 0;i< 10;i++) {
			Random r = new Random();
			int num = r.nextInt(i + 10);
			bst.add(new Person(num, "Mahoo" + num));
		}
		BinaryTrees.println(bst);
		bst.inorderTraversal();
	}
	static void test4() {
		BinarySearchTree<Person> bst = new BinarySearchTree<>(new Comparator<Person>() {

			@Override
			public int compare(Person o1, Person o2) {
				
				return o1.getAge() - o2.getAge();
			}
			
		});
		
		for(int i= 0;i< 10;i++) {
			Random r = new Random();
			int num = r.nextInt(i + 10);
			bst.add(new Person(num, "Mahoo" + num));
		}
		BinaryTrees.println(bst);
		bst.postorderTraversal();
	}
	static void test5() {
		BinarySearchTree<Person> bst = new BinarySearchTree<>(new Comparator<Person>() {

			@Override
			public int compare(Person o1, Person o2) {
				
				return o1.getAge() - o2.getAge();
			}
			
		});
		
		for(int i= 0;i< 10;i++) {
			Random r = new Random();
			int num = r.nextInt(i + 10);
			bst.add(new Person(num, "Mahoo" + num));
		}
		BinaryTrees.println(bst);
		
//		bst.levelOrderTraversal();
		System.out.println(bst.height1());
		System.out.println(bst.height2());
		System.out.println(bst.isComplete());
//		bst.levelOrder(new Visitor<Person>() {
//			@Override
//			public boolean visit(Person element) {
//				if(element.getAge() > 5) {
//					return true;
//				}
//				System.out.println("-" + element + "-");
//				return false;
//			};
//		});
	}
	static void test6() {
		Integer data[] = new Integer[] {7,4,9,2,5,8,11,3,12,1};
//		Integer data[] = new Integer[] {7,4,9,2,1};
		BinarySearchTree<Integer> bst = new BinarySearchTree<>();
		
		for(int i= 0;i< data.length;i++) {
			bst.add(data[i]);
		}
		BinaryTrees.println(bst);
//		bst.remove(1);
//		bst.remove(3);
//		bst.remove(12);
//		bst.remove(5);
//		bst.remove(8);
		bst.remove(4);
		bst.remove(9);
		BinaryTrees.println(bst);
//		bst.preorderTraversal();
//		System.out.println();
//		bst.preorder(new Visitor<Integer>() {
//			@Override
//			public boolean visit(Integer element) {
//				if(element > 9) {
//					return true;
//				}
//				System.out.print(element + " ");
//				return false;
//			};
//		});
//		System.out.println(bst.isComplete());
	}
}
