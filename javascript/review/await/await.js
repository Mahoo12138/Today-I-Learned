const func = async () => {
  const res1 = await asyncFunc(1);
  console.log(res1)
  const res2 = asyncFunc(2);
  console.log(res2)
  const res3 = await asyncFunc(3);
  console.log(res3)
};

function asyncFunc(param) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("result", param)
    }, 1000)
  })
}
func()