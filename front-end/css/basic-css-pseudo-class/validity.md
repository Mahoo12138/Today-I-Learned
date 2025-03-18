## `:valid` 与 `:invalid`

这两个伪类用于根据**浏览器的默认验证规则**（或 `pattern`、`required` 等属性）自动判断输入是否合法。

### `:valid`（输入有效）

- 当输入字段的内容符合 HTML5 校验规则时，`:valid` 触发。
- 适用于 `<input>`、`<textarea>`、`<select>` 等可验证的表单元素。

**示例：**

```css
input:valid {   
	border: 2px solid green; /* 输入正确时边框变绿 */ 
}
```

---
###  `:invalid`（输入无效）

- 当输入内容**不符合** HTML5 校验规则（如 `type="email"` 格式错误、`pattern` 不匹配）时，`:invalid` 触发。

**示例：**

```css
input:invalid {   
	border: 2px solid red; /* 输入错误时边框变红 */ 
}
```

 **适用场景**：

- `type="email"`：检查输入是否是有效的电子邮件。
- `required`：检查是否为空。
- `pattern="[0-9]+"`：检查是否匹配正则表达式。


---

## `:user-valid` 与 `:user-invalid`

这两个伪类是 **`:valid` 和 `:invalid` 的改进版**，但仅在**用户开始交互**后才生效，避免表单加载时就出现错误提示。

### `:user-valid`（用户输入后且输入有效）

- 只有在用户输入后，且输入内容有效，`:user-valid` 才生效。
- **页面初次加载时不会触发**，直到用户输入有效内容。


```css
input:user-valid {   
	border: 2px solid green; 
}
```

---

###  `:user-invalid`（用户输入后且输入无效）

- 只有当**用户输入**后，且输入不符合 HTML5 规则时，`:user-invalid` 才会触发。
- **页面初次加载时不会触发**，避免用户还未输入时就显示错误样式。

```css
input:user-invalid {   
	border: 2px solid red; 
}
```


|输入阶段|`:invalid`|`:user-invalid`|
|---|---|---|
|页面加载时（未输入）|✅ **触发**|❌ **不会触发**|
|输入错误|✅ **触发**|✅ **触发**|
|输入正确|✅ **触发**|✅ **触发**|

---

## 伪类对比总结

|伪类|作用|何时生效|
|---|---|---|
|`:valid`|输入内容符合 HTML5 验证规则|**无论用户是否输入**|
|`:invalid`|输入内容不符合 HTML5 验证规则|**无论用户是否输入**|
|`:user-valid`|用户输入后，内容有效|**用户输入后才生效**|
|`:user-invalid`|用户输入后，内容无效|**用户输入后才生效**|

---

## 推荐使用场景

- **`:valid` / `:invalid`**：适合用于表单字段自动验证，但可能会在页面加载时显示错误（因为 `:invalid` 默认生效）。
- **`:user-valid` / `:user-invalid`**：更适合**用户友好的体验**，避免表单刚加载时就显示错误。

---
## **总结**

- **`:valid` / `:invalid`** → **适用于所有输入状态（默认生效）**。
- **`:user-valid` / `:user-invalid`** → **仅在用户输入后才生效（更用户友好）**。