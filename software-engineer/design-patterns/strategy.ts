// 策略是一种行为设计模式， 它将一组行为转换为对象， 并使其在原始上下文对象内部能够相互替换。

// 原始对象被称为上下文， 它包含指向策略对象的引用并将执行行为的任务分派给策略对象。 
// 为了改变上下文完成其工作的方式， 其他对象可以使用另一个对象来替换当前链接的策略对象。


// 使用示例： 策略模式在 TypeScript 代码中很常见。 它经常在各种框架中使用， 
// 能在不扩展类的情况下向用户提供改变其行为的方式。

// 识别方法： 策略模式可以通过允许嵌套对象完成实际工作的方法以及允许将该对象替换为不同对象的设置器来识别。


// 本例说明了策略设计模式的结构并重点回答了下面的问题：

// 它由哪些类组成？
// 这些类扮演了哪些角色？
// 模式中的各个元素会以何种方式相互关联？


/**
 * The Context defines the interface of interest to clients.
 */
 class StrategyContext {
  /**
   * @type {Strategy} The Context maintains a reference to one of the Strategy
   * objects. The Context does not know the concrete class of a strategy. It
   * should work with all strategies via the Strategy interface.
   */
  private strategy: Strategy;

  /**
   * Usually, the Context accepts a strategy through the constructor, but also
   * provides a setter to change it at runtime.
   */
  constructor(strategy: Strategy) {
      this.strategy = strategy;
  }

  /**
   * Usually, the Context allows replacing a Strategy object at runtime.
   */
  public setStrategy(strategy: Strategy) {
      this.strategy = strategy;
  }

  /**
   * The Context delegates some work to the Strategy object instead of
   * implementing multiple versions of the algorithm on its own.
   */
  public doSomeBusinessLogic(): void {
      // ...

      console.log('Context: Sorting data using the strategy (not sure how it\'ll do it)');
      const result = this.strategy.doAlgorithm(['a', 'b', 'c', 'd', 'e']);
      console.log(result.join(','));

      // ...
  }
}

/**
* The Strategy interface declares operations common to all supported versions
* of some algorithm.
*
* The Context uses this interface to call the algorithm defined by Concrete
* Strategies.
*/
interface Strategy {
  doAlgorithm(data: string[]): string[];
}

/**
* Concrete Strategies implement the algorithm while following the base Strategy
* interface. The interface makes them interchangeable in the Context.
*/
class ConcreteStrategyA implements Strategy {
  public doAlgorithm(data: string[]): string[] {
      return data.sort();
  }
}

class ConcreteStrategyB implements Strategy {
  public doAlgorithm(data: string[]): string[] {
      return data.reverse();
  }
}

/**
* The client code picks a concrete strategy and passes it to the context. The
* client should be aware of the differences between strategies in order to make
* the right choice.
*/
const context2 = new StrategyContext(new ConcreteStrategyA());
console.log('Client: Strategy is set to normal sorting.');
context2.doSomeBusinessLogic();

console.log('');

console.log('Client: Strategy is set to reverse sorting.');
context2.setStrategy(new ConcreteStrategyB());
context2.doSomeBusinessLogic();