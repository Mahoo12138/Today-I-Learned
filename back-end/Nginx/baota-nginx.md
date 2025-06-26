在宝塔的配置中，会默认使用 http2 ：
```nginx
server {
	listen 80;
	listen 443 ssl http2;
	server_name api.xxx.com;
}
```
但是在使用 Webdav 服务器时，http2 在安卓端会莫名（OKHttp）出现问题；

可以使用 http1.1 进行规避，删掉配置文件中的 http2 即可。 