import moment from "moment";
import cheerio from "cheerio";

import { Gym } from "../../db/models";
import type { Session } from "../../db/models/session";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";
import type { Context } from "../context";

type FitblocSession = {
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

  for (let i = 0; i < 8; i++) {
    const startDate = moment()
      .startOf("day")
      .add(i, "days")
      .format("YYYY-MM-DD");

    const res = await ctx.http.get(
      "https://widgets.mindbodyonline.com/widgets/schedules/77427/load_markup",
      {
        params: {
          "options[start_date]": startDate,
        },
      },
    );

    const $ = cheerio.load(res.data.class_sessions);

    if ($(".bw-widget__empty.is-visible").length !== 0) {
      continue;
    }

    const startIndex =
      res.data.class_sessions.indexOf("scheduleData = ") +
      "scheduleData = ".length;
    const endIndex = res.data.class_sessions.indexOf("$.event.trigger");
    const scheduleData = JSON.parse(
      res.data.class_sessions.substring(startIndex, endIndex),
    );

    $(".bw-session").each((index, sessionElem) => {
      const name = $(".bw-session__name", sessionElem).text();

      if (!name.includes("Gym Entry")) {
        return;
      }

      const sessionId = $(sessionElem).attr("data-bw-widget-mbo-class-id");
      const $$ = cheerio.load(
        scheduleData.contents[sessionId].classAvailability,
      );

      const slotsElem = $$(".hc_availability");
      const waitlistElem = $$(".hc_waitlist");

      let spaces = 0;
      if (waitlistElem.length === 0) {
        if (slotsElem.length === 0) {
          return;
        }
        spaces = parseInt(slotsElem.text().trim().slice(0, 2), 10);
      }

      sessions.push({
        starts_at: $(".hc_starttime", sessionElem).attr("datetime"),
        ends_at: $(".hc_endtime", sessionElem).attr("datetime"),
        spaces,
      });
    });
  }

  const fitblocSessions = sessions.map<FitblocSession>((session) => ({
    starts_at: moment(session.starts_at).toDate(),
    ends_at: moment(session.ends_at).toDate(),
    spaces: session.spaces,
  }));

  return Promise.all(
    fitblocSessions.map(async (fitblocSession) =>
      insertOrUpdateSession(ctx.db, {
        ...fitblocSession,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
