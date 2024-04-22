function cloneDeep(obj, referencesMap = new Map()) {
  console.log("input", obj)
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const root = Array.isArray(obj) ? [] : {};

  // 栈
  const loopList = [
    {
      parent: root,
      key: undefined,
      data: obj,
    }
  ];

  while (loopList.length) {
    // 深度优先
    const { parent, key, data } = loopList.pop();

    // 初始化赋值目标，key 为 undefined 则拷贝到父元素，否则拷贝到子元素
    let res = parent;
    if (typeof key !== 'undefined') {
      res = parent[key] = {};
    }

    if (referencesMap.has(data)) {
      console.log("cirecle: ",parent, data, key, res)
      console.log("data:", referencesMap.get(data))
      res = parent[key] = referencesMap.get(data);
      continue;
    }
    referencesMap.set(data, data)
    for (let k of Reflect.ownKeys(data)) {
      if (typeof data[k] === 'object') {
        // 下一次循环
        loopList.push({
          parent: res,
          key: k,
          data: data[k],
        });

      } else {

        res[k] = data[k];
      }
    }
  }
  return root;
}


// cloneDeep({[Symbol()]:'bfe'})
const a = {a: {b: {c: 3}}}
a.a.b.c = a;
const res = cloneDeep(a)
console.log("result", res)