## Cookie

cookie 由古老的网景公司发明，由一份名为 Persistent Client State: HTTP Cookies 的规范定义；

+ 这个规范要求服务器在响应 HTTP 请求时，通过发送 Set-Cookie HTTP 头部包含会话信息；
+ 浏览器会存储这些会话信息，并在之后的每个请求中都会通过 HTTP 头部 cookie 再将它们发回服务器；
+  cookie 是与特定域绑定的，如果 cookie 总数超过了单个域的上限，浏览器就会删除之前设置的 cookie；
+ 大多数浏览器对 cookie 的限制是不超过 4096 字节，否则会静默删除；

```
Set-Cookie: name=value; expires=Mon, 22-Jan-07 07:10:24 GMT; domain=.wrox.com; path=/; secure
```

`document.cookie` 返回包含页面中所有有效 cookie 的字符串（根据域、路径、过期时间和安全设置），以分号分隔；

**没有直接删除已有 cookie 的方法**。为此，需要再次设置同名 cookie（包括相同路径、域和安全选项），
但要将其过期时间设置为某个过去的时间。  

HTTP-only 的 cookie。 HTTP-only 可以在浏览器设置，也可以在服务器设置，但只能在服务器上读取，这是因为 JavaScript 无法取得这种 cookie 的值； 

## 浏览器存储 API

Web Storage 最早是网页超文本应用技术工作组（ WHATWG， Web Hypertext Application Technical
Working Group）在 Web Applications 1.0 规范中提出的。  

`Storage` 类型用于保存名/值对数据，直至存储空间上限（由浏览器决定）；

+ length 属性可以确定 Storage 对象中保存了多少名/值对；
+ 无法确定对象中所有数据占用的空间大小；  

+ Storage 类型只能存储字符串；

`sessionStorage` 对象只存储会话数据，这意味着数据只会存储到浏览器关闭；

+ 与服务器会话紧密相关，所以在运行本地文件时不能使用；
+ 所有现代浏览器在实现存储写入时都使用了同步阻塞方式，因此数据会被立即提交到存储；

要访问同一个 `localStorage` 对象，页面必须来自同一个域（子域不可以）、在相同的端口上使用相同的协议。  

+ 存储在 localStorage 中的数据会保留到通过 JavaScript 删除或者用户清除浏览器缓存。 
+ localStorage 数据不受页面刷新影响，也不会因关闭窗口、标签页或重新启动浏览器而丢失。  

---

每当 `Storage` 对象发生变化时，都会在文档上触发 `storage` 事件；

+ domain：存储变化对应的域

+ key：被设置或删除的键

+ newValue：键被设置的新值，若键被删除则为 null

+ oldValue：键变化之前的值  

一般来说，客户端数据的大小限制是按照每个源（协议、域和端口）来设置的，因此每个源有**固定大小的数据存储空间。**    

## IndexeDB

Indexed Database API 简称 IndexedDB，是浏览器中存储结构化数据的一个方案。 IndexedDB 用于代替目前已废弃的 Web SQL Database API。   

+ IndexedDB 的设计几乎完全是异步的。绝大多数 IndexedDB 操作要求添加 `onerror` 和 `onsuccess` 事件处理程序来确定输出；
+ 与传统数据库最大的区别在于，IndexedDB 使用对象存储而不是表格保存数据；

使用 IndexedDB 数据库的第一步是调用 `indexedDB.open()`方法 ：

+ 在创建对象存储前，有必要想一想要存储什么类型的数据；
+ 创建了对象存储之后，剩下的所有操作都是通过事务完成的；
+ 有了事务的引用， 就可以使用 `objectStore()`方法并传入对象存储的名称以访问特定的对象存储；
+ 可以使用 `add()` 和 `put()` 方法添加和更新对象，使用 `get()` 取得对象，使用 `delete()` 删除对象，使用 `clear()`删除所有对象；
+ 事务对象本身也有事件处理程序： `onerror` 和 `oncomplete`。这两个事件可以用来获取事务级的状态信息；  

使用事务可以通过一个已知键取得一条记录。如果想取得多条数据，则需要在事务中创建一个游标。游标是一个指向结果集的指针。  

+ 需要在对象存储上调用 `openCursor()`方法创建游标；
+ `update()`方法使用指定的对象更新当前游标对应的值；
+ 默认情况下，每个游标只会创建一个请求。要创建另一个请求，必须调用下列中的一个方法。
  + `continue(key)`：**移动到结果集中的下一条记录**。参数 key 是可选的。如果没有指定 key，游
    标就移动到下一条记录；如果指定了，则游标移动到指定的键。
  + `advance(count)`：**游标向前移动指定的 count 条记录**。  
+ 键范围对应 `IDBKeyRange` 的实例。有四种方式指定键范围；

`openCursor()`的第一个参数是 null，表示默认的键范围是所有值；

---

第一次打开数据库时，添加 `onversionchange` 事件处理程序非常重要。 另一个同源标签页将数据库打开到新版本时，将执行此回调。对这个事件最好的回应是立即关闭数据库；

IndexedDB 数据库是与页面源（协议、域和端口）绑定的，因此信息不能跨域共享；

每个源都有可以存储的空间限制，Firefox 还有一个限制——本地文本不能访问 IndexedDB 数据库；