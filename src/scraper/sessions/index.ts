import boulderPlus from "./boulder-plus";
import boulderWorld from "./boulder-world";
import bff from "./bff";
import oyeyo from "./oyeyo";
import lighthouse from "./lighthouse";
import zVertigo from "./z-vertigo";
// import fitbloc from "./fitbloc";

import type { Context } from "../context";

// TODO: Pass slug through scraper arguments
const SCRAPERS = [
  { slug: "boulder-plus", scrape: boulderPlus },
  { slug: "bff", scrape: bff },
  { slug: "oyeyo", scrape: oyeyo },
  { slug: "lighthouse", scrape: lighthouse },
  { slug: "z-vertigo", scrape: zVertigo },
  { slug: "boulder-world", scrape: boulderWorld },
  // { slug: "fitbloc", scrape: fitbloc },
];

const scrape = async (ctx: Context): Promise<void> => {
  const results = await Promise.all(
    SCRAPERS.map(async ({ slug, scrape }) => {
      try {
        const data = await scrape(ctx);
        return { slug, result: { data } };
      } catch (error) {
        return { slug, result: { error: { message: error.message } } };
      }
    }),
  );

  const sessions = {};
  results.map((result) => {
    sessions[result.slug] = result.result;
  });

  await ctx.db("snapshots").insert({
    data: { sessions },
  });
};

export default scrape;
