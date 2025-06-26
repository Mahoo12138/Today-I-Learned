网络请求的响应时间过快，页面 loading 动画闪烁，一般的思路会采用延时的操作采取一个固定的 loading 时间。

例如有两个请求时间分别是`50ms`和`150ms`，我现在希望不管是`50ms`还是`150ms`，loading 动画都有一个比较完整的展示时间

这种情况只需要用一个延迟的 `Promise.resolve()`，通过 `Promise.all` 方法去拉长响应时间

```js
const delay = ms => new Promise((resolve, _) => setTimeout(resolve, ms));  
  
loading = true;
Promise.all([fetchPromise, delay(300)])  
  .then(handleSuccess)  
  .catch(handleError)  
  .finally(() => {  
    loading = false;  
  });
```

另一种思路是，在超过一段时间后的响应后才进行 loading 展示，如超过`100ms`的情况才展示 loading 动画；只需要用一个延迟的 `Promise.reject()`，通过 `Promise.race` 方法去和网络请求：
```js
const timeout = ms =>  
  new Promise((_, reject) => setTimeout(() => reject(Symbol.for('timeout')), ms));  
  
Promise.race([ajaxPromise, timeout(100)])  
  .then(handleSuccess)  
  .catch(err => {  
    if (Symbol.for('timeout') === err) {  
      loading = true;  
      return ajaxPromise  
        .then(handleSuccess)  
        .catch(handleError)  
        .finally(() => {  
          loading = false;  
        });  
    }  
    return handleError(err);  
  });
```

但是，如果实际响应结束时间为`101ms`的时候，闪烁还是无法避免的。

综上，比较合理的方式是二者结合起来，响应时间小于`100ms`时不展示 loading 动画，大于`100ms`时展示`300ms`的 loading 动画时间：

```js
const timeout = ms =>  
  new Promise((_, reject) => setTimeout(() => reject(Symbol.for('timeout')), ms));  
  
const delay = ms => new Promise((resolve, _) => setTimeout(resolve, ms));  
  
const request = ({ config, target, timeoutTime = 100, delayTime = 300 }) => {    
  const promise = axios(config);  
  
  const startLoading = target => {  
    if (!target) {  
      return;  
    }  
    // startLoading  
  };  
  
  const endLoading = () => {  
    // endLoading  
  };  
  
  const handleSuccess = data => {  
    // 兼容Promise.all和Promise.race不同的返回值  
    const response = Array.isArray(data) ? data[0] : data;  
    // 处理成功的情况  
    return Promise.resolve(response.data);  
  };  
  
  const handleError = ({ response }) => {  
    // 处理失败的情况  
    return Promise.reject(response);  
  };  
  
  return Promise.race([promise, timeout(timeoutTime)])  
    .then(handleSuccess)  
    .catch(err => {  
      if (Symbol.for('timeout') === err) {  
        startLoading(target);  
        return Promise.all([promise, delay(delayTime)])  
          .then(handleSuccess)  
          .catch(handleError)  
          .finally(() => {  
            endLoading();  
          });  
      }  
      return handleError(err);  
    });  
};
```

`timeoutTime` 和 `delayTime` 可以根据自己的项目或网络情况进行调整。