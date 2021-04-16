import { Context } from "../context";
import type { Handler } from "./types";

export const index: Handler = (ctx: Context) => async (req, res) => {
  const gyms = await ctx.db.gyms.all();
  res.json({
    data: gyms,
  });
};

export default {
  index,
};
