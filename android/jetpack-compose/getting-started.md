## 入门学习

Jetpack compose 使用可组合函数，来描述 UI：

```kotlin
@Composable
fun SimpleComposable() {
    Text("Hello World")
}
```

函数添加 `@Composable` 注释即为一个可组合函数，此注释可告知 Compose 编译器：此函数旨在将数据转换为界面。

可组合函数不会也不需要返回任何内容，因为它们描述所需的屏幕状态，而不是构造界面 widget。

启用预览，可再添加 `@Preview` 注解，该注解可免依赖于 Android Studio 中的模拟器，直接在 IDE 中进行预览。这里需要回顾下 Kotlin 中的注解。

## Kotlin 注解

注解是将元数据附加到代码中，而不会影响程序的运行时逻辑。要声明注解，请将 `annotation` 修饰符放在类的前面：

```kotlin
annotation class Preview
```

注解的附加属性可以通过用元注解标注注解类来指定：

- [`@Target`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/index.html) 指定可以用该注解标注的元素的可能的类型（类、函数、属性与表达式）；
- [`@Retention`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/index.html) 指定该注解是否存储在编译后的 class 文件中，以及它在运行时能否通过反射可见 （默认都是 true）；
- [`@Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/index.html) 允许在单个元素上多次使用相同的该注解；
- [`@MustBeDocumented`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-must-be-documented/index.html) 指定该注解是公有 API 的一部分，并且应该包含在生成的 API 文档中显示的类或方法的签名中。

```kotlin
@Repeatable
annotation class Preview(
    val name: String = "", 
    val group: String = "", // 分组，可在 IDE 根据分组进行预览 
    @IntRange(from = 1) val apiLevel: Int = -1,
    val widthDp: Int = -1,	// 设置显示宽度
    val heightDp: Int = -1,
    val locale: String = "",
    @FloatRange(from = 0.01) val fontScale: Float = 1f,
    val showDecoration: Boolean = false,
    val showBackground: Boolean = false,
    val backgroundColor: Long = 0,
    @UiMode val uiMode: Int = 0,
    @Device val device: String = Devices.DEFAULT
)
```

通过`@Preview`注解，我们可以自定义预览时的一些参数：

```kotlin
@Preview(
    name = "My Preview",
    showBackground = true,
    backgroundColor = 0x989a82
)
@Composable
fun DefaultPreview() {
    Text(text = "Hello Compose!")
}
```

## 可组合函数

### 修饰符

大多数 Compose 界面元素（例如 `Surface` 和 `Text`）都接受可选的 `modifier` 参数。修饰符会指示界面元素如何在其父布局中放置、显示或表现。

例如，`padding` 修饰符会在其修饰的元素周围应用一定的空间。您可以使用 `Modifier.padding()` 创建内边距修饰符。

```kotlin
@Composable
private fun Greeting(name: String) {
    Surface(color = MaterialTheme.colorScheme.primary) {
        Text(text = "Hello $name!", modifier = Modifier.padding(24.dp))
    }
}
```

有数十种修饰符可用于实现对齐、添加动画、设置布局、使可点击或可滚动以及转换等效果。完整列表请查看 [Compose 修饰符列表](https://developer.android.com/jetpack/compose/modifiers-list?hl=zh-cn)。

- 修饰符可以包含重载，因而具有相应的优势，如可以指定不同的方式来创建内边距。
- 若要向一个元素添加多个修饰符，只需要将它们链接起来即可。

### 内部状态

向可组合项添加内部状态，可以使用 `mutableStateOf` 函数，该函数可让 Compose [重组](##重组)读取该 `State` 的函数。

> `State` 和 `MutableState` 是两个接口，它们具有特定的值，每当该值发生变化时，它们就会触发界面更新（重组）。

```kotlin
@Composable
fun Greeting() {
    val expanded1 = mutableStateOf(false) // Don't do this!
    val expanded2 = remember { mutableStateOf(false) }
}
```

但是，**不能只是**将 `mutableStateOf` **分配给可组合项中的某个变量**。重组可能会随时发生，这会再次调用可组合项，从而将状态重置为值为 `false` 的新可变状态。在重组后保留状态，可使用 `remember` 记住可变状态。

可组合函数是可能会被并行调用，创建不同的界面元素，且每个元素都会拥有自己的状态版本。**您可以将内部状态视为类中的私有变量**。

可组合函数会自动“订阅”状态。如果状态发生变化，读取这些字段的可组合项将会重组以显示更新。

### 状态提升

在可组合函数中，被多个函数读取或修改的状态应位于共同祖先实体中，此过程称为**状态提升**。“提升”意为“提高”或“升级”。【这个概念等同于 React 框架中提到了，算是声明式 UI 中通用概念】

### 保留状态

`remember` 函数**仅在可组合项包含在组合中时**起作用。例如当旋转屏幕后，整个 activity 都会重启，所有状态都将丢失。当发生任何配置更改或者进程终止时，也会出现这种情况。

此时应当使用 `rememberSaveable`，而不使用 `remember`。这会保存每个在配置更改（如旋转）和进程终止后保留下来的状态。

## 重组

当用户与界面交互时，界面会发起 `onClick` 等事件。这些事件应通知应用逻辑，应用逻辑随后可以改变应用的状态。当状态发生变化时，系统会使用新数据再次调用可组合函数。这会导致重新绘制界面元素，此过程称为“重组”。

```kotlin
@Composable
fun ClickCounter(clicks: Int, onClick: () -> Unit) {
    Button(onClick = onClick) {
        Text("I've been clicked $clicks times")
    }
}
```

重组整个界面树在计算上成本高昂，因为会消耗计算能力并缩短电池续航时间。Compose 使用智能重组来解决此问题。

重组是指在输入更改时再次调用可组合函数的过程。当函数的输入更改时，Compose 可以通过跳过所有未更改参数的函数或  lambda，实现高效地重组。

切勿依赖于执行可组合函数所产生的附带效应，因为可能会跳过函数的重组。附带效应是指对应用的其余部分可见的任何更改，如下：

+ 写入共享对象的属性；
+ 更新 `ViewModel` 中的可观察项；
+ 更新共享偏好设置；

例如在呈现动画时，可组合函数可能会像每一帧一样频繁地重新执行，其应快速执行，以避免在播放动画期间出现卡顿。

如果需要执行成本高昂的操作（例如从共享偏好设置读取数据），请在后台协程中执行，并将值结果作为参数传递给可组合函数。

+ **可组合函数可以按任何顺序执行**：Compose 可以选择识别出某些界面元素的优先级高于其他界面元素，因而首先绘制这些元素。
+ **可组合函数可以并行运行**：Compose 可以利用多个核心，并以较低的优先级运行可组合函数（不在屏幕上），意味着可组合函数可能会在后台线程池中执行。调用某个可组合函数时，调用可能发生在与调用方不同的线程上。这意味着，应避免使用修改可组合 lambda 中的变量的代码，既因为此类代码并非线程安全代码，又因为它是可组合 lambda 不允许的附带效应。【?】
+ **重组会跳过尽可能多的内容**：Compose 可以跳过某些内容以重新运行单个按钮的可组合项，而不执行界面树中在其上面或下面的任何可组合项。【根据组合函数参数进行重组】
+ **重组是乐观的操作**：只要 Compose 认为某个可组合项的参数可能已更改，就会开始重组。Compose 预计会在参数再次更改之前完成重组。如果某个参数在重组完成之前发生更改，Compose 可能会取消重组，并使用新参数重新开始。取消重组后，Compose 会从重组中舍弃界面树。则即使取消了组合操作，也会应用该附带效应。这可能会导致应用状态不一致。确保所有可组合函数和 lambda 都幂等且没有附带效应，以处理乐观的重组。
+ **可组合函数可能会非常频繁地运行**：在某些情况下，可能会针对界面动画的每一帧运行一个可组合函数。如果您的可组合函数需要数据，它应为相应的数据定义参数。然后，您可以将成本高昂的工作移至组成操作线程之外的其他线程，并使用 `mutableStateOf` 或 `LiveData` 将相应的数据传递给 Compose。

## 主题样式

在`ui/theme/Theme.kt` 文件中，根据模板创建工程时，会默认生成一个主题定义的可组合函数，内部对 `MaterialTheme` 这个可组合函数做了自定义：

```kotlin
MaterialTheme(
    colorScheme = colorScheme,
    typography = typography,
    content = content
)
```

`MaterialTheme` 是一个可组合函数，体现了 [Material Design 规范](https://m3.material.io/) 中的样式设置原则。样式设置信息会逐级向下传递到位于其 `content` 内的组件，这些组件会读取该信息来设置自身的样式。即从任何后代可组合项中都可以检索 `MaterialTheme` 的三个属性：`colorScheme`、`typography` 和 `shapes`。

```kotlin
Text(text = name, style = MaterialTheme.typography.headlineMedium)
```

还可以基于现有的颜色或样式进行设置，使用 `copy` 函数修改预定义的样式将数字加粗：

```kotlin
Text(
    text = name,
    style = MaterialTheme.typography.headlineMedium.copy(
    	fontWeight = FontWeight.ExtraBold
    )
)
```

## 学习资料

+ https://developer.android.com/jetpack/compose/mental-model?hl=zh-cn
+ https://developer.android.com/courses/pathways/compose?hl=zh-cn
+ https://developer.android.com/codelabs/jetpack-compose-basics?hl=zh-cn