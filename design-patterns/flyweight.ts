// 使用示例： 享元模式只有一个目的： 将内存消耗最小化。 
// 如果你的程序没有遇到内存容量不足的问题， 则可以暂时忽略该模式。

// 识别方法： 享元可以通过构建方法来识别， 它会返回缓存对象而不是创建新的对象。

/*
本例说明了享元设计模式的结构并重点回答了下面的问题：

 + 它由哪些类组成？
 + 这些类扮演了哪些角色？
 + 模式中的各个元素会以何种方式相互关联？

*/

/**
 * The Flyweight stores a common portion of the state (also called intrinsic
 * state) that belongs to multiple real business entities. The Flyweight accepts
 * the rest of the state (extrinsic state, unique for each entity) via its
 * method parameters.
 */
class Flyweight {
  private sharedState: any;

  constructor(sharedState: any) {
    this.sharedState = sharedState;
  }

  public operation(uniqueState): void {
    const s = JSON.stringify(this.sharedState);
    const u = JSON.stringify(uniqueState);
    console.log(`Flyweight: Displaying shared (${s}) and unique (${u}) state.`);
  }
}

/**
* The Flyweight Factory creates and manages the Flyweight objects. It ensures
* that flyweights are shared correctly. When the client requests a flyweight,
* the factory either returns an existing instance or creates a new one, if it
* doesn't exist yet.
*/
class FlyweightFactory {
  private flyweights: { [key: string]: Flyweight } = <any>{};

  constructor(initialFlyweights: string[][]) {
    for (const state of initialFlyweights) {
      this.flyweights[this.getKey(state)] = new Flyweight(state);
    }
  }

  /**
   * Returns a Flyweight's string hash for a given state.
   */
  private getKey(state: string[]): string {
    return state.join('_');
  }

  /**
   * Returns an existing Flyweight with a given state or creates a new one.
   */
  public getFlyweight(sharedState: string[]): Flyweight {
    const key = this.getKey(sharedState);

    if (!(key in this.flyweights)) {
      console.log('FlyweightFactory: Can\'t find a flyweight, creating new one.');
      this.flyweights[key] = new Flyweight(sharedState);
    } else {
      console.log('FlyweightFactory: Reusing existing flyweight.');
    }

    return this.flyweights[key];
  }

  public listFlyweights(): void {
    const count = Object.keys(this.flyweights).length;
    console.log(`\nFlyweightFactory: I have ${count} flyweights:`);
    for (const key in this.flyweights) {
      console.log(key);
    }
  }
}

/**
* The client code usually creates a bunch of pre-populated flyweights in the
* initialization stage of the application.
*/
const factory = new FlyweightFactory([
  ['Chevrolet', 'Camaro2018', 'pink'],
  ['Mercedes Benz', 'C300', 'black'],
  ['Mercedes Benz', 'C500', 'red'],
  ['BMW', 'M5', 'red'],
  ['BMW', 'X6', 'white'],
  // ...
]);
factory.listFlyweights();

// ...

function addCarToPoliceDatabase(
  ff: FlyweightFactory, plates: string, owner: string,
  brand: string, model: string, color: string,
) {
  console.log('\nClient: Adding a car to database.');
  const flyweight = ff.getFlyweight([brand, model, color]);

  // The client code either stores or calculates extrinsic state and passes it
  // to the flyweight's methods.
  flyweight.operation([plates, owner]);
}

addCarToPoliceDatabase(factory, 'CL234IR', 'James Doe', 'BMW', 'M5', 'red');

addCarToPoliceDatabase(factory, 'CL234IR', 'James Doe', 'BMW', 'X1', 'red');

factory.listFlyweights();