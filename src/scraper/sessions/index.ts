import boulderPlus from "./boulder-plus";
import boulderWorld from "./boulder-world";
import bff from "./bff";
import b8a from "./b8a";
import boruda from "./boruda";
import oyeyo from "./oyeyo";
import lighthouse from "./lighthouse";
import zVertigo from "./z-vertigo";
import fitbloc from "./fitbloc";
import theRockSchool from "./the-rock-school";
import boulderPlanet from "./boulder-planet";
import boulderMovementTaiSeng from "./boulder-movement-tai-seng";
import boulderMovementDowntown from "./boulder-movement-downtown";
import boulderMovementRochor from "./boulder-movement-rochor";

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
  { slug: "b8a", scrape: b8a },
  { slug: "boruda", scrape: boruda },
  { slug: "oyeyo", scrape: oyeyo },
  { slug: "lighthouse", scrape: lighthouse },
  { slug: "z-vertigo", scrape: zVertigo },
  { slug: "boulder-world", scrape: boulderWorld },
  { slug: "boulder-planet", scrape: boulderPlanet },
  { slug: "fitbloc", scrape: fitbloc },
  { slug: "the-rock-school", scrape: theRockSchool },
  { slug: "boulder-movement-tai-seng", scrape: boulderMovementTaiSeng },
  { slug: "boulder-movement-downtown", scrape: boulderMovementDowntown },
  { slug: "boulder-movement-rochor", scrape: boulderMovementRochor },
];

const scrape = async (ctx: Context): Promise<Result> => {
  const results = await Promise.all(
    SCRAPERS.map(async ({ scrape, slug }) => {
      try {
        const sessions = await scrape(ctx, slug);
        return { slug, data: sessions };
      } catch (error) {
        console.error(error);
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
