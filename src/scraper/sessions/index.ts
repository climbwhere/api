import boulderPlus from "./boulder-plus";
import bff from "./bff";

import type { Context } from "../context";

const SCRAPERS = [boulderPlus, bff];

const scrape = async (ctx: Context): Promise<void> => {
  await Promise.all(SCRAPERS.map((scrape) => scrape(ctx)));
};

export default scrape;
