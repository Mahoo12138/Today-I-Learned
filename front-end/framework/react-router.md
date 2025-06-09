---
title: React Router
---
## 嵌套路由父路由元素问题

在使用 `createHashRouter` 定义路由时，会有这样的情况：

```jsx
{
  path: "/home/carrier-shipment",
  element: <CarrierShipment />
  children: [
    {
      path: "/home/carrier-shipment/query",
      lazy: async () => ({
        Component: (await import("@/pages/CarrierShipment/List")),
      }),
    },

  ],
}
```

通常情况下，会在跳转到 `/home/carrier-shipment` 路由后，自动跳转到 `/home/carrier-shipment/query`，然后我看到的做法是，是给父路由添加一个组件，如上：

```js
import React, { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export default function CarrierShipment(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isParentPage = location.pathname === '/home/carrier-shipment';

  useEffect(() => {
    if (isParentPage) navigate('/home/carrier-shipment/query');
  }, [isParentPage]);

  return <Outlet />;
}
```

然后在这个组件内部进行跳转，当然这样的写法肯定是能完成需求的，但是过于麻烦，除非有额外的逻辑，要处理，否则直接用 index 路由定义，使用`Navigate` 进行跳转即可：

```jsx
{
  path: "/home/carrier-shipment",
  children: [
    {
      index: true,
      element: <Navigate to="query" replace />
    },
   // ...other routes
  ],
}
```