import boulderPlus from "./boulder-plus";
import boulderWorld from "./boulder-world";
import bff from "./bff";
import oyeyo from "./oyeyo";
import lighthouse from "./lighthouse";
import zVertigo from "./z-vertigo";

import type { Context } from "../context";
import { Session } from "../../db/models";

type Result = {
  [slug: string]:
    | {
        data: Session[];
      }
    | {
        error: { message: string };
      };
};

const SCRAPERS = [
  { slug: "boulder-plus", scrape: boulderPlus },
  { slug: "bff", scrape: bff },
  { slug: "oyeyo", scrape: oyeyo },
  { slug: "lighthouse", scrape: lighthouse },
  { slug: "z-vertigo", scrape: zVertigo },
  { slug: "boulder-world", scrape: boulderWorld },
];

const scrape = async (ctx: Context): Promise<Result> => {
  const results = await Promise.all(
    SCRAPERS.map(async ({ scrape, slug }) => {
      try {
        const sessions = await scrape(ctx, slug);
        return { slug, data: sessions };
      } catch (error) {
        return { slug, error: { message: error.message } };
      }
    }),
  );

  const sessions = {};
  results.forEach(({ slug, ...result }) => {
    sessions[slug] = result;
  });

  return sessions;
};

export default scrape;
