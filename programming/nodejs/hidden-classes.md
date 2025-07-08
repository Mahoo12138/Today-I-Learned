---
title: 隐藏类
---
## 概述

V8 使用“隐藏类”来模拟类似静态语言的对象结构，以提高对象属性访问的速度，避免频繁查表。



## 为什么需要隐藏类

JavaScript 是一门**动态语言**，对象的结构是可以在运行时随时变化的：

1. **属性可随时增删**：同一个构造函数创建的对象，后期可能有不同属性。
2. **类型不固定**：对象的类型在运行时才能确定。

在静态语言里，对象的属性是固定的，因此访问某个字段可以通过偏移量快速定位。但 JS 的对象不确定字段结构，V8 早期版本使用哈希表或字典查找字段，效率低。

为了加速属性访问，V8 引入了**隐藏类**和**内联缓存（Inline Caching）**。



## 隐藏类核心机制

### 1. 隐藏类数据结构

```typescript
// 属性描述符结构
interface PropertyDescriptor {
  name: string;           // 属性名
  offset: number;         // 在属性数组中的位置
  type: PropertyType;     // 类型(STRING, NUMBER, OBJECT等)
  attributes: number;     // 属性标记(可写/可枚举等)
}

// ========== 隐藏类核心结构 ==========
class HiddenClass {
  readonly id: number;                    // 唯一标识符
  readonly descriptors: PropertyDescriptor[]; // 属性描述符数组
  readonly transitions: Map<string, HiddenClass>; // 状态转换表
  backPointer: HiddenClass | null = null; // 回退指针（用于过渡链）
  isDictionary: boolean = false;          // 是否降级为字典模式

  constructor(id: number, descriptors: PropertyDescriptor[] = []) {
    this.id = id;
    this.descriptors = [...descriptors]; // 防御性复制
    this.transitions = new Map();
  }

  // 添加新属性（返回新隐藏类）
  addProperty(name: string, type: PropertyType): HiddenClass {
    // 检查是否已有转换路径
    if (this.transitions.has(name)) {
      return this.transitions.get(name)!;
    }

    // 创建新属性描述符
    const newDescriptor: PropertyDescriptor = {
      name,
      offset: this.descriptors.length, // 新属性偏移量
      type,
      attributes: PropertyAttributes.Writable
    };

    // 创建新隐藏类
    const newClass = new HiddenClass(
      HiddenClass.nextId++,
      [...this.descriptors, newDescriptor]
    );

    // 建立双向转换链
    this.transitions.set(name, newClass);
    newClass.backPointer = this;
    
    return newClass;
  }

  // 删除属性（返回降级后的类）
  removeProperty(name: string): HiddenClass {
    // 创建退化描述符（偏移量重新计算）
    const newDescriptors = this.descriptors
      .filter(desc => desc.name !== name)
      .map((desc, idx) => ({ ...desc, offset: idx })); // 重新计算偏移

    // 创建降级隐藏类（可能触发字典模式）
    const degradedClass = new HiddenClass(
      HiddenClass.nextId++,
      newDescriptors
    );
    degradedClass.isDictionary = newDescriptors.length === 0;
    
    return degradedClass;
  }
  
  // 查找属性偏移量（-1表示未找到）
  findOffset(propName: string): number {
    for (const desc of this.descriptors) {
      if (desc.name === propName) return desc.offset;
    }
    return -1;
  }

  static nextId = 1; // 全局ID生成器
}
```

### 2. 对象数据结构

```typescript
class V8Object {
  // 对象头(隐藏类指针 + 哈希码)
  hiddenClass: HiddenClass;
  hash: number;
  
  // 数据存储区
  properties: any[];       // 常规属性存储
  elements: any[] = [];    // 数组索引属性(单独存储)
  inObjectFields: any[];   // 预分配的内联属性

  constructor(initialClass: HiddenClass) {
    this.hiddenClass = initialClass;
    this.hash = generateHash();
    this.properties = [];
    this.inObjectFields = new Array(IN_OBJECT_SLOTS).fill(undefined);
  }

  // 属性访问器
  getProperty(propName: string): any {
    // 1. 尝试内联缓存快速路径
    if (this.$icCache?.isValidFor(this.hiddenClass)) {
      return this.inObjectFields[this.$icCache.offset];
    }
    
    // 2. 查找隐藏类描述符
    const offset = this.hiddenClass.findOffset(propName);
    
    if (offset >= 0) {
      // 3. 更新内联缓存
      this.$icCache = new InlineCache(this.hiddenClass, offset);
      return this.inObjectFields[offset];
    }
    
    // 4. 慢速路径：原型链查找
    return this.lookupPrototypeChain(propName);
  }

  // 属性设置（核心逻辑）
  setProperty(propName: string, value: any): void {
    // 检查现有属性
    const existingOffset = this.hiddenClass.findOffset(propName);
    
    if (existingOffset >= 0) {
      // 属性已存在：直接更新值
      this.inObjectFields[existingOffset] = value;
      return;
    }
    
    // === 添加新属性流程 ===
    // 1. 获取当前隐藏类
    const currentClass = this.hiddenClass;
    
    // 2. 创建新隐藏类（或复用）
    let newClass = currentClass.transitions.get(propName);
    if (!newClass) {
      newClass = currentClass.addProperty(
        propName,
        detectValueType(value)
      );
    }
    
    // 3. 更新对象隐藏类
    this.hiddenClass = newClass;
    
    // 4. 扩展存储空间（如果需要）
    if (newClass.descriptors.length > this.inObjectFields.length) {
      this.expandPropertyStorage();
    }
    
    // 5. 存储新值
    const newOffset = newClass.findOffset(propName);
    this.inObjectFields[newOffset] = value;
    
    // 6. 清除相关内联缓存
    this.clearDependentCaches();
  }
  
  // 删除属性（性能敏感操作）
  deleteProperty(propName: string): boolean {
    const offset = this.hiddenClass.findOffset(propName);
    if (offset < 0) return false;
    
    // 1. 创建降级隐藏类
    const degradedClass = this.hiddenClass.removeProperty(propName);
    
    // 2. 切换隐藏类
    this.hiddenClass = degradedClass;
    
    // 3. 清除属性值（保留存储位置）
    this.inObjectFields[offset] = undefined;
    
    // 4. 可能触发字典模式转换
    if (degradedClass.isDictionary) {
      this.convertToDictionary();
    }
    
    return true;
  }
  
  // 扩展到字典模式
  private convertToDictionary(): void {
    const dictionary = new Map();
    
    // 复制现有属性
    for (const desc of this.hiddenClass.descriptors) {
      dictionary.set(desc.name, this.inObjectFields[desc.offset]);
    }
    
    // 替换存储结构
    this.$dictionary = dictionary;
    this.inObjectFields = null;
    this.hiddenClass = DICTIONARY_MODE_CLASS;
  }
  
  // 内联缓存指针
  private $icCache: InlineCache | null = null;
  private $dictionary: Map<string, any> | null = null;
}
```



### 3. 对象创建与初始化

```javascript
// 全局根隐藏类
const ROOT_HIDDEN_CLASS = new HiddenClass(0);

// 创建新对象
const obj = new V8Object(ROOT_HIDDEN_CLASS);
// 内存布局：
//   hiddenClass -> ROOT_HIDDEN_CLASS (id=0)
//   inObjectFields: [空 × N]
```

### 4. 添加属性（触发隐藏类转换）

```typescript
obj.setProperty("name", "Alice");

// 执行步骤：
// 1. ROOT_HIDDEN_CLASS 没有 "name" 属性
// 2. 创建新隐藏类 HC1 (id=1):
//     descriptors: [{ name: "name", offset: 0, type: "string" }]
// 3. 建立转换：ROOT -(name)→ HC1
// 4. 对象 hiddenClass 指向 HC1
// 5. 值存储在 inObjectFields[0]
```

### 5. 添加第二个属性

```typescript
obj.setProperty("age", 30);

// 执行步骤：
// 1. 在 HC1 上查找 "age" -> 未找到
// 2. 创建新隐藏类 HC2 (id=2):
//     descriptors: [
//       { name: "name", offset: 0, type: "string" },
//       { name: "age",  offset: 1, type: "number" }
//     ]
// 3. 建立转换：HC1 -(age)→ HC2
// 4. 对象 hiddenClass 指向 HC2
```

### 6. 创建第二个对象（复用隐藏类）

```typescript
const obj2 = new V8Object(ROOT_HIDDEN_CLASS);
obj2.setProperty("name", "Bob");    // 复用 HC1
obj2.setProperty("age", 25);        // 复用 HC2

// 此时：
//   obj.hiddenClass === HC2
//   obj2.hiddenClass === HC2 (相同引用)
```

### 7. 内联缓存工作流程

```typescript
// 第一次访问属性
const name = obj.getProperty("name");
//  1. 无缓存 -> 走慢速路径
//  2. 在 HC2 找到 offset=0
//  3. 创建内联缓存：
//      $icCache = { hiddenClass: HC2, offset: 0 }

// 第二次访问
const name2 = obj.getProperty("name");
//  1. 检查缓存：hiddenClass === HC2 (匹配)
//  2. 直接返回 inObjectFields[0] (绕过查找)
```

### 8. 删除属性（破坏性操作）

```typescript
delete obj.name;

// 执行步骤：
// 1. 在 HC2 找到 "name" (offset=0)
// 2. 创建降级隐藏类 HC3:
//     descriptors: [{ name: "age", offset: 0 }]
// 3. 对象切换至 HC3
// 4. 清除所有依赖 HC2 的内联缓存
```
