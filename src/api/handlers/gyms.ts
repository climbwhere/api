import isUUID from "is-uuid";

import type { Context } from "../context";
import type { Handler } from "./types";

export const index: Handler = (ctx: Context) => async (req, res) => {
  const gyms = await ctx
    .db("gyms")
    .select("*")
    .whereNotIn("slug", [
      "bff-bukit-timah",
      "bff-bendemeer",
      "boulder-plus-aperia",
      "boulder-plus-chevrons",
    ]);
  res.json({
    data: gyms,
  });
};

export const get: Handler = (ctx: Context) => async (req, res) => {
  const { idOrSlug } = req.params;

  const gym = isUUID.v4(idOrSlug)
    ? await ctx.db("gyms").where({ id: idOrSlug }).first()
    : await ctx.db("gyms").where({ slug: idOrSlug }).first();
  if (!gym) {
    res.status(404);
    res.json({
      error: {
        message: "Gym not found.",
      },
    });
    return;
  }

  res.json({
    data: gym,
  });
};

export default {
  index,
  get,
};
