# 人工大聪明

<div align="center">

![demo_1](https://user-images.githubusercontent.com/119478410/225586850-6641fee3-614f-414b-916b-f3a31ec075c4.gif)

</div>

# 环境 & 支持

PHP > 7.4 and Sqlite3

https://github.com/orhanerday/OpenAI

# Docker快速搭建
```sh
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-xxxxxxx holdroot/big-chat:latest
```
# 或
```sh
git clone https://github.com/jackmamaa/big-chat.git
```
```sh
docker build -t big-chat .
```
```sh
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-xxxxxxx big-chat
```
