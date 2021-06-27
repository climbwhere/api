import { chain, flatten, keyBy, keys, map, orderBy } from "lodash";
import getLatestSnapshot from "../../db/queries/getLatestSnapshot";

import type { Gym } from "../../db/models";
import type { Context } from "../context";
import type { Handler } from "./types";

type ResponseBody = {
  data: Session[];
};

type Session = {
  id: string;
  starts_at: Date;
  ends_at: Date;
  spaces: number;
  gym: {
    id: string;
    slug: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
};

export const index: Handler = (ctx: Context) => async (req, res) => {
  const snapshot = await getLatestSnapshot(ctx.db);

  const gyms = keyBy(
    await Promise.all<Gym>(
      keys(snapshot.data.sessions).map((slug) =>
        ctx.db<Gym>("gyms").where({ slug }).first(),
      ),
    ),
    "slug",
  );

  const sessions = chain(snapshot.data.sessions)
    .map((result, gymSlug): Session[] => {
      if (result.error) {
        return [];
      }
      const gym = gyms[gymSlug];
      return map(result.data, (session) => ({
        ...session,
        gym_id: undefined,
        gym,
      }));
    })
    .flatten()
    .orderBy("starts_at", "asc")
    .value();

  const body: ResponseBody = {
    data: sessions,
  };
  res.json(body);
};

export default {
  index,
};
