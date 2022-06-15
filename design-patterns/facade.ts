// 使用示例： 使用 TypeScript 开发的程序中会经常使用外观模式。 它在与复杂程序库和 API 协作时特别有用。

// 识别方法： 外观可以通过使用简单接口， 但将绝大部分工作委派给其他类的类来识别。 

// 通常情况下， 外观管理其所使用的对象的完整生命周期。


/* 本例说明了外观设计模式的结构并重点回答了下面的问题：

  + 它由哪些类组成？
  + 这些类扮演了哪些角色？
  + 模式中的各个元素会以何种方式相互关联？
*/

/**
 * The Facade class provides a simple interface to the complex logic of one or
 * several subsystems. The Facade delegates the client requests to the
 * appropriate objects within the subsystem. The Facade is also responsible for
 * managing their lifecycle. All of this shields the client from the undesired
 * complexity of the subsystem.
 */
 class Facade {
  protected subsystem1: Subsystem1;

  protected subsystem2: Subsystem2;

  /**
   * Depending on your application's needs, you can provide the Facade with
   * existing subsystem objects or force the Facade to create them on its own.
   */
  constructor(subsystem1: Subsystem1, subsystem2: Subsystem2) {
      this.subsystem1 = subsystem1 || new Subsystem1();
      this.subsystem2 = subsystem2 || new Subsystem2();
  }

  /**
   * The Facade's methods are convenient shortcuts to the sophisticated
   * functionality of the subsystems. However, clients get only to a fraction
   * of a subsystem's capabilities.
   */
  public operation(): string {
      let result = 'Facade initializes subsystems:\n';
      result += this.subsystem1.operation1();
      result += this.subsystem2.operation1();
      result += 'Facade orders subsystems to perform the action:\n';
      result += this.subsystem1.operationN();
      result += this.subsystem2.operationZ();

      return result;
  }
}

/**
* The Subsystem can accept requests either from the facade or client directly.
* In any case, to the Subsystem, the Facade is yet another client, and it's not
* a part of the Subsystem.
*/
class Subsystem1 {
  public operation1(): string {
      return 'Subsystem1: Ready!\n';
  }

  // ...

  public operationN(): string {
      return 'Subsystem1: Go!\n';
  }
}

/**
* Some facades can work with multiple subsystems at the same time.
*/
class Subsystem2 {
  public operation1(): string {
      return 'Subsystem2: Get ready!\n';
  }

  // ...

  public operationZ(): string {
      return 'Subsystem2: Fire!';
  }
}

/**
* The client code works with complex subsystems through a simple interface
* provided by the Facade. When a facade manages the lifecycle of the subsystem,
* the client might not even know about the existence of the subsystem. This
* approach lets you keep the complexity under control.
*/
function clientCode(facade: Facade) {
  // ...

  console.log(facade.operation());

  // ...
}

/**
* The client code may have some of the subsystem's objects already created. In
* this case, it might be worthwhile to initialize the Facade with these objects
* instead of letting the Facade create new instances.
*/
const subsystem1 = new Subsystem1();
const subsystem2 = new Subsystem2();
const facade = new Facade(subsystem1, subsystem2);
clientCode(facade);