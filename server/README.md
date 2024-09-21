## Dev

1. start postgress on local

```
docker run --name focus-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

2. start server

```
npm run start:dev
```
