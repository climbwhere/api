import moment from "moment";

import { Gym } from "../../db/models";
import type { Session } from "../../db/models/session";
import type { Context } from "../context";

type FitblocSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

const scrape = async (ctx: Context): Promise<void> => {
  const gym: Gym = await ctx.db("gyms").where({ slug: "fitbloc" }).first();
  if (!gym) {
    return;
  }

  const page = await ctx.browser.newPage();

  await page.goto("https://fitbloc.com/booking/");
  await page.waitFor(5000);

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

      if (!nameElem.textContent.includes("Gym Entry")) {
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

  const fitblocSessions = sessions.map<FitblocSession>((session) => ({
    starts_at: moment(session.starts_at).toDate(),
    ends_at: moment(session.ends_at).toDate(),
    spaces: session.spaces,
  }));

  await Promise.all(
    fitblocSessions.map(async (fitblocSession) => {
      try {
        await ctx.db("sessions").insert({
          gym_id: gym.id,
          starts_at: fitblocSession.starts_at,
          ends_at: fitblocSession.ends_at,
        });
      } catch (error) {
        if (error.code !== "23505") {
          throw error;
        }
      }

      const session: Session = await ctx
        .db("sessions")
        .where({ gym_id: gym.id, starts_at: fitblocSession.starts_at })
        .first();

      await ctx
        .db("snapshots")
        .insert({ session_id: session.id, spaces: fitblocSession.spaces });
    }),
  );
};

export default scrape;
