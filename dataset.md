netstat -ano | findstr 8080 
连接数据库
```sh
mongosh
use MagicSwap
```
查看有哪些表
```sh
show collections
```
某个表里查看所有数据（以users表为举例）
```sh
db.users.find()
```
两次Ctrl C可以退出