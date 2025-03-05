## 步骤 1：定义关键类型和数据结构

```typescript
// 计算后的样式（最终生效的样式集合）
interface ComputedStyle {
  [property: string]: string; // 如 { color: "red", width: "100px" }
}

// DOM 节点（简化版）
interface DOMNode {
  tagName: string;           // 标签名（如 "DIV"）
  attributes: {              // 属性集合
    id?: string;
    class?: string;
    style?: string;          // 内联样式（如 "color: blue;"）
  };
  children: DOMNode[];       // 子节点
  computedStyle?: ComputedStyle; // 计算后的样式（待填充）
}

// CSS 规则（简化版）
interface CSSRule {
  selectors: string[];       // 选择器列表（如 ["div.container", "#app"]）
  styles: ComputedStyle;     // 对应的样式声明
  specificity: number;       // 优先级数值（计算后的权重）
}
```

## 步骤 2：生成优先级（Specificity）

```typescript
/**
 * 计算选择器的优先级权重（简化版）
 * 规则：ID(100) > 类(10) > 标签(1)，内联样式优先级最高
 * 示例：
 *  - "div" → 1
 *  - ".container" → 10
 *  - "#app.active" → 100 + 10 = 110
 */
function calculateSpecificity(selector: string): number {
  let score = 0;
  // 检查 ID 选择器
  score += (selector.match(/#/g) || []).length * 100;
  // 检查类选择器、属性选择器、伪类
  score += (selector.match(/\.|\[|\:/g) || []).length * 10;
  // 检查标签选择器、伪元素
  score += (selector.match(/^[a-zA-Z]+|::/g) || []).length * 1;
  return score;
}
```

## 步骤 3：匹配选择器与 DOM 节点

### 模拟“从右向左”匹配

```typescript
/**
 * 判断选择器是否匹配节点及其祖先链（模拟从右向左匹配）
 * @param selector 复合选择器（如 "div.container > a"）
 * @param node 当前节点
 */
function isMatchRightToLeft(selector: string, node: DOMNode): boolean {
  // 拆解选择器为片段（如 ["div.container", ">", "a"]）
  // 注意：此处简化拆解逻辑，实际需要完整解析选择器
  const parts = selector.split(/(\s+|\s*>\s*|\s*\+\s*)/).filter(p => p.trim());
  
  // 从右向左处理（最后一个部分是目标节点）
  let currentPartIndex = parts.length - 1;
  let currentNode: DOMNode | null = node;
  
  while (currentPartIndex >= 0 && currentNode) {
    const part = parts[currentPartIndex];
    
    // 检查当前节点是否匹配该部分选择器
    if (!isSimpleSelectorMatch(part, currentNode)) {
      return false;
    }
    
    // 处理组合器（如空格、>、+）
    currentPartIndex--;
    const combinator = parts[currentPartIndex]?.trim();
    
    switch (combinator) {
      case '>': // 直接父级
        currentNode = currentNode.parent;
        currentPartIndex--;
        break;
      case '+': // 相邻兄弟
        // 需要检查前一个兄弟节点（此处简化）
        return false; // 示例中暂不实现
      default: // 后代（空格）
        currentNode = currentNode.parent;
        currentPartIndex--; // 跳过组合器
        break;
    }
  }
  
  return currentPartIndex < 0;
}

/**
 * 检查简单选择器（如 "div#id.class"）是否匹配节点
 */
function isSimpleSelectorMatch(selector: string, node: DOMNode): boolean {
  // 同原 isMatch 函数逻辑（检查标签、ID、类等）
  const hasTag = selector.match(/^([a-zA-Z]+)/)?.[1];
  const hasId = selector.match(/#([a-zA-Z_-]+)/)?.[1];
  const hasClass = selector.match(/\.([a-zA-Z_-]+)/g)?.map(c => c.slice(1));

  if (hasTag && hasTag !== node.tagName.toLowerCase()) return false;
  if (hasId && hasId !== node.attributes.id) return false;
  if (hasClass && (!node.attributes.class || 
      !hasClass.every(c => node.attributes.class!.split(' ').includes(c)))) {
    return false;
  }
  return true;
}
```

### 匹配流程示例

假设选择器为 `.ancestor .parent > .child`，DOM 结构如下：

```html
<div class="ancestor">
  <div class="parent">
    <div class="child"></div>
  </div>
</div>
```

匹配过程：

1. 拆解选择器为 `[".ancestor", " ", ".parent", ">", ".child"]`
2. 从右向左匹配：
    - 第 1 步：检查当前节点 `.child` 是否匹配 `.child` → 是
    - 处理 `>`：查找直接父级 `.parent` → 存在
    - 第 2 步：检查父级 `.parent` 是否匹配 `.parent` → 是
    - 处理 `空格`：继续向上查找祖先 `.ancestor` → 存在
    - 第 3 步：检查祖先 `.ancestor` 是否匹配 `.ancestor` → 是
3. 所有部分匹配成功 → 返回 `true`


### 实际浏览器优化策略

1. **哈希映射优化**：浏览器会对 ID、类等高频选择器建立索引，快速缩小匹配范围。
2. **避免回溯**：通过“从右向左”尽早过滤不可能匹配的节点。
3. **规则排序**：将选择器按优先级和类型分组，减少冗余计算。
## 步骤 4：样式计算主流程

```typescript
/**
 * 遍历 DOM 树，计算每个节点的样式
 * @param domRoot DOM 根节点
 * @param cssRules CSSOM 规则列表
 */
function computeStyles(domRoot: DOMNode, cssRules: CSSRule[]) {
  // 后序遍历 DOM 树（保证父节点样式先继承）
  const traverse = (node: DOMNode, parentStyles: ComputedStyle) => {
    // 初始化计算样式（合并继承的父样式）
    let computed: ComputedStyle = { ...parentStyles };

    // 收集所有匹配的 CSS 规则
    const matchedRules: CSSRule[] = [];
    for (const rule of cssRules) {
      if (rule.selectors.some(selector => isMatch(selector, node))) {
        matchedRules.push(rule);
      }
    }

    // 按优先级排序（权重高的在后，覆盖前面的）
    matchedRules.sort((a, b) => a.specificity - b.specificity);

    // 应用匹配的规则
    for (const rule of matchedRules) {
      computed = { ...computed, ...rule.styles };
    }

    // 应用内联样式（优先级最高）
    if (node.attributes.style) {
      const inlineStyles = parseInlineStyle(node.attributes.style);
      computed = { ...computed, ...inlineStyles };
    }

    // 保存计算结果
    node.computedStyle = computed;

    // 递归处理子节点（传递可继承的样式）
    const inheritStyles = filterInheritableStyles(computed);
    for (const child of node.children) {
      traverse(child, inheritStyles);
    }
  };

  // 从根节点开始，初始父样式为默认样式
  const defaultStyles = getDefaultStyles();
  traverse(domRoot, defaultStyles);
}

// 辅助函数：解析内联样式（如 "color: red; font-size: 14px;"）
function parseInlineStyle(styleStr: string): ComputedStyle {
  return styleStr.split(';').reduce((acc, rule) => {
    const [key, value] = rule.split(':').map(s => s.trim());
    if (key && value) acc[key] = value;
    return acc;
  }, {} as ComputedStyle);
}

// 辅助函数：过滤可继承的样式（如 font-family, color）
function filterInheritableStyles(styles: ComputedStyle): ComputedStyle {
  const INHERITABLE = ['font-family', 'color', 'line-height']; // 示例属性
  return Object.fromEntries(
    Object.entries(styles).filter(([key]) => INHERITABLE.includes(key))
  );
}

// 辅助函数：获取浏览器默认样式（简化版）
function getDefaultStyles(): ComputedStyle {
  return {
    'display': 'block',
    'color': 'black',
    'font-size': '16px',
    // ...其他默认值
  };
}
```
## 步骤 5：示例测试

```typescript
// 示例 DOM 树
const domTree: DOMNode = {
  tagName: 'DIV',
  attributes: { id: 'app', class: 'container' },
  children: [
    {
      tagName: 'P',
      attributes: { class: 'text' },
      children: [],
    }
  ],
};

// 示例 CSSOM 规则
const cssRules: CSSRule[] = [
  {
    selectors: ['div.container'],
    styles: { 'color': 'blue', 'padding': '10px' },
    specificity: calculateSpecificity('div.container'), // 1 (标签) + 10 (类) = 11
  },
  {
    selectors: ['#app'],
    styles: { 'background': 'white' },
    specificity: calculateSpecificity('#app'), // 100 (ID)
  },
  {
    selectors: ['.text'],
    styles: { 'font-size': '14px', 'color': 'green' },
    specificity: calculateSpecificity('.text'), // 10 (类)
  },
];

// 执行样式计算
computeStyles(domTree, cssRules);

// 输出结果：
console.log(domTree.computedStyle);
// {
//   display: 'block',        ← 默认样式
//   color: 'blue',           ← div.container 规则
//   padding: '10px',         ← div.container 规则
//   background: 'white',     ← #app 规则（优先级更高）
//   font-size: '16px',       ← 默认样式（未被覆盖）
// }

console.log(domTree.children[0].computedStyle);
// {
//   display: 'block',        ← 默认样式
//   color: 'green',          ← .text 规则（覆盖继承的 'blue'）
//   font-size: '14px',       ← .text 规则
//   background: 'white',     ← 继承自父节点
// }
```
## 流程总结

1. **遍历 DOM 树**：从根节点开始，后序遍历保证父样式先计算
2. **匹配 CSS 规则**：检查每个节点是否匹配选择器
3. **优先级排序**：按 Specificity 和源码顺序确定覆盖关系
4. **样式合并**：按顺序合并默认样式 → 外部规则 → 内联样式
5. **继承处理**：将可继承属性传递给子节点
6. **最终结果**：每个节点获得完整的 `computedStyle`

## 与实际的差异

1. **选择器解析**：真实浏览器会预解析和索引选择器
2. **性能优化**：浏览器会缓存计算结果，避免重复计算
3. **单位转换**：实际计算样式会将百分比/rem 转换为像素
4. **伪类处理**：如 `:hover` 需要动态更新计算样式
5. **层叠层（@layer）**：需要处理层叠层的优先级规则