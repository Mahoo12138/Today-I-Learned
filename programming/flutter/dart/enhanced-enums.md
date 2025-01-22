---
title: 枚举增强
---
增强枚举是 Dart 2.17 引入的一个新特性，它允许为枚举添加更多的功能，比如字段、方法和自定义构造函数；通过 `;` 将枚举值和其他成员分隔开，类似类定义。

## 代码示例

```dart
enum AppRoute {
  splash,
  home,
  login,
  register;

  // 定义了一个计算属性 'route'
  String get route => '/${toString().replaceAll('AppRoute.', '')}';

  // 定义了一个计算属性 'name'
  String get name => toString().replaceAll('AppRoute.', '');
}
```

**`route`**：一个 **getter**，根据当前枚举值动态生成路由字符串：

+ 如果枚举值是 `AppRoute.splash`，`route` 将返回 `/splash`。

- 如果枚举值是 `AppRoute.home`，`route` 将返回 `/home`。

**`name`**：一个 **getter**，获取枚举值的名称（去掉前缀）。

- 如果枚举值是 `AppRoute.register`，`name` 将返回 `register`。
- 如果枚举值是 `AppRoute.login`，`name` 将返回 `login`。

### `toString()` 

枚举的 `toString()` 方法会返回格式化后的字符串，包含枚举类名和枚举值，例如：`AppRoute.home`。

### 添加额外的属性

```dart
enum AppRoute {
  home('Home', 'This is the home page'),
  login('Login', 'Login to your account'),
  register('Register', 'Create a new account');

  final String title;
  final String description;

  // 自定义构造函数
  const AppRoute(this.title, this.description);

  String get route => '/${name}';
}
```

### 使用枚举值的索引

强枚举仍然保留了原生枚举的索引功能，可以通过 `index` 获取枚举值的位置：

```dart
void main() {
  print(AppRoute.home.index); // 输出: 0
  print(AppRoute.login.index); // 输出: 1
}
```