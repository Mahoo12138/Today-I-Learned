## CSSOM 结构模拟

### 基础类型定义

```typescript
// -------------------------------
// 基础类型定义
// -------------------------------

// CSS 规则类型（如 @media、@font-face、普通样式规则等）
type CSSRuleType = 
  | "StyleRule"
  | "MediaRule"
  | "FontFaceRule"
  | "KeyframesRule"
  | "LayerRule"
  | "SupportsRule"
  | "ImportRule";

// CSS 选择器（可以是复合选择器，如 "div.class > a"）
type Selector = string;

// CSS 属性键值对（如 { color: "red", width: "100px" }）
type CSSDeclaration = Record<string, string>;

// -------------------------------
// 核心 CSSOM 节点
// -------------------------------

interface CSSRule {
  type: CSSRuleType;
  parentRule: CSSRule | null; // 父规则（用于嵌套规则）
  parentStyleSheet: CSSStyleSheet | null;
}

// 普通样式规则（如 div { color: red; }）
interface CSSStyleRule extends CSSRule {
  type: "StyleRule";
  selectors: Selector[]; // 选择器列表（支持逗号分隔的多个选择器）
  style: CSSDeclaration; // 样式声明块
  pseudoElements?: CSSStyleRule[]; // 伪元素样式（如 ::before）
  pseudoClasses?: CSSStyleRule[]; // 伪类样式（如 :hover）
}

// 媒体查询规则（如 @media (max-width: 600px) { ... }）
interface CSSMediaRule extends CSSRule {
  type: "MediaRule";
  condition: string; // 媒体查询条件字符串
  rules: CSSRule[]; // 嵌套的 CSS 规则
}

// 字体规则（如 @font-face { ... }）
interface CSSFontFaceRule extends CSSRule {
  type: "FontFaceRule";
  style: CSSDeclaration; // font-family, src 等属性
}

// 关键帧规则（如 @keyframes slide { ... }）
interface CSSKeyframesRule extends CSSRule {
  type: "KeyframesRule";
  name: string;
  keyframes: {
    [key: string]: CSSDeclaration; // 如 "0%", "50%", "to"
  };
}

// 层规则（如 @layer base { ... }，用于层叠上下文）
interface CSSLayerRule extends CSSRule {
  type: "LayerRule";
  name: string;
  rules: CSSRule[];
}

// @supports 规则（如 @supports (display: grid) { ... }）
interface CSSSupportsRule extends CSSRule {
  type: "SupportsRule";
  condition: string;
  rules: CSSRule[];
}

// -------------------------------
// CSS 样式表（CSSStyleSheet）
// -------------------------------
interface CSSStyleSheet {
  ownerNode: HTMLLinkElement | HTMLStyleElement | null; // 关联的 DOM 节点
  rules: CSSRule[]; // 所有规则（包括嵌套规则）
  cssRules: CSSRule[]; // 标准属性，同 rules
  disabled: boolean; // 是否禁用
  layerName?: string; // 所属层名称（如果有）
  
  // 方法（简化示例）
  insertRule(rule: string, index?: number): number;
  deleteRule(index: number): void;
}
```

### CSSOM 结构示例

```typescript
// -------------------------------
// 示例：一个完整的 CSSOM 结构示例
// -------------------------------
const exampleCSSOM: CSSStyleSheet = {
  ownerNode: null,
  disabled: false,
  rules: [
    {
      type: "StyleRule",
      selectors: ["body"],
      style: {
        margin: "0",
        "font-family": "Arial",
      },
      parentRule: null,
      parentStyleSheet: null,
    },
    {
      type: "MediaRule",
      condition: "(max-width: 600px)",
      rules: [
        {
          type: "StyleRule",
          selectors: [".container"],
          style: { "flex-direction": "column" },
          parentRule: null, // 实际应指向父 MediaRule
          parentStyleSheet: null,
        },
      ],
      parentRule: null,
      parentStyleSheet: null,
    },
    {
      type: "FontFaceRule",
      style: {
        "font-family": "MyFont",
        src: "url(myfont.woff2)",
      },
      parentRule: null,
      parentStyleSheet: null,
    },
  ],
  cssRules: [] // 实际与 rules 内容相同
};
```

### 设计说明

1. **树形结构**：CSSOM 是一个树形结构，通过 `parentRule` 和 `parentStyleSheet` 维护层级关系。
2. **规则类型**：通过 `type` 字段区分不同规则类型（如普通样式、媒体查询等）。
3. **嵌套规则**：如 `@media` 内部可以包含其他规则，通过 `rules` 数组实现嵌套。
4. **伪类/伪元素**：通过 `pseudoElements` 和 `pseudoClasses` 单独存储特殊状态的样式。
5. **层叠上下文**：通过 `layerName` 和 `CSSLayerRule` 支持 CSS 层叠层（@layer）功能。
6. **动态操作**：`CSSStyleSheet` 提供 `insertRule` 和 `deleteRule` 方法模拟浏览器 API。