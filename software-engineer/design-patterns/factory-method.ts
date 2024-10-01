/**
 * The Creator class declares the factory method that is supposed to return an
 * object of a Product class. The Creator's subclasses usually provide the
 * implementation of this method.
 * 
 * @description 创建者类声明一个应该返回产品类的实例对象的工厂方法,
 * 其子类通常会提供该方法的实现
 */
 abstract class Creator {
  /**
   * Note that the Creator may also provide some default implementation of the
   * factory method.
   * 
   * @description 创建者类也要提供一些默认的工厂方法的实现
   */
  public abstract factoryMethod(): Product;

  /**
   * Also note that, despite its name, the Creator's primary responsibility is
   * not creating products. Usually, it contains some core business logic that
   * relies on Product objects, returned by the factory method. Subclasses can
   * indirectly change that business logic by overriding the factory method
   * and returning a different type of product from it.
   * 
   * @description 注意, 尽管名称如此, 但是, 创建者的主要职责并不是创建产品. 
   * 通常它包含一些依赖于产品对象的业务逻辑，通过工厂方法返回. 子类能间接地重写工厂方法以改变业务逻辑, 
   * 且返回一个来源于其地不同类型的产品.
   */
  public someOperation(): string {
      // Call the factory method to create a Product object.
      const product = this.factoryMethod();
      // Now, use the product.
      return `Creator: The same creator's code has just worked with ${product.operation()}`;
  }
}

/**
* Concrete Creators override the factory method in order to change the
* resulting product's type.
* 
* @description 具体的创建者重写工厂方法以改变产品类型
*/
class ConcreteCreator1 extends Creator {
  /**
   * Note that the signature of the method still uses the abstract product
   * type, even though the concrete product is actually returned from the
   * method. This way the Creator can stay independent of concrete product
   * classes.
   * 
   * @description 注意函数的签名仍使用抽象产品的类型, 尽管具体产品通常是从该方法返回的.
   * 通过这种方式,创建者能独立于具体产品类.
   */
  public factoryMethod(): Product {
      return new ConcreteProduct1();
  }
}

class ConcreteCreator2 extends Creator {
  public factoryMethod(): Product {
      return new ConcreteProduct2();
  }
}

/**
* The Product interface declares the operations that all concrete products must
* implement.
* 
* @description 产品接口, 声明所有具体产品必须实现的操作
*/
interface Product {
  operation(): string;
}

/**
* Concrete Products provide various implementations of the Product interface.
*
* @description 具体产品类, 提供不同的产品接口的实现
*/
class ConcreteProduct1 implements Product {
  public operation(): string {
      return '{Result of the ConcreteProduct1}';
  }
}

class ConcreteProduct2 implements Product {
  public operation(): string {
      return '{Result of the ConcreteProduct2}';
  }
}

/**
* The client code works with an instance of a concrete creator, albeit through
* its base interface. As long as the client keeps working with the creator via
* the base interface, you can pass it any creator's subclass.
*
* @description 客户端代码, 运行时需要一个具体创建者, 尽管是通过它的基接口. 
* 只要客户端保持通过基接口来与创建者一起运行, 你就能传入任意创建者的子类.
*/
function clientCode(creator: Creator) {
  // ...
  console.log('Client: I\'m not aware of the creator\'s class, but it still works.');
  console.log(creator.someOperation());
  // ...
}

/**
* The Application picks a creator's type depending on the configuration or
* environment.
*/
console.log('App: Launched with the ConcreteCreator1.');
clientCode(new ConcreteCreator1());
console.log('');

console.log('App: Launched with the ConcreteCreator2.');
clientCode(new ConcreteCreator2());