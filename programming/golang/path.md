## filepath

### Join

`Join`函数可以将任意数量的路径元素放入一个单一路径里，会根据需要添加斜杠。结果是经过简化的，所有的空字符串元素会被忽略。

例如：

```go
fmt.Println(path.Join("c:", "aa", "bb", "cc.txt"))
// c:/aa/bb/cc.txt
```

源码：

```go
func join(elem []string) string {
	for i, e := range elem {
		if e != "" {
			return joinNonEmpty(elem[i:])
		}
	}
	return ""
}

// joinNonEmpty is like join, but it assumes that the first element is non-empty.
func joinNonEmpty(elem []string) string {
	if len(elem[0]) == 2 && elem[0][1] == ':' {
		// First element is drive letter without terminating slash.
		// Keep path relative to current directory on that drive.
		// Skip empty elements.
		i := 1
		for ; i < len(elem); i++ {
			if elem[i] != "" {
				break
			}
		}
		return Clean(elem[0] + strings.Join(elem[i:], string(Separator)))
	}
	// The following logic prevents Join from inadvertently creating a
	// UNC path on Windows. Unless the first element is a UNC path, Join
	// shouldn't create a UNC path. See golang.org/issue/9167.
	p := Clean(strings.Join(elem, string(Separator)))
	if !isUNC(p) {
		return p
	}
	// p == UNC only allowed when the first element is a UNC path.
	head := Clean(elem[0])
	if isUNC(head) {
		return p
	}
	// head + tail == UNC, but joining two non-UNC paths should not result
	// in a UNC path. Undo creation of UNC path.
	tail := Clean(strings.Join(elem[1:], string(Separator)))
	if head[len(head)-1] == Separator {
		return head + tail
	}
	return head + string(Separator) + tail
}

// isUNC reports whether path is a UNC path.
func isUNC(path string) bool {
	return volumeNameLen(path) > 2
}
```

### IsAbs

