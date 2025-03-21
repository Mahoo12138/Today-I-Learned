## 前言

Docker Compose 是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排。

使用 Dockerfile 可以很容易定义一个单独的应用容器。但是对于多个容器相互配合来完成某项任务时，如要实现一个 Web 项目，除了 Web 服务容器本身，往往还需要后端的数据库服务容器；再比如在分布式应用一般包含若干个服务，每个服务一般都会部署多个实例。

如果每个服务都要手动启停，那么效率之低、维护量之大可想而知。这时候就需要一个工具能够管理一组相关联的的应用容器，这就是 Docker Compose。
## 基本概念

- 项目（Project）：由一组关联的应用容器组成的一个完整业务单元，在 *docker-compose.yml* 文件中定义。
- 服务（Service）：一个应用的容器，实际上可以包括若干运行相同镜像的容器实例。


## 配置文件

+ `version`：定义关乎于 docker 的兼容性，Compose 文件格式有 3 个版本,分别为 1, 2.x 和 3.x；
+ `name`：定义项目名称，可通过环境变量 `COMPOSE_PROJECT_NAME` 访问；
+ `services`：定义每个容器服务的名称及其相关设置，每个服务可以看作一个 Docker 容器实例。每个服务通常包括镜像、端口、环境变量、挂载等配置；
	+ `image`：容器镜像，格式为 `[<registry>/][<project>/]<image>[:<tag>|@<digest>]`；

### 扩展

使用 `x-` 的顶层元素，可用于模块化重用配置，当然这些配置会被 Compose 忽略。

扩展字段也能被用于锚点和别名（属于 yaml 的功能），例如：

```yml
x-env: &env
  environment:
    - CONFIG_KEY
    - EXAMPLE_KEY
 
services:
  first:
    <<: *env
    image: my-image:latest
  second:
    <<: *env
    image: another-image:latest
```

> `&` 用来建立锚点，`<<` 表示合并到当前数据，`*` 用来引用锚点。
## 常用命令

