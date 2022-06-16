package com.mahoo;

import java.util.Comparator;
import java.util.Random;

import com.mahoo.printer.BinaryTrees;

public class Main {

	public static void main(String[] args) {
//		Integer data[] = new Integer[] {7,4,9,2,5,8,11,3,12,1};
//		
//		BinarySearchTree<Integer> bst = new BinarySearchTree<>();
//		
//		for(int i= 0;i< data.length;i++) {
//			bst.add(data[i]);
//		}
		BinarySearchTree<Person> bst = new BinarySearchTree<>(new Comparator<Person>() {

			@Override
			public int compare(Person o1, Person o2) {
				
				return o1.getAge() - o2.getAge();
			}
			
		});
		
		for(int i= 0;i< 200;i++) {
			Random r = new Random();
			int num = r.nextInt(i + 10);
			bst.add(new Person(num, "Mahoo" + num));
		}
		BinaryTrees.println(bst);
	}

}
