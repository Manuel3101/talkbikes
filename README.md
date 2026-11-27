# Talkbikes

## Local development

The backend caches GBFS data in Redis. Start it with Docker before running the backend:

```sh
docker compose up -d redis
pnpm dev
```

The backend connects to `redis://localhost:6379` by default; override it with the `REDIS_URL` environment variable.
If Redis is unreachable the backend still works, it just fetches GBFS data on every request.
