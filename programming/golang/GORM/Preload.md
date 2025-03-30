GORM 框架中的 `Preload` 方法主要用于**预加载关联数据**，通过多 SQL 查询的方式解决 ORM 中的 N+1 查询问题。


### 核心作用

1. **关联数据加载**
    当查询主模型（如 `User`）时，自动加载其关联模型（如 `Order`），避免后续手动逐个查询关联数据。
2. **减少查询次数**
    通过 `SELECT * FROM users` + `SELECT * FROM orders WHERE user_id IN (?)` 的批量查询方式，替代逐条查询关联数据的低效操作。

### 典型使用场景

```go
type User struct {
  gorm.Model
  Username string
  Orders   []Order  // 一对多关联
}

type Order struct {
  gorm.Model
  UserID  uint
  Amount  float64
}

// 查询用户时预加载其所有订单
var user User
db.Preload("Orders").First(&user, 1)
// 此时 user.Orders 已填充关联订单数据
```

### **高级用法**

1. **条件预加载**，添加查询条件过滤关联数据：

   ```go
   db.Preload("Orders", "amount > ?", 100).Find(&users)
   ```

2. **嵌套预加载**，加载多级关联（如 `Order.Items`）：

   ```go
   db.Preload("Orders.Items").Find(&users)
   ```

3. **自定义预加载逻辑**，使用函数自定义关联查询：

   ```go
   db.Preload("Orders", func(db *gorm.DB) *gorm.DB {
     return db.Order("orders.created_at DESC")
   }).Find(&users)
   ```

------

### **与 `Joins` 的区别**

| 特性         | Preload                        | Joins                |
| :----------- | :----------------------------- | :------------------- |
| **实现方式** | 多条独立 SQL 查询              | 单条 SQL 使用 JOIN   |
| **适用场景** | 避免 JOIN 复杂度或跨表性能问题 | 需要关联表联合查询时 |
| **数据冗余** | 无冗余字段                     | 可能返回重复字段     |

------

### **注意事项**

- 关联字段名需与模型定义一致（如 `Orders`）。
- 预加载条件需符合关联模型的查询语法。
- 若关联数据量极大，需评估性能（可能不如分页查询高效）。

通过合理使用 `Preload`，可显著优化涉及关联数据的查询效率。