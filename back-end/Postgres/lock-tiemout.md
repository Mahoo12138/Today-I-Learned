最近看了一篇博客，原博主在业务升级中，使用 DDL 对 Postgresql 的某个表新增字段时失败，报错提示 “canceling statement due to lock timeout”，即锁超时导致语句取消。

- DDL 执行需获取 ACCESS EXCLUSIVE 锁，该锁是最强的表级锁，只有表中无活动事务时才能获取。
- 经查询，lock timeout 设置为 2 分钟。推测是业务中有事务超过 2 分钟，致使 DDL 无法获取锁。
- 通过特定 SQL 语句查询当前超过 2 分钟的活动查询，定位到一条拿 ACCESS SHARE 锁的查询 SQL，阻塞了 DDL 执行。经测试验证，事务未关闭时执行 DDL 会超时，关闭事务后 DDL 执行成功。

原博主使用了下面的 SQL 来查询当前超过 2 分钟的活动查询，定位到某条 SQL：

```sql
SELECT 
    pid,
    now() - query_start AS duration,
    state,
    query,
    application_name,
    client_addr,
    client_application_name,
    xact_start,
    query_start
FROM pg_stat_activity 
WHERE state = 'active'
  AND now() - query_start > interval '2 minutes'
  AND pid <> pg_backend_pid()  -- 排除当前查询自身
  AND datname = 'your_database_name'  -- 替换为你的数据库名
ORDER BY query_start;
```

+ `pg_stat_activity`：这是 PostgreSQL 提供的系统视图，包含当前所有数据库会话的信息；
+ `now() - query_start > interval '2 minutes'`：只显示运行时间超过 2 分钟的查询；
+ `pid <> pg_backend_pid()`：PostgreSQL 特有的函数，用于获取当前会话的进程 ID；