import axios from "axios";
import moment from "moment-timezone";

import type { Gym, Session } from "../../db/models";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";
import type { Context } from "../context";

type B8ASession = {
  time_start: number;
  duration: number;
  size: number;
  booked: number;
  status: string;
};

async function scrape(ctx: Context, slug: string): Promise<Session[]> {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  // get token
  const {
    data: { token }, // gym info can be obtained through branch
  } = await axios("https://api.glofox.com/2.0/login", {
    method: "POST",
    data: {
      branch_id: "60f0e4fa4ef00e15761ea523",
      login: "GUEST",
      password: "GUEST",
    },
  });

  // get timings
  const start = Math.floor(Date.now() / 1000);
  const end = start + 1900799; // around 3
  const {
    data: { data: sessionData },
  } = await axios.get<{ data: B8ASession[] }>(
    `https://api.glofox.com/2.0/events`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        start,
        end,
        include: ["trainers", "facility", "program", "users_booked"],
        page: 1,
        private: false,
        sort_by: "time_start",
      },
    },
  );

  const sessions = sessionData
    .filter((session) => session.status === "AVAILABLE")
    .map((session) => ({
      starts_at: moment.unix(session.time_start).toDate(),
      ends_at: moment
        .unix(session.time_start)
        .add(session.duration, "minutes")
        .toDate(),
      spaces: Math.max(session.size - session.booked, 0),
    }));

  return Promise.all(
    sessions.map(async (session) =>
      insertOrUpdateSession(ctx.db, {
        ...session,
        gym_id: gym.id,
      }),
    ),
  );
}

export default scrape;
