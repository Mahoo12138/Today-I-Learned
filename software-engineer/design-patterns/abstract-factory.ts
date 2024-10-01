/**
 * The Abstract Factory interface declares a set of methods that return
 * different abstract products. These products are called a family and are
 * related by a high-level theme or concept. Products of one family are usually
 * able to collaborate among themselves. A family of products may have several
 * variants, but the products of one variant are incompatible with products of
 * another.
 * 
 * @description 抽象工厂接口声明了一组返回不同抽象产品的方法. 这些产品被称为一个系列, 是高度相关的一个主题或概念.
 * 一个系列的产品他们之间通常能够协作. 一个系列的产品可能有多种变体, 但是产品间是不兼容的.
 */
 interface AbstractFactory {
  createProductA(): AbstractProductA;

  createProductB(): AbstractProductB;
}

/**
* Concrete Factories produce a family of products that belong to a single
* variant. The factory guarantees that resulting products are compatible. Note
* that signatures of the Concrete Factory's methods return an abstract product,while inside the method a concrete product is instantiated.
*
* @description 具体工厂生产一系列单独种类的产品. 工厂保证产品间是兼容的. 注意, 具体工厂的函数返回一个抽象的产品, 
* 而在函数中返回一个实例化的产品.
*/
class ConcreteFactory1 implements AbstractFactory {
  public createProductA(): AbstractProductA {
      return new ConcreteProductA1();
  }

  public createProductB(): AbstractProductB {
      return new ConcreteProductB1();
  }
}

/**
* Each Concrete Factory has a corresponding product variant.
* 
* @description 每一个具体工厂都一个具体的产品类别
*/
class ConcreteFactory2 implements AbstractFactory {
  public createProductA(): AbstractProductA {
      return new ConcreteProductA2();
  }

  public createProductB(): AbstractProductB {
      return new ConcreteProductB2();
  }
}

/**
* Each distinct product of a product family should have a base interface. All
* variants of the product must implement this interface.
*/
interface AbstractProductA {
  usefulFunctionA(): string;
}

/**
* These Concrete Products are created by corresponding Concrete Factories.
*/
class ConcreteProductA1 implements AbstractProductA {
  public usefulFunctionA(): string {
      return 'The result of the product A1.';
  }
}

class ConcreteProductA2 implements AbstractProductA {
  public usefulFunctionA(): string {
      return 'The result of the product A2.';
  }
}

/**
* Here's the the base interface of another product. All products can interact
* with each other, but proper interaction is possible only between products of
* the same concrete variant.
*/
interface AbstractProductB {
  /**
   * Product B is able to do its own thing...
   */
  usefulFunctionB(): string;

  /**
   * ...but it also can collaborate with the ProductA.
   *
   * The Abstract Factory makes sure that all products it creates are of the
   * same variant and thus, compatible.
   */
  anotherUsefulFunctionB(collaborator: AbstractProductA): string;
}

/**
* These Concrete Products are created by corresponding Concrete Factories.
*/
class ConcreteProductB1 implements AbstractProductB {

  public usefulFunctionB(): string {
      return 'The result of the product B1.';
  }

  /**
   * The variant, Product B1, is only able to work correctly with the variant,
   * Product A1. Nevertheless, it accepts any instance of AbstractProductA as
   * an argument.
   */
  public anotherUsefulFunctionB(collaborator: AbstractProductA): string {
      const result = collaborator.usefulFunctionA();
      return `The result of the B1 collaborating with the (${result})`;
  }
}

class ConcreteProductB2 implements AbstractProductB {

  public usefulFunctionB(): string {
      return 'The result of the product B2.';
  }

  /**
   * The variant, Product B2, is only able to work correctly with the variant,
   * Product A2. Nevertheless, it accepts any instance of AbstractProductA as
   * an argument.
   */
  public anotherUsefulFunctionB(collaborator: AbstractProductA): string {
      const result = collaborator.usefulFunctionA();
      return `The result of the B2 collaborating with the (${result})`;
  }
}

/**
* The client code works with factories and products only through abstract
* types: AbstractFactory and AbstractProduct. This lets you pass any factory or
* product subclass to the client code without breaking it.
*/
function clientCode(factory: AbstractFactory) {
  const productA = factory.createProductA();
  const productB = factory.createProductB();

  console.log(productB.usefulFunctionB());
  console.log(productB.anotherUsefulFunctionB(productA));
}

/**
* The client code can work with any concrete factory class.
*/
console.log('Client: Testing client code with the first factory type...');
clientCode(new ConcreteFactory1());

console.log('');

console.log('Client: Testing the same client code with the second factory type...');
clientCode(new ConcreteFactory2());