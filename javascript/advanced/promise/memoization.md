# 高级 Promise 模式 - Promise 缓存

在本文中，我们将介绍常见的缓存实现在并发条件下存在的问题。然后我们将介绍如何修复它，并且在此过程中简化代码。

我们将通过介绍基于 `Singleton Promise` 模式的 `Promise Memoization` 模式来做到这一点。

## 一个例子：缓存异步请求结果

下面是一个简单的 API 客户端：

```js
const getUserById = async (userId: string): Promise<User> => {
  const user = await request.get(`https://users-service/${userId}`);
  return user;
};
```

非常简单。

但是，如果要关注性能，该怎么办？`users-service` 解析用户详细信息可能很慢，也许我们经常使用相同的用户 `ID` 集来调用此方法。

我们可能要添加缓存，该怎么做？

## 简单的解决方案

```ts
const usersCache = new Map<string, User>();

const getUserById = async (userId: string): Promise<User> => {
  if (!usersCache.has(userId)) {
    const user = await request.get(`https://users-service/${userId}`);
    usersCache.set(userId, user);
  }

  return usersCache.get(userId);
};
```

这非常简单：在从 `users-service` 中解析了用户详细信息之后将结果填充到内存中的缓存中。

## 并发场景

上面的代码，它将在以下情况下进行重复的网络调用：

```ts
await Promise.all([
  getUserById('user1'),
  getUserById('user1')
]);
```

问题在于直到第一个调用解决后，我们才分配缓存。但是，等等，如何在获得结果之前填充缓存？

## 单例 Promise

如果我们缓存结果的 `Promise` 而不是结果本身，会怎样？代码如下：

```ts
const userPromisesCache = new Map<string, Promise<User>>();

const getUserById = (userId: string): Promise<User> => {
  if (!userPromisesCache.has(userId)) {
    const userPromise = request.get(`https://users-service/v1/${userId}`);
    userPromisesCache.set(userId, userPromise);
  }

  return userPromisesCache.get(userId)!;
};
```

非常相似，但是我们没有 `await` 发出网络请求，而是将其 `Promise` 放入缓存中，然后将其返回给调用方。

注意，我们不需要使用 `async` 声明我们的方法  ，因为它不再调用 `await` 。我们的方法签名虽然没有改变仍然返回一个 `promise`的结果 ，但是我们是同步进行的。

这样可以解决并发条件，无论时间如何，当我们对进行多次调用时，只会触发一个网络请求 `getUserById('user1')`。这是因为所有后续调用者都收到与第一个相同的 `Promise` 单例。

## Promise 缓存

从另一个角度看，我们的最终的缓存实现实际上只是在记忆 `getUserById`！给定我们已经看到的输入后，我们只返回存储的结果（恰好是一个`Promise`）。

因此，`memoizing ` 异步方法可以使我们在没有竞争条件的情况下进行缓存。

借助 `lodash`，我们可以将最后一个解决方案简化为：

```ts
import _ from 'lodash';

const getUserById = _.memoize(async (userId: string): Promise<User> => {
  const user = await request.get(`https://users-service/${userId}`);
  return user;
});
```

我们采用了原始的无缓存实现，并放入了 `_.memoize` 包装器，十分简洁与非侵入性。

## 错误处理

对于 API 客户端，你应考虑操作可能失败的可能性。如果我们的内存实现已缓存了 `rejected` 的 `Promise` ，则所有将来的调用都将以同样的失败 `Promise` 被拒绝！

幸运的是，**memoizee**(`https://www.npmjs.com/package/memoizee`) 库支持此功能。我们的最后一个示例变为：

```ts
import memoize from 'memoizee';

const getUserById = memoize(async (userId: string): Promise<User> => {
  const user = await request.get(`https://users-service/${userId}`);
  return user;
}, { promise: true});
```