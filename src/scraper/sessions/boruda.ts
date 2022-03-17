import moment from "moment";
import cheerio from "cheerio";

import { Gym } from "../../db/models";
import type { Session } from "../../db/models/session";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";
import type { Context } from "../context";

type BorudaSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

const scrape = async (ctx: Context, slug: string): Promise<Session[]> => {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  const sessions = [];

  const startDate = moment().startOf("day").format("YYYY-MM-DD");

  const res = await ctx.http.get(
    "https://widgets.mindbodyonline.com/widgets/schedules/164024/load_markup",
    {
      params: {
        "options[start_date]": startDate,
      },
    },
  );

  const $ = cheerio.load(res.data.class_sessions);

  if ($(".bw-widget__empty.is-visible").length !== 0) {
    return [];
  }

  const startIndex =
    res.data.class_sessions.indexOf("scheduleData = ") +
    "scheduleData = ".length;
  const endIndex = res.data.class_sessions.indexOf("$.event.trigger");
  const scheduleData = JSON.parse(
    res.data.class_sessions.substring(startIndex, endIndex),
  );

  $(".bw-session").each((_index, sessionElem) => {
    const name = $(".bw-session__name", sessionElem).text();

    if (!name.includes("Night Slots")) {
      return;
    }

    let spaces = 0;

    const sessionId = $(sessionElem).attr("data-bw-widget-mbo-class-id");
    if (sessionId == null) {
      return;
    }
    const classAvailability =
      scheduleData.contents[sessionId].classAvailability;
    if (classAvailability == null || classAvailability.length === 0) {
      spaces = -1;
    } else {
      const $$ = cheerio.load(
        scheduleData.contents[sessionId].classAvailability,
      );

      const slotsElem = $$(".hc_availability");
      const waitlistElem = $$(".hc_waitlist");

      if (waitlistElem.length === 0) {
        if (slotsElem.length === 0) {
          return;
        }
        spaces = parseInt(slotsElem.text().trim().slice(0, 2), 10);
      }
    }

    sessions.push({
      starts_at: $(".hc_starttime", sessionElem).attr("datetime"),
      ends_at: $(".hc_endtime", sessionElem).attr("datetime"),
      spaces,
    });
  });

  const borudaSessions = sessions.map<BorudaSession>((session) => ({
    starts_at: moment(session.starts_at).toDate(),
    ends_at: moment(session.ends_at).toDate(),
    spaces: session.spaces,
  }));

  return Promise.all(
    borudaSessions.map(async (borudaSession) =>
      insertOrUpdateSession(ctx.db, {
        ...borudaSession,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
