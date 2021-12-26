import moment from "moment-timezone";

import type { Context } from "../context";
import type { Session, Gym } from "../../db/models";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";

type BoulderPlusSession = {
  title: string;
  start: string;
  end: string;
};

const scrapeSession = async (
  ctx: Context,
  gym: Gym,
  boulderPlusSession: BoulderPlusSession,
): Promise<Session> => {
  const starts_at = moment(boulderPlusSession.start).toDate();
  const ends_at = moment(boulderPlusSession.end).toDate();

  const spacesMatches = /(\d+) spaces/.exec(boulderPlusSession.title);
  let spaces;
  if (!spacesMatches) {
    // No matches because slot is "Full".
    // Should verify this in the future.
    spaces = 0;
  } else {
    spaces = parseInt(spacesMatches[1], 10);
  }

  return insertOrUpdateSession(ctx.db, {
    starts_at,
    ends_at,
    gym_id: gym.id,
    spaces,
  });
};

const scrape = async (ctx: Context, slug: string): Promise<Session[]> => {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  const res = await ctx.http.get("https://app.rockgympro.com/b/widget/", {
    params: {
      a: "fcfeed",
      widget_guid: "a316dc1053024e19942cd1dc7f20d1c1",
      start: moment().unix().toString(),
      end: moment().add(1, "week").unix().toString(),
    },
  });

  if (res.data == null) {
    return [];
  }
  return Promise.all<Session>(
    res.data.map((session: BoulderPlusSession) =>
      scrapeSession(ctx, gym, session),
    ),
  );
};

export default scrape;
