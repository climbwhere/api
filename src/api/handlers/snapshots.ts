import getLatestSnapshot from "../../db/queries/getLatestSnapshot";
import type { Context } from "../context";
import type { Handler } from "./types";

export const get: Handler = (ctx: Context) => async (req, res) => {
  const { id } = req.params;

  const snapshot =
    id === "latest"
      ? await getLatestSnapshot(ctx.db)
      : await ctx.db("snapshots").where({ id }).first();

  res.json({
    data: snapshot,
  });
};

export default {
  get,
};
