// 状态是一种行为设计模式， 让你能在一个对象的内部状态变化时改变其行为。

// 该模式将与状态相关的行为抽取到独立的状态类中， 让原对象将工作委派给这些类的实例， 而不是自行进行处理。

// 使用示例： 在 TypeScript 语言中， 状态模式通常被用于将基于 switch语句的大型状态机转换为对象。

// 识别方法： 状态模式可通过受外部控制且能根据对象状态改变行为的方法来识别。

// 本例说明了状态设计模式的结构并重点回答了下面的问题：

// 它由哪些类组成？
// 这些类扮演了哪些角色？
// 模式中的各个元素会以何种方式相互关联？



/**
 * The Context defines the interface of interest to clients. It also maintains a
 * reference to an instance of a State subclass, which represents the current
 * state of the Context.
 */
 class Context {
  /**
   * @type {State} A reference to the current state of the Context.
   */
  private state!: State;

  constructor(state: State) {
      this.transitionTo(state);
  }

  /**
   * The Context allows changing the State object at runtime.
   */
  public transitionTo(state: State): void {
      console.log(`Context: Transition to ${(<any>state).constructor.name}.`);
      this.state = state;
      this.state.setContext(this);
  }

  /**
   * The Context delegates part of its behavior to the current State object.
   */
  public request1(): void {
      this.state.handle1();
  }

  public request2(): void {
      this.state.handle2();
  }
}

/**
* The base State class declares methods that all Concrete State should
* implement and also provides a backreference to the Context object, associated
* with the State. This backreference can be used by States to transition the
* Context to another State.
*/
abstract class State {
  protected context!: Context;

  public setContext(context: Context) {
      this.context = context;
  }

  public abstract handle1(): void;

  public abstract handle2(): void;
}

/**
* Concrete States implement various behaviors, associated with a state of the
* Context.
*/
class ConcreteStateA extends State {
  public handle1(): void {
      console.log('ConcreteStateA handles request1.');
      console.log('ConcreteStateA wants to change the state of the context.');
      this.context.transitionTo(new ConcreteStateB());
  }

  public handle2(): void {
      console.log('ConcreteStateA handles request2.');
  }
}

class ConcreteStateB extends State {
  public handle1(): void {
      console.log('ConcreteStateB handles request1.');
  }

  public handle2(): void {
      console.log('ConcreteStateB handles request2.');
      console.log('ConcreteStateB wants to change the state of the context.');
      this.context.transitionTo(new ConcreteStateA());
  }
}

/**
* The client code.
*/
const context = new Context(new ConcreteStateA());
context.request1();
context.request2();
