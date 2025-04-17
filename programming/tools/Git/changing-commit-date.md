---
title: 修改提交日期
---
```bash
# 启动交互式变基（假设修改最近两个提交）
git rebase -i HEAD~2

# 将目标提交标记为 "edit"，保存退出后，Git 会停在待修改的提交
# 修改提交的 AuthorDate 和 CommitDate
git commit --amend --date="2025-04-07T15:10:07 +0800" --no-edit

# 设置 CommitDate 为指定时间（关键步骤！）
export GIT_COMMITTER_DATE="2025-04-07T15:10:07 +0800"

# 继续变基
git rebase --continue
```

注意区分 `GIT_AUTHOR_DATE` 和 `GIT_COMMITTER_DATE`，一个是作者提交日期，也就是 `--amend`修改的日期，另一个才是提交真实产生的日期，通过环境变量进行修改。

如上，这样就可以愉快地偷懒式贴瓷砖了！