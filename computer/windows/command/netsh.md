## 什么是 netsh？

- **功能定位**：通过命令行界面配置网络接口、防火墙、路由、无线网络、NAT 等。
- **适用场景**：
  - 快速修改网络设置（如 IP 地址、DNS）
  - 管理 Windows 防火墙规则
  - 生成网络诊断报告
  - 批量部署网络配置（通过脚本）

## 常用基础操作

### 网络接口管理

**查看所有网络接口**

```shell
netsh interface show interface
```

输出示例：

```text
Admin State    State          Type             Interface Name
-------------------------------------------------------------------------
Enabled        Disconnected   Dedicated        以太网
Enabled        Connected      Dedicated        WLAN
Enabled        Connected      Dedicated        本地连接
Enabled        Connected      Dedicated        Tailscale
```

**启用/禁用网络接口**

```shell
netsh interface set interface "Interface Name" enable
netsh interface set interface "Interface Name" disable
```

**设置静态 IP 地址**

```shell
netsh interface ip set address "Interface Name" static 192.168.1.100 255.255.255.0 192.168.1.1
```

**设置 DHCP 自动获取 IP**

```shell
netsh interface ip set address "Interface Name" dhcp
```

### **DNS 配置**

**设置静态 DNS**

```shell
netsh interface ip set dns "Interface Name" static 8.8.8.8
```

**添加备用 DNS**

```shell
netsh interface ip add dns "Interface Name" 8.8.4.4 index=2
```

**恢复 DHCP 分配的 DNS**

```shell
netsh interface ip set dns "Interface Name" dhcp
```

### **防火墙管理**

**查看防火墙状态**：

```shell
netsh advfirewall show allprofiles
```

**启用/禁用防火墙**：

```shell
netsh advfirewall set allprofiles state on
netsh advfirewall set allprofiles state off
```

**添加放行端口的规则**：

```shell
netsh advfirewall firewall add rule name="Open Port 80" dir=in action=allow protocol=TCP localport=80
```

### **无线网络管理**

**查看已保存的 Wi-Fi 配置文件**

```shell
netsh wlan show profiles
```

**导出 Wi-Fi 配置文件（备份）**

```shell
netsh wlan export profile name="MyWiFi" folder=C:\Backup
```

**连接指定 Wi-Fi**

```shell
netsh wlan connect name="MyWiFi" ssid="MyWiFi"
```

## **实际应用案例**

### **端口转发（NAT）**

将本地`192.168.1.200:8080` 的请求转发到将 `127.0.0.1:8080`，以及删除：

```shell
netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=8080 connectaddress=192.168.1.200 connectport=8080
netsh interface portproxy delete v4tov4 listenaddress=127.0.0.1 listenport=8080
```

