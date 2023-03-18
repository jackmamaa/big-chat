# 人工大聪明

<div align="center">

![demo_gif](https://user-images.githubusercontent.com/119478410/225615975-43f23ab5-2366-4a56-a6fa-e463cf11ffee.gif)

</div>

# 环境 & 支持

PHP > 7.4 和 Sqlite3 => PHP5.3.0及以上版本默认启用

https://github.com/orhanerday/OpenAI

# 快速开始

## Docker
```sh
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-xxxxxxx holdroot/big-chat:latest
```
## 或
```sh
git clone https://github.com/jackmamaa/big-chat.git
```
```sh
docker build -t big-chat .
```
```sh
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-xxxxxxx big-chat
```

# 开始

* #### 克隆到本地
```sh
git clone https://github.com/jackmamaa/big-chat.git
```
* #### 进入目录
```sh
cd big-chat
```
* #### 安装支持库 OrhanErday/OpenAI
```sh
composer require orhanerday/open-ai
```

* #### 在’event-stream.php‘设置你的OPENAI API
```php
$open_ai_key = ""; 
```

* #### 打开web服务
```sh
php -S localhost:8000 -t .
```
* #### 现在你可以访问站点：http://localhost:8000
