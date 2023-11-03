import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { XMLParser } from "fast-xml-parser";
import { env } from "hono/adapter";

type Bindings = {
  TOKEN: string;
  URL: string;
  USER: string;
  PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

const regex = /<img[^>]*src="([^"]*)"[^>]*>/;
const regexStars = /[★½]+/g;
const regexTitle = /([^,]+), \d{4}/;
const regexYear = /\b\d{4}\b/;

const fetchRssFeed = async (url: string, user: string) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch XML. Status: ${response.status}`);
    }

    const xmlData = await response.text();

    const parser = new XMLParser();
    const feed = parser.parse(xmlData);

    if (feed !== null) {
      const data = feed?.rss?.channel?.item?.map((item: any) => {
        const mtch = item?.description?.match(regex);
        const poster = mtch ? mtch[1] : null;

        return {
          title: item?.title?.match(regexTitle)?.[1],
          // year: item?.title?.match(regexYear)?.[0],
          year: item?.["letterboxd:filmYear"],
          stars: item?.title?.match(regexStars)?.[0]
            ? item.title.match(regexStars)?.[0]
            : null,
          link: item?.link?.replace(user, ""),
          poster: poster,
          watchedOn: new Date(item?.["letterboxd:watchedDate"]),
        };
      });
      return data;
    }
  } catch (error) {
    return {
      status: 500,
      message: error,
    };
  }
};

app.use("*", prettyJSON());

app.get("/", (c) => c.text("hello welcome to your personal letterboxd api"));

const getTokenFromEnvironment = (c: any) => {
  const { TOKEN } = env<{ TOKEN: string }>(c);
  return TOKEN;
};

app.use("/api/*", async (c, next) => {
  const token = getTokenFromEnvironment(c);
  const auth = bearerAuth({
    token: token,
  });
  await auth(c, next);
});

app.get("/api/feed", async (c, next) => {
  try {
    const response = await fetchRssFeed(c.env.URL, c.env.USER);
    console.log(response);
    return c.json({ status: 200, response });
  } catch (error) {
    c.json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

export default app;
