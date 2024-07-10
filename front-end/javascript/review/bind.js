var obj = {
  name: 'Jiuto'
}
function original(a){
  this.a=a
  // return 'some' // {a:1}
  // return 1 // {a:1}
  // return true // {a:1}
  // return null // {a:1}
  // return undefined // {a:1}
  // return Symbol('s') // {a:1}
  // return [{some:'some'}] // [{some:'some'}]
  // return {} // {}
  // return function(){} // function(){}
  // return new Date() // Fri Mar 19 2021 23:14:34 GMT+0800 (中国标准时间)
  // return /\s/ // /\s/
  return new Error('error') // Error: error
}
var bound = original.bind(obj);
var newBoundResult = new bound(1);
console.log(newBoundResult)
console.log(newBoundResult.a)