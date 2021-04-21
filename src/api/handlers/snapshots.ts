import type { Context } from "../context";
import type { Handler } from "./types";

export const get: Handler = (ctx: Context) => async (req, res) => {
  const { id } = req.params;

  const snapshot =
    id === "latest"
      ? await ctx.db("snapshots").orderBy("created_at", "desc").first()
      : await ctx.db("snapshots").where({ id }).first();

  res.json({
    data: snapshot,
  });
};

export default {
  get,
};
