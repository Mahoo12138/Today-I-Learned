## 概述

`runZonedGuarded` 是一个强大的工具，用于在应用的运行时创建一个 "受保护的区域"（zone）。它的主要作用是**捕获该区域内未被捕获的异步和同步异常**，从而为异常处理提供一个集中管理的机制。

1. **捕获未处理的异常**：

   - 它能捕获异步任务中的异常，这些异常通常可能会被 Dart 的默认异常处理器忽略。

   - 同步异常也可以被捕获，只要它发生在该 zone 内。

2. **应用全局错误处理**：

   + 在复杂的应用中，通过 `runZonedGuarded` 设置全局的错误捕获逻辑，例如记录日志、发送错误报告等。

3. **提供隔离环境**：

   + 每个 zone 都是一个隔离的运行环境，你可以在特定的 zone 内设定专属的配置，如日志上下文等。

## 基本使用

函数签名

```dart
R? runZonedGuarded<R>(
    R body(), 
    void onError(Object error, StackTrace stack),
    {
        Map<Object?, Object?>? zoneValues, 
        ZoneSpecification? zoneSpecification
    }
) {}
```

+ **`body`**：一个同步或异步的代码块，这个代码块将在新的 zone 中运行。
+ **`onError`**：一个回调函数，用于捕获 zone 内未被捕获的异常。
+ **`zoneValues`**（可选）：传递给 zone 的一些键值对，用于在 zone 中共享上下文。
+ **`zoneSpecification`**（可选）：一个 zone 规范，允许你自定义 zone 的行为，比如拦截日志等。

## 示例

### 示例 1：捕获未处理的异步异常

```dart
import 'dart:async';

void main() {
  runZonedGuarded(
    () {
      // 异步任务
      Future.delayed(Duration(seconds: 1), () {
        throw Exception('未捕获的异步异常');
      });

      // 同步异常
      throw Exception('同步异常');
    },
    (error, stackTrace) {
      // 全局异常处理
      print('捕获到异常：$error');
      print('堆栈信息：$stackTrace');
    },
  );

  print('应用运行中...');
}

// 应用运行中...
// 捕获到异常：Exception: 同步异常
// 捕获到异常：Exception: 未捕获的异步异常
```

### 示例 2：集成到 Flutter 应用中

在 Flutter 应用中，`runZonedGuarded` 通常用于捕获未处理的异常，可结合其他工具进行日志记录或错误报告。

```dart
import 'dart:async';
import 'package:flutter/material.dart';

void main() {
    runZonedGuarded(() {
        runApp(MyApp());
    }, (error, stackTrace) {
        // 全局异常处理（如记录日志或发送到监控服务）
        print('全局捕获异常：$error');
        print('堆栈信息：$stackTrace');
    });
}

class MyApp extends StatelessWidget {
    @override
    Widget build(BuildContext context) {
        return MaterialApp(
            home: Scaffold(
                appBar: AppBar(title: Text('runZonedGuarded 示例')),
                body: Center(
                    child: ElevatedButton(
                        onPressed: () {
                            // 模拟一个未捕获的异常
                            Future.delayed(Duration(seconds: 1), () {
                                throw Exception('按钮点击引发的异常');
                            });
                        },
                        child: Text('触发异常'),
                    ),
                ),
            ),
        );
    }
}
```

### **注意事项**

1. **`FlutterError.onError` 的配合使用**： 在 Flutter 中，你可能需要配合 `FlutterError.onError` 来捕获 Flutter 框架中的同步 UI 异常：

   ```dart
   FlutterError.onError = (FlutterErrorDetails details) {
     FlutterError.dumpErrorToConsole(details);
     print('Flutter 捕获异常：${details.exception}');
   };
   ```

2. **未捕获的错误**：

   - 即使使用了 `runZonedGuarded`，某些类型的异常（如 Dart 原生代码中的异常）可能仍然无法捕获。

3. **日志记录和性能**：

   - 在捕获异常时，避免在 `onError` 回调中执行复杂的操作，否则可能影响性能。
   - 建议将日志处理和异常上报逻辑异步化。
