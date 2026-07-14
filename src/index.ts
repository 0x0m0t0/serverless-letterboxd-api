import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { XMLParser } from "fast-xml-parser";

type Bindings = {
  TOKEN: string;
  URL: string;
  USER: string;
};

type FeedItem = {
  title?: string;
  link?: string;
  description?: string;
  "letterboxd:filmTitle"?: string | number;
  "letterboxd:filmYear"?: number;
  "letterboxd:memberRating"?: number;
  "letterboxd:memberLike"?: string;
  "letterboxd:rewatch"?: string;
  "letterboxd:watchedDate"?: string;
  "tmdb:movieId"?: number;
};

const posterRegex = /<img[^>]*src="([^"]*)"[^>]*>/;

const toStars = (rating: number) =>
  "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");

// isArray: feeds with a single entry parse as an object instead of an array
// htmlEntities: decode &#039; etc. in film titles
const parser = new XMLParser({
  isArray: (name) => name === "item",
  htmlEntities: true,
});

const fetchFeed = async (url: string, user: string) => {
  const response = await fetch(url, {
    headers: { "User-Agent": "personal-letterboxd-api" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });

  if (!response.ok) {
    throw new Error(`Letterboxd responded with status ${response.status}`);
  }

  const feed = parser.parse(await response.text());
  const items: FeedItem[] = feed?.rss?.channel?.item ?? [];

  return items.map((item) => {
    const rating = item["letterboxd:memberRating"] ?? null;

    return {
      title: item["letterboxd:filmTitle"] ?? item.title ?? null,
      year: item["letterboxd:filmYear"] ?? null,
      rating,
      stars: rating !== null ? toStars(rating) : null,
      liked: item["letterboxd:memberLike"] === "Yes",
      rewatch: item["letterboxd:rewatch"] === "Yes",
      link: item.link?.replace(user, "") ?? null,
      poster: item.description?.match(posterRegex)?.[1] ?? null,
      watchedOn: item["letterboxd:watchedDate"] ?? null,
      tmdbId: item["tmdb:movieId"] ?? null,
    };
  });
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());
app.use("*", prettyJSON());

app.get("/", (c) => c.text("your personal letterboxd api is running"));

app.use("/api/*", (c, next) =>
  bearerAuth<{ Bindings: Bindings }>({ token: c.env.TOKEN })(c, next),
);

app.get("/api/feed", async (c) => {
  try {
    const response = await fetchFeed(c.env.URL, c.env.USER);
    return c.json({ status: 200, response });
  } catch (error) {
    console.error("Failed to fetch Letterboxd feed:", error);
    return c.json(
      { status: 502, message: "Failed to fetch Letterboxd feed" },
      502,
    );
  }
});

export default app;
