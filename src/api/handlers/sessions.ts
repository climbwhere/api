import type { Context } from "../context";
import type { Handler } from "./types";

export const index: Handler = (ctx: Context) => async (req, res) => {
  const sessions = await ctx.db("sessions");

  res.json({
    data: sessions,
  });
};

export default {
  index,
};
