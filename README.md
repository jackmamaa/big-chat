# 人工大聪明

<div align="center">

https://user-images.githubusercontent.com/119478410/225585298-5610207d-b56d-4920-855e-c240fd848899.mp4

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
