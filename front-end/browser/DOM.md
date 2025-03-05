## DOM 结构模拟

```typescript
// -------------------------------
// 基础类型定义
// -------------------------------

// 节点类型（对应 Node.nodeType 常量）
type NodeType = 
  | "ELEMENT_NODE"      // 1
  | "TEXT_NODE"         // 3
  | "COMMENT_NODE"      // 8
  | "DOCUMENT_NODE"     // 9
  | "DOCUMENT_TYPE_NODE"// 10
  | "DOCUMENT_FRAGMENT_NODE"; // 11

// 属性集合（元素节点的 attributes）
interface DOMAttribute {
  name: string;
  value: string;
}

// 事件监听器（简化表示）
interface EventListener {
  type: string;       // 事件类型（如 "click"）
  handler: Function;  // 事件处理函数
  capture: boolean;   // 是否使用捕获阶段
}

// -------------------------------
// 核心节点接口
// -------------------------------

// 所有节点的基类（对应 Node 接口）
interface Node {
  nodeType: NodeType;
  nodeName: string;        // 节点名称（如 "DIV"、"#text"）
  nodeValue: string | null;// 文本内容或注释内容
  parentNode: Node | null;
  childNodes: Node[];      // 所有子节点
  ownerDocument: Document | null;

  // 方法（简化）
  appendChild(child: Node): void;
  removeChild(child: Node): void;
  addEventListener(type: string, handler: Function, capture?: boolean): void;
}

// 元素节点（对应 Element）
interface Element extends Node {
  tagName: string;         // 标签名（大写，如 "DIV"）
  attributes: DOMAttribute[]; // 属性列表（如 id, class）
  classList: string[];     // 类名列表（如 ["container", "active"]）
  style: CSSStyleDeclaration; // 内联样式（简化版）
  shadowRoot: DocumentFragment | null; // Shadow DOM 根节点

  // 方法（简化）
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  querySelector(selector: string): Element | null;
}

// 文本节点（对应 Text）
interface Text extends Node {
  // nodeValue 存储文本内容
}

// 注释节点（对应 Comment）
interface Comment extends Node {
  // nodeValue 存储注释内容
}

// 文档节点（对应 Document）
interface Document extends Node {
  doctype: DocumentType | null; // <!DOCTYPE html>
  documentElement: Element;     // <html> 根元素
  head: Element;                // <head>
  body: Element;                // <body>

  // 方法（简化）
  createElement(tagName: string): Element;
  createTextNode(content: string): Text;
}

// 文档类型节点（对应 DocumentType）
interface DocumentType extends Node {
  name: string;      // "html"
  publicId: string;  // ""
  systemId: string;  // ""
}

// 文档片段（对应 DocumentFragment）
interface DocumentFragment extends Node {
  // 类似普通节点但没有父节点
}
```


## DOM 结构示例

```typescript
// -------------------------------
// 示例：一个完整的 DOM 树结构示例
// -------------------------------

// 创建文档节点
const doc: Document = {
  nodeType: "DOCUMENT_NODE",
  nodeName: "#document",
  nodeValue: null,
  parentNode: null,
  childNodes: [],
  ownerDocument: null,
  doctype: null,
  documentElement: null as any,
  head: null as any,
  body: null as any,
  createElement: (tagName) => ({ /* 简化的 Element */ }),
  createTextNode: (content) => ({ /* 简化的 Text */ }),
};

// 创建 HTML 结构
const htmlElement: Element = {
  nodeType: "ELEMENT_NODE",
  nodeName: "HTML",
  tagName: "HTML",
  nodeValue: null,
  parentNode: doc,
  childNodes: [],
  ownerDocument: doc,
  attributes: [],
  classList: [],
  style: {} as any,
  shadowRoot: null,
  // ... 其他方法
};

doc.documentElement = htmlElement;

const headElement: Element = {
  nodeType: "ELEMENT_NODE",
  nodeName: "HEAD",
  tagName: "HEAD",
  // ... 类似 htmlElement 的结构
};

const bodyElement: Element = {
  nodeType: "ELEMENT_NODE",
  nodeName: "BODY",
  tagName: "BODY",
  // ... 类似 htmlElement 的结构
};

const divElement: Element = {
  nodeType: "ELEMENT_NODE",
  nodeName: "DIV",
  tagName: "DIV",
  attributes: [{ name: "id", value: "app" }],
  classList: ["container"],
  childNodes: [],
  // ... 其他字段
};

const textNode: Text = {
  nodeType: "TEXT_NODE",
  nodeName: "#text",
  nodeValue: "Hello DOM!",
  parentNode: divElement,
  childNodes: [],
  ownerDocument: doc,
  // ... 其他方法
};

// 构建树结构
htmlElement.childNodes.push(headElement, bodyElement);
bodyElement.childNodes.push(divElement);
divElement.childNodes.push(textNode);

// 最终 DOM 树结构：
/*
#document
└── <html>
    ├── <head>
    └── <body>
        └── <div id="app" class="container">
            └── "Hello DOM!"
*/
```

## 设计说明

1. **树形结构**：通过 `parentNode` 和 `childNodes` 维护父子关系。
2. **节点类型**：通过 `nodeType` 区分元素、文本、注释等不同类型。
3. **继承层次**：
    - **`Node`**：所有节点的基类
        - **`Element`**：元素节点
            - **`HTMLElement`**（伪代码中简化为 `Element`）
        - **`Text`**：文本节点
        - **`Comment`**：注释节点
        - **`Document`**：文档根节点
4. **属性和方法**：
    - `attributes` 存储 HTML 属性（如 `id="app"`）
    - `style` 存储内联样式（对应 `element.style`）
    - `classList` 管理类名
    - `shadowRoot` 支持 Shadow DOM
5. **事件系统**：通过 `addEventListener` 管理事件监听器
6. **文档操作**：`Document` 提供 `createElement` 等方法