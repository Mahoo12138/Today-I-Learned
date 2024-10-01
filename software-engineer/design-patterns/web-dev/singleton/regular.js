let count = 0;

const counter = {
  increment() {
    return ++count;
  },
  decrement() {
    return --count;
  }
};

const a  = Object.freeze(counter);
export { counter };