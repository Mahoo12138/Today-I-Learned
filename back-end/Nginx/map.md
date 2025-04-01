## 概述

**`map` 模块** 是一个强大的配置工具，用于**根据一个变量的值生成另一个变量的值**。它本质上是一个基于值的“查表映射”，常用于：

- 设置条件变量
- 扩展 `if` 的能力（避免嵌套 `if`）
- 动态生成响应头、缓存控制、代理目标等

### 基本语法

```nginx
map $source_variable $target_variable {
    default default_value;
    key1    value1;
    key2    value2;
    ...
}
```

- `$source_variable`：输入变量，用于匹配判断。
- `$target_variable`：输出变量，`map` 结果将赋值给它。
- `default`：默认值，当 `$source_variable` 没有匹配任何 key 时使用。
- `keyN valueN`：匹配项，`keyN` 是判断条件（可以是字符串、通配符或正则），`valueN` 是结果。

### 特性

#### 支持正则匹配（`~` 或 `~*`）：

- `~`：大小写敏感正则
- `~*`：不区分大小写的正则

```nginx
map $request_uri $is_api {
    default 0;
    "~^/api/" 1;
}
```

#### 支持通配符匹配

```nginx
map $host $use_ssl {
    default 0;
    "secure.example.com" 1;
    "*.secure.com"       1;
}
```

## 常见用法

### **1. 根据 User-Agent 判断是否是爬虫**

```nginx
map $http_user_agent $is_bot {
    default 0;
    "~*googlebot"     1;
    "~*bingbot"       1;
    "~*baiduspider"   1;
    "~*spider"        1;
}
```

- 如果 `$http_user_agent` 包含某些关键词（如 `googlebot`、`spider`），则 `$is_bot` 为 `1`。
- 否则默认为 `0`，表示不是爬虫。

配合使用：

```nginx
location / {
    if ($is_bot) {
        return 403;  # 拒绝爬虫访问
    }

    try_files $uri $uri/ =404;
}
```

### 2. 根据 URI 设置不同缓存时间

```nginx
map $uri $cache_control {
    default                          "no-cache";
    "~*\.css$"                       "public, max-age=86400";
    "~*\.js$"                        "public, max-age=86400";
    "~*\.jpg$|\.png$|\.gif$"        "public, max-age=604800";
}
```

应用：

```nginx
location /static/ {
    add_header Cache-Control $cache_control;
    try_files $uri =404;
}
```

- 对 `.css`、`.js`、图片资源设置长缓存；
- 其他默认不缓存。

### 3. 根据 Host 动态切换反向代理目标

```nginx
map $host $backend_upstream {
    default          backend_default;
    "api.example.com" backend_api;
    "img.example.com" backend_img;
}
```

配合使用：

```nginx
location / {
    proxy_pass http://$backend_upstream;
}
```

- 动态选择后端服务，无需多个 `server` 块；
- 非常适合 **多租户系统** 或 **域名路由**。

### **4. 与 geo 配合，设置响应头**

```nginx
geo $country_code {
    default "US";
    1.1.1.1 "CN";
    8.8.8.8 "DE";
}

map $country_code $greeting {
    default "Hello";
    "CN"    "你好";
    "DE"    "Hallo";
}

server {
    listen 80;

    location / {
        add_header X-Greeting $greeting;
        return 200 "Served with love.";
    }
}
```

## 注意事项

- `map` **只能在 `http` 块中定义**，不能在 `server` 或 `location` 中。
- 匹配顺序是：
  1. 精确字符串
  2. 通配符
  3. 正则表达式
  4. `default`
- 不支持嵌套 `map`。
