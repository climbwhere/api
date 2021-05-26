import axios from "axios";
import moment from "moment-timezone";

import type { Gym, Session } from "../../db/models";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";
import type { Context } from "../context";

async function scrape(ctx: Context, slug: string): Promise<Session[]> {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  // get token
  const {
    data: { token, branch }, // gym info can be obtained through branch
  } = await axios("https://api.glofox.com/2.0/login", {
    method: "POST",
    data: {
      branch_id: "5fea804d6c26ae4cfe01736a",
      login: "GUEST",
      password: "GUEST",
    },
  });

  // get gym access program timing
  const {
    data: { data: programs },
  } = await axios("https://api.glofox.com/2.0/programs?private=false", {
    params: { private: false },
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const gymEntryProgram = programs.filter(
    (p) => p.name === "Gym Access and Entry",
  );

  // get timings
  const {
    data: { data: sessionData },
  } = await axios(
    "https://api.glofox.com/2.0/events?end=1622995199&include=trainers,facility,program,users_booked&page=2&private=false&sort_by=time_start&start=1621094400",
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        start: gymEntryProgram["date start"],
        end: gymEntryProgram["date finish"],
        include: ["trainers", "facility", "program", "users_booked"],
        page: 2,
        private: false,
        sort_by: "time_start",
      },
    },
  );

  const sessions: Session[] = sessionData.map((session) => ({
    starts_at: moment.unix(session.time_start).toDate(),
    ends_at: moment
      .unix(session.time_start)
      .add(session.duration, "minutes")
      .toDate(),
    spaces: session.size - session.booked,
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
