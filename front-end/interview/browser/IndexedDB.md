## 说说 IndexedDB 的特性

IndexedDB 是 **浏览器提供的一种 NoSQL 本地数据库**，用于在客户端存储大量结构化数据。它比 `localStorage` 和 `sessionStorage` 更加强大，支持 **事务、索引、查询、二进制存储** 等特性，非常适合 **存储大量数据**（如离线数据、缓存数据等）。

### Key-Value 存储（NoSQL 结构）

IndexedDB 采用 **键值对（Key-Value）存储**，每条数据都有一个唯一的 `key`，而 `value` 可以是任意类型的 JavaScript 对象（包括 JSON、Blob、ArrayBuffer 等）。

- **Key 可以是主键，也可以是自动递增的 ID**；
- **Value 支持 JavaScript 复杂对象**；

### **支持事务（Transactions）**

IndexedDB 支持 **事务（Transaction）**，确保数据库操作的完整性和一致性。事务有三种模式：

- **readonly**（只读）
- **readwrite**（读写）
- **versionchange**（版本变更）
- 事务确保 **要么所有操作成功，要么所有操作回滚**（ACID 特性）

### **支持索引（Indexes）**

IndexedDB 允许在数据表（object store）上创建 **索引（Index）**，支持更快的查询。

- **索引可以加速查询**，避免遍历整个数据库
- **索引支持唯一性（unique: true）**，防止重复数据

### **版本控制（Versioning）**

IndexedDB 采用 **版本控制**，数据库只能在 `versionchange` 事务中进行结构变更，例如 **创建新表、删除表、增加索引** 等。

- 只有 **版本号变更时**，`onupgradeneeded` 事件才会触发
- **数据表和索引的结构** 只能在 `onupgradeneeded` 里修改

### **异步 & 事件驱动**

IndexedDB 的所有操作（如 **打开数据库、读取数据、写入数据**）都是 **异步的**，不会阻塞主线程。

- 通过 **事件监听**（onsuccess, onerror）处理异步操作
- **避免使用同步 API**（如 `localStorage`），防止 UI 卡顿

### **存储空间大**

IndexedDB 的存储空间比 `localStorage` 大得多，通常能存 **数百 MB 到几 GB**，具体取决于 **浏览器和用户的存储权限**。

- `localStorage` 只能存 **5MB**
- `IndexedDB` **可以存 GB 级数据**
- 可存储 **二进制数据（Blob, ArrayBuffer）**，适用于 **离线存储、缓存、文件存储**

### **支持游标（Cursor）遍历大数据**

IndexedDB 允许使用 **游标（Cursor）** 逐条遍历数据，非常适合处理 **大数据集**，避免一次性读取所有数据。

- **适用于分页查询、批量处理数据**
- **避免一次性加载所有数据，减少内存占用**

### **跨域限制 & 安全性**

IndexedDB 受 **同源策略** 限制，不同域名的网页无法访问彼此的数据库。

- **数据存储在用户浏览器本地**
- **不同网站（不同域名）无法共享 IndexedDB**
- **只能在 HTTPS 下使用 Service Worker 访问 IndexedDB**


## IndexedDB 与 localStorage、sessionStorage 有什么区别？

- **IndexedDB** 是 **NoSQL 数据库**，支持存储 **大数据（GB 级）**，支持 **索引、事务**，是异步的。
- **localStorage** 仅支持 **5MB 数据**，同步 API，适合小规模数据存储。
- **sessionStorage** 和 `localStorage` 类似，但仅 **在会话（session）存活**，关闭页面后清空。

## IndexedDB 的基本结构是怎样的？

- **数据库（Database）**：IndexedDB 是基于 **数据库** 的，可以存多个数据库。
- **对象存储（Object Store）**：类似于 NoSQL 数据表，每个 store 存一类数据。
- **键值对（Key-Value）**：数据以 `key-value` 形式存储，`key` 可是主键或自动递增。
- **索引（Index）**：用来提高查询效率，相当于 SQL 里的索引。
- **事务（Transaction）**：所有操作必须在事务中进行，支持 `readonly`、`readwrite`、`versionchange` 三种模式。

## IndexedDB 适用于哪些场景？

- **PWA 离线存储**（比如 Service Worker 缓存）
- **存储大规模 JSON 数据**（如用户设置、历史记录）
- **Web 应用本地数据库**（如聊天记录、Todo 应用）
- **前端数据缓存**（减少 API 请求）
- **存储二进制数据（Blob, ArrayBuffer）**（如离线音视频、图片）


## IndexedDB 操作数据库的步骤？


```js
// 打开数据库
const request = indexedDB.open('MyDatabase', 1);
// 监听 `onupgradeneeded` 事件（首次创建/升级数据库时触发）
request.onupgradeneeded = (event) => {     
	const db = event.target.result;     
	db.createObjectStore('users', { keyPath: 'id', autoIncrement: true }); 
};
// 监听 `onsuccess` 事件（数据库打开成功）
request.onsuccess = (event) => {
	const db = event.target.result; 
};
// 使用事务进行读写
const transaction = db.transaction('users', 'readwrite');
const store = transaction.objectStore('users');
store.add({ id: 1, name: 'Alice' }); 
transaction.oncomplete = () => console.log('数据写入成功');
```

## 如何用 IndexedDB 存储二进制数据（如图片、音视频）？

IndexedDB 支持存储 `Blob` 和 `ArrayBuffer`，适用于存储二进制数据：
```js
const request = indexedDB.open('MediaDB', 1);
request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore('images', { autoIncrement: true });
};

request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');

    fetch('image.jpg')
        .then(response => response.blob())
        .then(blob => store.add(blob));
};

```

## 如何实现一个 localStorage 兼容 IndexedDB 的存储方案？

如果数据量小，优先用 `localStorage`，如果数据量大，自动切换到 IndexedDB。

```js
const jsonValue = JSON.stringify(value);
const size = new Blob([jsonValue]).size; // 获取数据大小（字节）
// 小于 5KB 存 `localStorage`，大于 5KB存 `IndexedDB`
if (size < 5 * 1024) {
	const request = indexedDB.open('MyDatabase', 1);
	request.onsuccess = (event) => {
		const db = event.target.result;
		const transaction = db.transaction('storage', 'readwrite');
		transaction.objectStore('storage').put(value, key);
	};
} else {
	localStorage.setItem(key, JSON.stringify(value));
}
```
