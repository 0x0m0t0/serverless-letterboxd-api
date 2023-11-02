# Personal serverless Letterboxd API
----

- Letterboxd RSS converted to serverless REST API
- Deployed to Cloudflare Workers


## Install

```
bun install
bun run dev
```

## Deploy to Cloudflare

```
bun run deploy
```

## Add variables in cloudflare

```
USER=/letterboxdUsername
URL=https://letterboxd.com/letterboxdUsername/rss
```

## Live API

```
/feed
```
