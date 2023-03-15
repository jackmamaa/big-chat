# 人工大聪明

<div align="center">

![demo](https://user-images.githubusercontent.com/119478410/225320351-55e862b3-96f3-4d68-9746-712814de7f52.gif)

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
