### Start a mongo db with data
```
docker-compose -f mongodb.yml up -d --build
```
- -d : to run in background
- --build : to rebuild the image each time. 

### Stop the mongo db
```
docker-compose -f mongodb.yml down
```