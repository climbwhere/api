import getLatestSnapshot from "../../db/queries/getLatestSnapshot";
import type { Context } from "../context";
import type { Handler } from "./types";
import cache from "memory-cache";

export const get: Handler = (ctx: Context) => async (req, res) => {
  const { id } = req.params;
  let snapshot;

  const cached = cache.get(id);

  if (cached !== null) {
    snapshot = cached;
  } else {
    snapshot =
      id === "latest"
        ? await getLatestSnapshot(ctx.db)
        : await ctx.db("snapshots").where({ id }).first();

    cache.put(id, snapshot, 120000, () => {
      // purge after 2 minutes
      cache.clear();
    });
  }

  res.json({
    data: snapshot,
  });
};

export default {
  get,
};
