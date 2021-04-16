import { Context } from "../context";
import type { Handler } from "./types";

export const index: Handler = (ctx: Context) => async (req, res) => {
  const sessions = await ctx
    .db("snapshots")
    .join("sessions", "sessions.id", "snapshots.session_id")
    .join("gyms", "gyms.id", "sessions.gym_id")
    .orderBy([
      { column: "sessions.starts_at", order: "asc" },
      { column: "snapshots.created_at", order: "desc" },
    ])
    .groupBy(
      "sessions.id",
      "sessions.starts_at",
      "sessions.ends_at",
      "sessions.gym_id",
      "gyms.slug",
      "gyms.name",
      "gyms.address",
      "gyms.phone",
      "gyms.email",
    )
    .select(
      "sessions.id",
      "sessions.starts_at",
      "sessions.ends_at",
      "sessions.gym_id",
      "gyms.slug AS gym_slug",
      "gyms.name AS gym_name",
      "gyms.address AS gym_address",
      "gyms.phone AS gym_phone",
      "gyms.email AS gym_email",
      ctx.db.raw('MAX("snapshots"."spaces") AS spaces'),
    );

  res.json({
    data: sessions.map((session) => ({
      id: session.id,
      starts_at: session.starts_at,
      ends_at: session.ends_at,
      spaces: session.spaces,
      gym: {
        id: session.gym_id,
        slug: session.gym_slug,
        name: session.gym_name,
        address: session.gym_address,
        phone: session.gym_phone,
        email: session.gym_email,
      },
    })),
  });
};

export default {
  index,
};
