---
id: af27a4f2-ecb9-11ee-a4c2-57b6e4c6de05
---

# Vite 的实现原理，确实很巧妙
#Omnivore

[Read on Omnivore](https://omnivore.app/me/vite-18e834449cd)
[Read Original](https://juejin.cn/post/7350936959059722280)

## Highlights

> <mark class="omni omni-red">基于浏览器的 type 为 module 的 script 实现的</mark> [⤴️](https://omnivore.app/me/vite-18e834449cd#221f32e8-00c4-4974-815e-984811598310)  ^221f32e8

> <mark class="omni omni-red">这就是 vite 为什么叫 no bundle 方案，它只是基于浏览器的 module import，在请求的时候对模块做下编译。</mark> [⤴️](https://omnivore.app/me/vite-18e834449cd#b07e55b2-c551-4bff-b059-c0416a83e0be)  ^b07e55b2

> <mark class="omni omni-yellow">所以，vite 加了一个预构建功能 pre bunle。</mark>
>
><mark class="omni omni-yellow"> 在启动完开发服务器的时候，就马上对 node\_modules 下的代码做打包，这个也叫 deps optimize，依赖优化</mark> [⤴️](https://omnivore.app/me/vite-18e834449cd#d64f6dc8-aff9-4878-873c-1a58edcc55d9)  ^d64f6dc8

