import moment from "moment-timezone";

import type { Context } from "../context";
import type { Session, Gym } from "../../db/models";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";

type BoulderMovementSession = {
  attributes: {
    startTime: string;
    endTime: string;
    openings: number;
  };
};

const scrapeSession = async (
  ctx: Context,
  gym: Gym,
  boulderMovementSession: BoulderMovementSession,
): Promise<Session> => {
  const starts_at = moment(
    boulderMovementSession.attributes.startTime,
  ).toDate();
  const ends_at = moment(boulderMovementSession.attributes.endTime).toDate();

  return insertOrUpdateSession(ctx.db, {
    starts_at,
    ends_at,
    gym_id: gym.id,
    spaces: boulderMovementSession.attributes.openings,
  });
};

const scrape = async (ctx: Context, slug: string): Promise<Session[]> => {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  const res = await ctx.http.post(
    "https://prod-mkt-gateway.mindbody.io/v1/search/class_times",
    {
      sort: "start_time",
      page: { size: 100, number: 1 },
      filter: {
        radius: 0,
        startTimeRanges: [
          {
            from: moment().startOf("day").toISOString(),
            to: moment().startOf("day").add(1, "week").toISOString(),
          },
        ],
        locationSlugs: ["boulder-movement"],
        include_dynamic_pricing: "true",
        inventory_source: ["MB"],
      },
    },
  );

  return Promise.all<Session>(
    res.data.data
      .filter((session) => session.relationships.course.data.id === "1337352")
      .map((session) => scrapeSession(ctx, gym, session)),
  );
};

export default scrape;
