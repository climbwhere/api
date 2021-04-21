import boulderPlus from "./boulder-plus";
import boulderWorld from "./boulder-world";
import bff from "./bff";
import oyeyo from "./oyeyo";
import lighthouse from "./lighthouse";
import zVertigo from "./z-vertigo";

import type { Context } from "../context";

const SCRAPERS = [boulderPlus, bff, oyeyo, lighthouse, zVertigo, boulderWorld];

const scrape = async (ctx: Context): Promise<void> => {
  await Promise.all(SCRAPERS.map((scrape) => scrape(ctx)));
};

export default scrape;
