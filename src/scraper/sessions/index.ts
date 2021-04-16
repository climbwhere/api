import boulderPlus from "./boulder-plus";

import type { Context } from "../context";

const SCRAPERS = [boulderPlus];

const scrape = async (ctx: Context): Promise<void> => {
  await Promise.all(SCRAPERS.map((scrape) => scrape(ctx)));
};

export default scrape;
