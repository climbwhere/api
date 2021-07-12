import moment from "moment";

import { Gym } from "../../db/models";
import type { Session } from "../../db/models/session";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";
import type { Context } from "../context";

type BoulderPlanetSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

const scrape = async (ctx: Context, slug: string): Promise<Session[]> => {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  const page = await ctx.browser.newPage();

  await page.goto(
    "https://www-boulderplanet-sg.filesusr.com/html/8b92f2_1385c18a2b0465697053236af060bc3b.html",
    {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    },
  );
  await page.waitFor(10000);

  const sessions = await page.evaluate(() => {
    const sessions = [];

    const sessionElems = document.querySelectorAll(".bw-session");
    for (const sessionElem of sessionElems) {
      const nameElem = sessionElem.querySelector(".bw-session__name");
      const startTimeElem = sessionElem.querySelector(".hc_starttime");
      const endTimeElem = sessionElem.querySelector(".hc_endtime");
      const waitlistElem = sessionElem.querySelector(".hc_waitlist");
      const slotsElem = sessionElem.querySelector(".hc_availability");

      if (!nameElem) {
        continue;
      }

      if (!nameElem.textContent.toUpperCase().includes("TIMESLOT")) {
        continue;
      }

      let spaces = 0;
      if (!waitlistElem) {
        if (!slotsElem) {
          continue;
        }
        spaces = parseInt(slotsElem.textContent.trim().slice(0, 2), 10);
      }

      sessions.push({
        starts_at: startTimeElem.getAttribute("datetime"),
        ends_at: endTimeElem.getAttribute("datetime"),
        spaces,
      });
    }

    return sessions;
  });

  const boulderPlanetSessions = sessions.map<BoulderPlanetSession>(
    (session) => ({
      starts_at: moment(session.starts_at).toDate(),
      ends_at: moment(session.ends_at).toDate(),
      spaces: session.spaces,
    }),
  );

  return Promise.all(
    boulderPlanetSessions.map(async (boulderPlanetSession) =>
      insertOrUpdateSession(ctx.db, {
        ...boulderPlanetSession,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
