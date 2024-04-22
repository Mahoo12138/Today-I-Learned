function throttle(func, wait) {
  let waiting = false, lastArgs = null;
  return function (...args) {
    if (!waiting) {
      console.log('----------')
      func.apply(this, args)
      console.log('----------')
      waiting = true;
      let timeout = (a) => setTimeout(() => {
        console.log('------ timeout start ------')
        waiting = false;
        console.log("args", args.toString(), a.toString())

        if (lastArgs) {
          func.apply(this, lastArgs);
          waiting = true;
          lastArgs = null;
          timeout(args);
        }
        console.log('------ timeout end ------')

      }, wait);
      timeout(args);
    } else {
      lastArgs = args
    }
  }
}

const func = (i) => console.log("exec", i)

const tfunc = throttle(func, 100);


for (let i = 0; i < 5; i++) {
  tfunc(i)
}
setTimeout(() => {
  tfunc(5)
  tfunc(6)
}, 200)

setTimeout(() => {
  tfunc("over")
}, 3000)


