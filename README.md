# Personal serverless Letterboxd API

---

- Letterboxd RSS converted to serverless REST API
- Deployed to Cloudflare Workers

## Install

```
bun install
npm install wrangler --save-dev
bun run dev
```

## Deploy to Cloudflare

```
bun run deploy
```

& add your .env variables in your worker

## Add variables in cloudflare

```
USER=/letterboxdUsername
URL=https://letterboxd.com/letterboxdUsername/rss
TOKEN="YourUserGeneratedToken" #special characters might cause issues
```

## Live API

```
/api/feed
```

## Auth

```
"Bearer" + Token
```
