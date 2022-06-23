// 使用示例： 责任链模式在 TypeScript 程序中并不常见， 
// 因为它仅在代码与对象链打交道时才能发挥作用。

// 识别方法： 该模式可通过一组对象的行为方法间接调用其他对象的相同方法来识别， 
// 而且所有对象都会遵循相同的接口。


/*本例说明了责任链设计模式的结构并重点回答了下面的问题：

 + 它由哪些类组成？
 + 这些类扮演了哪些角色？
 + 模式中的各个元素会以何种方式相互关联？
*/

/**
 * The Handler interface declares a method for building the chain of handlers.
 * It also declares a method for executing a request.
 */
interface Handler {
  setNext(handler: Handler): Handler;

  handle(request: string): string;
}

/**
* The default chaining behavior can be implemented inside a base handler class.
*/
abstract class AbstractHandler implements Handler {
  private nextHandler: Handler | undefined;

  public setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    // Returning a handler from here will let us link handlers in a
    // convenient way like this:
    // monkey.setNext(squirrel).setNext(dog);
    return handler;
  }

  public handle(request: string): string {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return "";
  }
}

/**
* All Concrete Handlers either handle a request or pass it to the next handler
* in the chain.
*/
class MonkeyHandler extends AbstractHandler {
  public handle(request: string): string {
    if (request === 'Banana') {
      return `Monkey: I'll eat the ${request}.`;
    }
    return super.handle(request);
  }
}

class SquirrelHandler extends AbstractHandler {
  public handle(request: string): string {
    if (request === 'Nut') {
      return `Squirrel: I'll eat the ${request}.`;
    }
    return super.handle(request);
  }
}

class DogHandler extends AbstractHandler {
  public handle(request: string): string {
    if (request === 'MeatBall') {
      return `Dog: I'll eat the ${request}.`;
    }
    return super.handle(request);
  }
}

/**
* The client code is usually suited to work with a single handler. In most
* cases, it is not even aware that the handler is part of a chain.
*/
function clientCode(handler: Handler) {
  const foods = ['Nut', 'Banana', 'Cup of coffee'];

  for (const food of foods) {
    console.log(`Client: Who wants a ${food}?`);

    const result = handler.handle(food);
    if (result) {
      console.log(`  ${result}`);
    } else {
      console.log(`  ${food} was left untouched.`);
    }
  }
}

/**
* The other part of the client code constructs the actual chain.
*/
const monkey = new MonkeyHandler();
const squirrel = new SquirrelHandler();
const dog = new DogHandler();

monkey.setNext(squirrel).setNext(dog);

/**
* The client should be able to send a request to any handler, not just the
* first one in the chain.
*/
console.log('Chain: Monkey > Squirrel > Dog\n');
clientCode(monkey);
console.log('');

console.log('Subchain: Squirrel > Dog\n');
clientCode(squirrel);