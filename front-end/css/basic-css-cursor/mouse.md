## 纯 CSS 实现鼠标跟随

**如何实时监测到当前鼠标处于何处？**

要监测到当前鼠标处于何处，我们只需要在页面上铺满元素即可：

我们使用 100 个元素，将整个页面铺满，hover 的时，展示颜色，核心 SCSS 代码如下：

```html
<div class="g-container">
  <div class="position"></div>
  <div class="position"></div>
  <div class="position"></div>
  <div class="position"></div>
  ... // 100个
</div>
```

```scss
.g-container {
    position: relative;
    width: 100vw;
    height: 100vh;
}

.position {
    position: absolute;
    width: 10vw;
    height: 10vh;
}

@for $i from 0 through 100 { 
    
    $x: $i % 10;
    $y: ($i - $x) / 10;
    
    .position:nth-child(#{$i + 1}) {
        top: #{$y * 10}vh;
        left: #{$x * 10}vw;
    }

    .position:nth-child(#{$i + 1}):hover {
        background: rgba(255, 155, 10, .5)
    }
}
```

可以得到一片跟随的鼠标的色块，当鼠标位于某个色块上时触发其 `hover` 效果；

继续，我们再给页面添加一个元素（圆形小球），将它绝对定位到页面中间：

```html
<div class="g-ball"></div>
```

```css
.ball {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10vmax;
    height: 10vmax;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
```

最后，借助 `~` 兄弟元素选择器，在 hover 页面的时候（其实是 hover 一百个隐藏的 div），通过当前 hover 到的 div，去控制小球元素的位置：

```scss
@for $i from 0 through 100{ 
    
    $x: $i % 10;
    $y: ($i - $x) / 10;
    
    .position:nth-child(#{$i + 1}):hover ~ .ball {
        top: #{$y * 10}vh;
        left: #{$x * 10}vw;
    }
}
```

### 存在的问题

就上面的 Demo 来看，还是有很多瑕疵的，譬如

#### 精度太差

只能控制元素运动到 div 所在空间，而不是精确的鼠标所在位置，针对这一点，我们可以通过增加隐藏的 div 的数量来优化。譬如将 100 个平铺 div 增加到 1000 个平铺 div。

#### 运动不够丝滑

效果看起来不够丝滑，这个可能需要通过合理的缓动函数，适当的动画延时来优化。

### 鼠标跟随指示

1. 默认的铺满背景的 div 的 `transition-duration: 0.5s`
2. 当 hover 到元素背景 div 的时候，改变当前 hover 到的 div 的 `transition-duration: 0s`，并且 hover 的时候赋予背景色，这样当前 hover 到的 div **会立即展示**
3. 当鼠标离开 div，div 的 `transition-duration` 变回默认状态，也就是 `transition-duration: 0.5s`，同时背景色消失，这样被离开的 div 的背景色将慢慢过渡到透明，造成虚影的效果

```scss
.box {
    position: relative;
    float: left;
    width: 30px;
    height: 30px;
    margin: 4px;
    border: 1px solid red;
    
    &::before {
        content: "";
        position: absolute;
        border-radius: 50%;  
        transform: scale3d(0.1, 0.1, 1);
        background-color: transparent;
        transition: .5s transform ease-in,
            .5s background ease-in;
    }
}

.box:hover {
    &::before {
        transform: scale3d(1.8, 1.8, 1.8);
        transition: 0s transform;
    }
}

```

