## VS Code 中解决本地 Go 模块跳转

可通过以下步骤直接配置 ​**gopls** ，确保 IDE 执行跳转定义而不是一并打开浏览器：

```json
{
	"gopls": {
	    "ui.navigation.importShortcut": "Definition",
	}
}

```

>  `gopls` (pronounced "Go please") is the official Go [language server](https://langserver.org/) developed by the Go team.


