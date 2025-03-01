## 讲一讲 JS Bridge 的通信原理

JS Bridge 是一种在混合应用中实现 JavaScript 代码和原生代码之间通信的机制。

它允许 Webview 中的 JavaScript 代码调用原生功能，也允许原生代码调用 JavaScript 代码。这种桥接技术在 React Native、Weex 等跨平台开发框架中被广泛使用。

### 通信原理

1. **消息序列化**：JavaScript 和原生代码运行在不同的环境中，因此需要将数据序列化成字符串格式，才能在两者之间传递。
2. **消息传递**：通过特定的 API 将序列化后的消息发送到另一端。例如，在 Android 中，可以使用 `WebView.postMessage()` 方法将消息从 JavaScript 发送到原生代码，原生代码通过 `addJavascriptInterface` 方法注入 Java 对象，从而实现双向通信。
3. **消息反序列化**：接收方将接收到的字符串消息反序列化成对应的数据结构，以便进行后续处理。
4. **异步通信**：为了避免阻塞 UI 线程，JavaScript Bridge 通常采用异步通信方式。

### 实现方式

- **Android**：通过 `WebView` 的 `addJavascriptInterface` 方法将 Java 对象暴露给 JavaScript，JavaScript 可以直接调用 Java 对象的方法。同时，Java 代码可以使用 `WebView.evaluateJavascript()` 方法执行 JavaScript 代码。
- **iOS**：可以使用 `JavaScriptCore` 框架提供的 API，例如 `evaluateScript` 方法执行 JavaScript 代码，`JSExport` 协议将 Objective-C 对象暴露给 JavaScript。

### 示例

以下是一个简单的 Android JavaScript Bridge 示例：

```java
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class WebAppInterface {
        MainActivity mContext;

        WebAppInterface(MainActivity c) {
            mContext = c;
        }

        @JavascriptInterface
        public void showToast(String toast) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
        }
    }
}
```

```html
<!DOCTYPE html>
<html>
<head>
    <title>JavaScript Bridge Example</title>
</head>
<body>
    <button onclick="showToast('Hello from JavaScript!')">Show Toast</button>
    <script>
        function showToast(message) {
            Android.showToast(message);
        }
    </script>
</body>
</html>
```

