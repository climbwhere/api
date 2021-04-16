import moment from "moment-timezone";

import type { Context } from "../context";
import type { CreateSession, Gym } from "../../db/models";
import type { Session } from "../../db/models";

type BoulderPlusSession = {
  title: string;
  start: string;
  end: string;
};

const scrapeSession = async (
  ctx: Context,
  gym: Gym,
  boulderPlusSession: BoulderPlusSession,
): Promise<void> => {
  const starts_at = moment(boulderPlusSession.start).toDate();
  const ends_at = moment(boulderPlusSession.end).toDate();

  try {
    await ctx.db("sessions").insert({ gym_id: gym.id, starts_at, ends_at });
  } catch (error) {
    if (error.code !== "23505") {
      throw error;
    }
  }

  const session: Session = await ctx
    .db("sessions")
    .where({ gym_id: gym.id, starts_at })
    .first();

  const spacesMatches = /(\d+) spaces/.exec(boulderPlusSession.title);
  let spaces;
  if (!spacesMatches) {
    // No matches because slot is "Full".
    // Should verify this in the future.
    spaces = 0;
  } else {
    spaces = parseInt(spacesMatches[1], 10);
  }

  await ctx.db("snapshots").insert({ session_id: session.id, spaces });
};

const scrape = async (ctx: Context): Promise<void> => {
  const gym: Gym = await ctx.db("gyms").where({ slug: "boulder-plus" }).first();
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

  await Promise.all<CreateSession>(
    res.data.map((session) => scrapeSession(ctx, gym, session)),
  );
};

export default scrape;
