---
id: b352c516-0537-11ef-8305-5300ed7bf09c
---

# React Playground 实现原理揭秘

#Omnivore

[Read on Omnivore](https://omnivore.app/me/react-playground-18f23c77659)
[Read Original](https://juejin.cn/post/7362309246556520487)

## Highlights

> <mark class="omni omni-red">编译过程中用自己写的 babel 插件实现 import 的 source 的修改，变为 URL.createObjectURL + Blob 生成的 blob url，把模块内容内联进去。</mark>
>
><mark class="omni omni-red"> 对于 react、react-dom 这种包，用 import maps 配合 [esm.sh](https://esm.sh/) 网站来引入。</mark> [⤴️](https://omnivore.app/me/react-playground-18f23c77659#23cbca78-c079-4bdf-b81f-16c8ec212f7e)  ^23cbca78

