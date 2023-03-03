# big-chat

<div align="center">

![demo](https://user-images.githubusercontent.com/119478410/222645065-da5d487c-5fd6-4c98-b376-4e295f6a5949.png)
![demo1](https://user-images.githubusercontent.com/119478410/222645076-214db6fd-d1b2-46df-9ea8-267df55fea0f.png)

</div>

# 环境 & 支持

PHP > 7.4 and Sqlite3

github.com/orhanerday/OpenAI

# Docker快速搭建

```sh
git clone https://github.com/jackmamaa/big-chat.git
```
```sh
docker build -t big-chat .
```
```sh
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-xxxxxxx big-chat
```
