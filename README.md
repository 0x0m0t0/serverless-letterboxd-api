# Personal serverless Letterboxd API

---

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
TOKEN="YourUserGeneratedToken" #special characters might cause issues
```

## Live API

```
/feed
```

## Auth

```
"Bearer" + Token
```
