# html的元素有哪些（包含H5）？区分出行内元素、块级元素、空元素并在后面简要标注下作用。如：

| 行内元素                    |                                        |                        |
| --------------------------- | -------------------------------------- | ---------------------- |
| br - 换行                   | span - 通用行内容器，无特殊语义        | a - 超链接             |
| strong - 文本十分重要，加粗 | b - 提醒注意（Bring Attention To）元素 | input - 输入框         |
| textarea - 多行文本框       | em - 文本强调（emphasis），通常为斜体  | img - 图片标签         |
| label - 标签，界面元素说明  | i - 术语（idiomatic）文本元素，斜体    | sub - 下标 subscript   |
| button - 按钮               |                                        | sup - 上标 superscript |
| cite - 引用                 |                                        | select - 选项菜单      |

---

| 块级元素                       |                                                |                |
| ------------------------------ | ---------------------------------------------- | -------------- |
| div - 内容划分元素，无特殊语义 | hr - 主题分割 horizontal rule 水平线           | p - 文本块     |
| head - 文档元数据（头部）元素  | address - 表示提供了某个人或某个组织的联系信息 | table - 表单   |
| meta - 标注元数据信息          | fieldset - 用于对表单中的控制元素进行分组      | h1-h6 区域标题 |
| section - 独立章节             | header  - 用于展示介绍性内容                   | form - 表格    |
| article - 文档页面             | main - 呈现了文档的 body 或应用的主体部分      | menu - 菜单    |
| ol - 有序列表 ordered list     | footer - 最近一个章节内容或者根节点元素的页脚  |                |
| li -  列表项 list item         | aside - 表示与页面内容几乎无关的部分，如侧边栏 |                |
| ul - 无序列表 unordered list   | nav - 表示导航链接导航部分，如菜单，目录和索引 |                |
| option - 选项菜单项            |                                                |                |

## H5 标签

header footer section article aside 

video audio canvas

fieldset address

dialog 对话框

progress 进度指示

meter 范围值

```html
<address>
  <a href="mailto:jim@example.com">jim@example.com</a><br />
  <a href="tel:+14155550132">+1 (415) 555‑0132</a>
</address>


<nav class="crumbs">
  <ol>
    <li class="crumb"><a href="#">Bikes</a></li>
    <li class="crumb"><a href="#">BMX</a></li>
    <li class="crumb">Jump Bike 3000</li>
  </ol>
</nav>

<form>
  <fieldset>
    <legend>Choose your favorite monster</legend>

    <input type="radio" id="kraken" name="monster" value="K" />
    <label for="kraken">Kraken</label><br />

    <input type="radio" id="sasquatch" name="monster" value="S" />
    <label for="sasquatch">Sasquatch</label><br />

    <input type="radio" id="mothman" name="monster" value="M" />
    <label for="mothman">Mothman</label>
  </fieldset>
</form>
```

