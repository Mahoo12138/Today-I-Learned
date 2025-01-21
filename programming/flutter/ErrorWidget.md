
## ErrorWidget.builder

`ErrorWidget.builder` 是一个非常重要的工具，用于自定义应用程序在构建 Widget 时遇到错误的显示方式。 默认情况下，Flutter 会显示一个红色的错误屏幕，也被称为“红屏死机”（Red Screen of Death）。 但是，通过 `ErrorWidget.builder`，您可以提供一个自定义的 Widget 来替换默认的错误显示，从而提供更友好的用户体验，并可能包含更多有用的调试信息。

### 使用方法

需要在应用程序的 `main()` 函数中设置 `ErrorWidget.builder`。 这通常在调用 `runApp()` 之前完成：

```dart
void main() {
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return CustomErrorWidget(details: details);
  };
  runApp(MyApp());
}
```

`ErrorWidget.builder` 接收一个 `FlutterErrorDetails` 对象作为参数，该对象包含有关错误的详细信息，如：

- `exception`： 抛出的异常对象。
- `stack`： 错误的堆栈跟踪信息。
- `library`： 发生错误的库的名称 (如果可用)。
- `context`： 错误发生的上下文 (如果可用)。
- `silent`： 指示错误是否已被静默处理的布尔值。
- `informationCollector`： 一个函数，可以用来收集更多关于错误的信息。