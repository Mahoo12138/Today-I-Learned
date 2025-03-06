## 代码示例

```js
function renderMarkdown(text) {
  // 处理代码块
  text = text.replace(
    /```([\s\S]*?)```/g,
    (_, code) => `<pre><code>${code}</code></pre>`
  );

  // 处理引用块
  text = text.replace(/(^>.*\n?)+/gm, (match) => {
    const content = match.replace(/^> ?/gm, "");
    return `<blockquote>${processInline(content)}</blockquote>`;
  });

  // 处理无序列表
  text = text.replace(/(^[*+-]\s.*\n?)+/gm, (match) => {
    const items = match.split("\n").filter(Boolean);
    const lis = items
      .map((item) => `<li>${processInline(item.replace(/^[*+-]\s+/, ""))}</li>`)
      .join("");
    return `<ul>${lis}</ul>`;
  });

  // 处理有序列表
  text = text.replace(/(^\d+\.\s.*\n?)+/gm, (match) => {
    const items = match.split("\n").filter(Boolean);
    const lis = items
      .map((item) => `<li>${processInline(item.replace(/^\d+\.\s+/, ""))}</li>`)
      .join("");

    return `<ol>${lis}</ol>`;
  });

  // 处理标题
  text = text.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${processInline(content)}</h${level}>`;
  });

  // 处理段落

  text = text
    .split("\n")
    .map((line) => {
      line = line.trim();
      if (!line || line.startsWith("<")) return line;
      return `<p>${processInline(line)}</p>`;
    }).join("\n");

  return text;
}


function processInline(text) {
  // 换行处理
  text = text.replace(/\n/g, '<br>');

  // 处理行内代码
  text = text.replace(/`([^`]+?)`/g, '<code>$1</code>');

  // 处理图片
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

  // 处理链接
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // 处理加粗
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 处理斜体
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>');

  return text;
}
```

## 要点注意

+ **先块级后行级**：优先处理代码块、引用块、列表等块级元素（` ``` `、`>`、`*`等），最后处理行内元素（`**`、`*`、链接等），避免嵌套干扰；
+ **贪婪与非贪婪匹配**：代码块使用 `([\s\S]*?)` 非贪婪匹配，直接使用 `/```.*```/g` 会合并多个代码块；
+ **多行匹配标记**：使用  `/m`  处理多行起始符，`/^> .+/gm`  正确匹配每行的引用块；
+ **HTML标签污染**：避免直接拼接未过滤内容，防范 XSS 攻击，可转义原生HTML字符；

