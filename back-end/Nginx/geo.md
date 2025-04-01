## 概述

Nginx 的 `geo` 模块用于根据客户端的 IP 地址来设置一个变量，常用于实现访问控制、地理定位或其他基于 IP 地址的配置。该模块的主要作用是根据客户端的 IP 地址来设置变量，从而决定是否允许访问或做出其他响应。

`geo` 模块通常用于：

- IP 黑白名单
- IP 地理位置的访问控制
- 限制某些国家或地区的访问
- 设置基于 IP 地址的变量，用于后续处理（例如设置不同的负载均衡策略）

### **基本语法**

```nginx
geo $variable {
    default value;
    IP_range1 value1;
    IP_range2 value2;
    ...
}
```

- **`$variable`**： 这是你要设置的变量名，通常是一个全局变量。
- **`default value`**： 如果请求的 IP 不在指定的 IP 范围内，将赋予 `value`。
- **`IP_range value`**： 匹配特定 IP 地址范围的规则。`IP_range` 可以是一个单独的 IP 地址、IP 段，或者一个子网。
- **`value`**： 这是对应 IP 范围或 IP 地址时，给定的值。可以是数字、字符串等。

## 常见用法

### 1. **实现 IP 黑名单和白名单**

最常见的用法之一是通过 `geo` 模块实现黑名单和白名单控制。你可以根据 IP 地址的范围来允许或拒绝访问。

**示例：允许某些 IP，拒绝其他所有 IP**

```nginx
http {
    geo $blocked {
        default 1;         # 默认情况下，所有 IP 都被阻止
        192.168.1.1 0;     # 允许 192.168.1.1 访问
        10.0.0.0/8 0;      # 允许 10.0.0.0/8 范围的 IP 访问
    }

    server {
        listen 80;

        location / {
            if ($blocked) {
                return 403;  # 阻止访问
            }

            # 其他正常请求处理
            try_files $uri $uri/ =404;
        }
    }
}
```

在这个例子中：

- 默认情况下，所有 IP 地址都被视为被阻止（`$blocked = 1`）。
- 对于 `192.168.1.1` 和 `10.0.0.0/8` 范围内的 IP 地址，`$blocked` 被设置为 `0`，即允许访问。
- 如果 `$blocked` 的值是 `1`，则返回 403 Forbidden。

### 2. **IP 地理位置限制**

`geo` 模块可以用来限制特定地区的访问。例如，你可以根据 IP 地址范围来允许或阻止来自特定国家或地区的访问。

**示例：基于国家的访问控制**

假设你有一个数据库或文件，列出了每个国家的 IP 地址段，你可以根据这些 IP 地址段来限制来自特定国家的请求。

```nginx
http {
    geo $country {
        default "US";        # 默认是美国
        192.168.0.0/16 "CN"; # 允许来自中国的 IP 地址段
        203.0.113.0/24 "DE"; # 允许来自德国的 IP 地址段
    }

    server {
        listen 80;

        location / {
            if ($country = "CN") {
                return 403;  # 阻止来自中国的访问
            }

            # 其他正常请求处理
            try_files $uri $uri/ =404;
        }
    }
}
```

在这个例子中：

- 通过 `geo` 模块设置了一个 `$country` 变量，用于标识请求来源的国家。
- 默认情况下，所有请求的国家被标识为 `"US"`（美国）。
- 如果 IP 地址段匹配到中国（`CN`）或德国（`DE`），则根据规则进行相应的访问控制。

### 3. **基于 IP 设置自定义变量**

`geo` 模块也可以用来设置其他类型的变量，这些变量可以在配置中的其他地方使用。例如，你可以根据 IP 地址设置负载均衡器的权重。

**示例：根据 IP 地址设置负载均衡权重**

```nginx
http {
    geo $ip_weight {
        default 1;          # 默认的负载均衡权重为 1
        192.168.1.1 10;     # 192.168.1.1 的权重为 10
        10.0.0.0/8 5;       # 10.0.0.0/8 的权重为 5
    }

    upstream backend {
        server backend1.example.com weight=$ip_weight;
        server backend2.example.com weight=$ip_weight;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend;
        }
    }
}
```

在这个例子中：

- 根据请求的 IP 地址，`$ip_weight` 变量的值会被动态设置。这个值用来设置负载均衡器的权重，影响请求分配到不同服务器的比例。
- 来自 `192.168.1.1` 的请求有更高的权重（10），而来自 `10.0.0.0/8` 的请求有中等的权重（5）。

### **4. 结合 `geo` 和 `map` 模块**

`geo` 模块和 `map` 模块常常配合使用。`map` 模块允许你基于一个变量的值，映射到不同的变量值或直接返回响应。

**示例：结合 `geo` 和 `map` 实现 IP 限制**

```nginx
http {
    geo $blocked {
        default 0;
        192.168.1.1 1;  # 黑名单 IP
    }

    map $blocked $response_code {
        1 403;  # 黑名单 IP 返回 403
        0 200;  # 正常请求返回 200
    }

    server {
        listen 80;

        location / {
            return $response_code;
        }
    }
}
```

在这个示例中：

- `geo` 模块根据 IP 地址将 `$blocked` 设置为 `1` 或 `0`。
- `map` 模块基于 `$blocked` 变量的值来设置不同的响应码。
- 如果请求来自黑名单 IP，返回 `403 Forbidden`，否则返回 `200 OK`。
