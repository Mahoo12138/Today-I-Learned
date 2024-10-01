// 中介者是一种行为设计模式， 让程序组件通过特殊的中介者对象进行间接沟通， 
// 达到减少组件之间依赖关系的目的。
// 中介者能使得程序更易于修改和扩展， 而且能更方便地对独立的组件进行复用， 
// 因为它们不再依赖于很多其他的类。

// 使用示例： 中介者模式在 TypeScript 代码中最常用于帮助程序 GUI 组件之间的通信。 
// 在 MVC 模式中， 控制器是中介者的同义词。

// 本例说明了中介者设计模式的结构并重点回答了下面的问题：
/*
  它由哪些类组成？
  这些类扮演了哪些角色？
  模式中的各个元素会以何种方式相互关联？
*/

/**
 * The Mediator interface declares a method used by components to notify the
 * mediator about various events. The Mediator may react to these events and
 * pass the execution to other components.
 */
 interface Mediator {
  notify(sender: object, event: string): void;
}

/**
* Concrete Mediators implement cooperative behavior by coordinating several
* components.
*/
class ConcreteMediator implements Mediator {
  private component1: Component1;

  private component2: Component2;

  constructor(c1: Component1, c2: Component2) {
      this.component1 = c1;
      this.component1.setMediator(this);
      this.component2 = c2;
      this.component2.setMediator(this);
  }

  public notify(sender: object, event: string): void {
      if (event === 'A') {
          console.log('Mediator reacts on A and triggers following operations:');
          this.component2.doC();
      }

      if (event === 'D') {
          console.log('Mediator reacts on D and triggers following operations:');
          this.component1.doB();
          this.component2.doC();
      }
  }
}

/**
* The Base Component provides the basic functionality of storing a mediator's
* instance inside component objects.
*/
class BaseComponent {
  protected mediator: Mediator;

  constructor(mediator?: Mediator) {
      this.mediator = mediator!;
  }

  public setMediator(mediator: Mediator): void {
      this.mediator = mediator;
  }
}

/**
* Concrete Components implement various functionality. They don't depend on
* other components. They also don't depend on any concrete mediator classes.
*/
class Component1 extends BaseComponent {
  public doA(): void {
      console.log('Component 1 does A.');
      this.mediator.notify(this, 'A');
  }

  public doB(): void {
      console.log('Component 1 does B.');
      this.mediator.notify(this, 'B');
  }
}

class Component2 extends BaseComponent {
  public doC(): void {
      console.log('Component 2 does C.');
      this.mediator.notify(this, 'C');
  }

  public doD(): void {
      console.log('Component 2 does D.');
      this.mediator.notify(this, 'D');
  }
}

/**
* The client code.
*/
const c1 = new Component1();
const c2 = new Component2();
const mediator = new ConcreteMediator(c1, c2);

console.log('Client triggers operation A.');
c1.doA();

console.log('');
console.log('Client triggers operation D.');
c2.doD();