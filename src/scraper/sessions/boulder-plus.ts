import moment from "moment-timezone";

import type { Context } from "../context";
import type { CreateSession, Gym } from "../../db/models";

type BoulderPlusSession = {
  title: string;
  start: string;
  end: string;
};

const transformSession = (
  gym: Gym,
  session: BoulderPlusSession,
): CreateSession => {
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

  return {
    start,
    end,
    gym_id: gym.id,
    spaces,
  };
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

  const sessions = await Promise.all<CreateSession>(
    res.data.map((session) => transformSession(gym, session)),
  );

  await Promise.all(
    sessions.map((session) =>
      ctx.db.sessions.createOrUpdateByGymAndStart(session),
    ),
  );
};

export default scrape;
