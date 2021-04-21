import type { Context } from "../context";
import type { Handler } from "./types";

export const index: Handler = (ctx: Context) => async (req, res) => {
  const rawSessions = await ctx
    .db("sessions")
    .join("gyms", "gyms.id", "sessions.gym_id")
    .orderBy("sessions.starts_at", "asc")
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
    );

  const sessionsWithSnapshots = await Promise.all(
    rawSessions.map(async (session) => {
      const snapshot = await ctx
        .db("snapshots")
        .where({ session_id: session.id })
        .orderBy("snapshots.created_at", "desc")
        .first();
      return [session, snapshot];
    }),
  );

  const sessions = sessionsWithSnapshots
    .filter(([, snapshot]) => snapshot)
    .map(([session, snapshot]) => ({
      id: session.id,
      starts_at: session.starts_at,
      ends_at: session.ends_at,
      spaces: snapshot.spaces,
      gym: {
        id: session.gym_id,
        slug: session.gym_slug,
        name: session.gym_name,
        address: session.gym_address,
        phone: session.gym_phone,
        email: session.gym_email,
      },
    }));

  res.json({
    data: sessions,
  });
};

export default {
  index,
};
