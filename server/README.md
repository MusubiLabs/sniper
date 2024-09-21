## Dev

1. start postgress on local

```
docker run --name sniper-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

2. install dep
```
pnpm install
```

3. start server
```
npm run start:dev
```
