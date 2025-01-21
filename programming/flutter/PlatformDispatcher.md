
# PlatformDispatcher

PlatformDispatcher 是 Dart 中 dart:ui 库中的一个单例类，充当平台事件分派的中心枢纽。它提供了
与宿主操作系统交互的最基本接口，是平台消息和配置事件的主要入口点。

## 主要功能

- **调度器 API:** 提供了核心调度器 API，例如 `scheduleFrame()` 用于请求绘制下一帧，`onBeginFrame` 和 `onDrawFrame` 回调分别在帧开始和绘制时被调用。
- **输入事件回调:** 处理来自平台的输入事件，例如键盘和指针事件。`onKeyData` 和 `onPointerDataPacket` 回调分别用于处理键盘和指针数据。
- **图形绘制 API:** 提供了图形绘制 API，允许应用绘制到屏幕上。
- **平台消息:** 处理来自平台的自定义消息。 尽管 `onPlatformMessage` 已被弃用，但它曾经用于处理平台通道消息。 建议迁移到 `ChannelBuffers.setListener`。
- **平台配置:** 管理各种平台属性的配置，例如 `platformBrightness`（平台亮度）、`locale`（区域设置）和 `textScaleFactor`（文本缩放比例）。
- **视图管理:** 管理应用程序视图列表，包括顶层平台窗口。


## 错误处理

`PlatformDispatcher.instance.onError` 用于捕获异步代码块中抛出的未捕获错误，包括来自平台层级的错误：

```dart
// * Handle errors from the underlying platform/OS
PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
  debugPrint(error.toString());
  return true;
};
```

这与 `FlutterError.onError` 不同，后者用于捕获 Flutter 框架中在 build、layout 和 paint 阶段遇到的错误。


## 与 Flutter 相关

[[WidgetsFlutterBinding]] 依赖于 `PlatformDispatcher` 来与底层操作系统交互

+ `WidgetsFlutterBinding` 的初始化过程中会初始化 `PlatformDispatcher`，并持有对 `PlatformDispatcher` 的引用，通过它访问平台相关的服务；
+ 您可以通过 `WidgetsBinding.instance.platformDispatcher` 访问 `PlatformDispatcher` 实例。 这是推荐的访问 `PlatformDispatcher` 的方式，因为它避免了静态访问的缺点。
+  `WidgetsFlutterBinding` 监听并处理来自 `PlatformDispatcher` 的各种回调，例如 `onBeginFrame`、`onDrawFrame`、`onPointerDataPacket` 等。 它将这些底层事件转换为 Flutter 框架可以理解的事件，并将其分派给相应的组件。
