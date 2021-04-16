import moment from "moment-timezone";

import type { Context } from "../context";
import type { CreateSession, Gym } from "../../db/models";

type BoulderPlusSession = {
  title: string;
  start: string;
  end: string;
};

const insertOrUpdateSession = async (
  ctx: Context,
  gym: Gym,
  session: CreateSession,
) => {
  const updatedSession = await ctx.db.sessions.updateByGymAndStart(
    gym.id,
    session.start,
    session,
  );
  if (!updatedSession) {
    await ctx.db.sessions.create(session);
  }
};

const scrapeSession = async (
  ctx: Context,
  gym: Gym,
  session: BoulderPlusSession,
): Promise<void> => {
  const start = moment(session.start).toDate();
  const end = moment(session.end).toDate();

  const spacesMatches = /(\d+) spaces/.exec(session.title);
  let spaces;
  if (!spacesMatches) {
    // No matches because slot is "Full".
    // Should verify this in the future.
    spaces = 0;
  } else {
    spaces = parseInt(spacesMatches[1], 10);
  }

  await insertOrUpdateSession(ctx, gym, {
    gym_id: gym.id,
    start,
    end,
    spaces,
  });
};

const scrape = async (ctx: Context): Promise<void> => {
  const gym = await ctx.db.gyms.getBySlug("boulder-plus");
  if (!gym) {
    return;
  }

  const res = await ctx.http.get("https://app.rockgympro.com/b/widget/", {
    params: {
      a: "fcfeed",
      widget_guid: "f33c8b7f0916487d9af58088967aa62d",
      start: moment().unix().toString(),
      end: moment().add(1, "week").unix().toString(),
    },
  });

  await Promise.all(
    res.data.map((session) => scrapeSession(ctx, gym, session)),
  );
};

export default scrape;
