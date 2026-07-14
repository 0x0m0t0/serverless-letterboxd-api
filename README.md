# Personal serverless Letterboxd API

---

- Letterboxd RSS converted to serverless REST API
- Deployed to Cloudflare Workers

## Install

```
bun install
bun run dev
```

`bun run dev` runs locally; use `bun run dev:remote` to run on Cloudflare's edge.

## Local variables

For local development, create a `.dev.vars` file (wrangler reads this, not `.env`):

```
USER=/letterboxdUsername
URL=https://letterboxd.com/letterboxdUsername/rss/
TOKEN=YourUserGeneratedToken
```

## wrangler.toml file

Remove the .example from wrangler.toml.example or copy the values into wrangler.toml file

## Deploy to Cloudflare

```
bun run deploy
```

& add your variables (USER, URL, TOKEN) in your worker's settings on the Cloudflare dashboard.

## Live API

```
/api/feed
```

## Auth Header

```
Authorization: Bearer Token
```

## Response

Film data is parsed from the feed's `letterboxd:*` fields:

```json
{
  "status": 200,
  "response": [
    {
      "title": "Incendies",
      "year": 2010,
      "rating": 4.5,
      "stars": "★★★★½",
      "liked": true,
      "rewatch": false,
      "link": "https://letterboxd.com/film/incendies/",
      "poster": "https://a.ltrbxd.com/resized/film-poster/...jpg",
      "watchedOn": "2026-07-13",
      "tmdbId": 46738
    }
  ]
}
```

The RSS feed also includes your public lists; those items have `watchedOn: null`, so filter on it if you only want films. Upstream fetches are cached at Cloudflare's edge for 5 minutes.
