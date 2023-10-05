# Time tracking backend

```
# start tmp mysql with docker
sudo docker run --rm --name mysql-timetracking \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=test \
    -e MYSQL_DATABASE=timetracking \
    -d mysql:8

sudo docker exec -it mysql-timetracking bash
```

## Usefull sqls

```
show databases;
use timetracking;
show tables;
quit;
```
