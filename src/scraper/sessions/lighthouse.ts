import moment from "moment";
import axios from "axios";

import type { Gym } from "../../db/models/gym";
import type { Session } from "../../db/models/session";
import type { Context } from "../context";

const scrape = async (ctx: Context): Promise<void> => {
  const gym: Gym = await ctx.db("gyms").where({ slug: "lighthouse" }).first();
  if (!gym) {
    return;
  }

  const res = await axios("https://api.fitdegree.com/registrables/", {
    params: {
      event_datetime__GTE: moment().format("YYYY-MM-DD HH:mm:ss"),
      event_datetime__LTE: moment()
        .add(1, "week")
        .format("YYYY-MM-DD HH:mm:ss"),
      event_datetime__ORDER: "ASC",
      object_type__IN: "[1,4,2]",
      GROUP_BY_DATE: true,
      show_past: 0,
      is_cancelled: 0,
      display_on_app: 1,
      fitspot_id: "231",
      __fd_client: "widgets",
      __fd_client_version: "v2",
    },
  });

  const sessions = res.data.response.data.items
    .filter((session) => session.title === "Gym entry")
    .map((session) => ({
      starts_at: moment(
        session.fs_event_datetime,
        "YYYY-MM-DD HH:mm:ss",
      ).toDate(),
      ends_at: moment(session.fs_end_datetime, "YYYY-MM-DD HH:mm:ss").toDate(),
      spaces: session.max_attendance - session.registration_count,
    }));

  await Promise.all(
    sessions.map(async (lighthouseSession) => {
      try {
        await ctx.db("sessions").insert({
          gym_id: gym.id,
          starts_at: lighthouseSession.starts_at,
          ends_at: lighthouseSession.ends_at,
        });
      } catch (error) {
        if (error.code !== "23505") {
          throw error;
        }
      }

      const session: Session = await ctx
        .db("sessions")
        .where({ gym_id: gym.id, starts_at: lighthouseSession.starts_at })
        .first();

      await ctx
        .db("snapshots")
        .insert({ session_id: session.id, spaces: lighthouseSession.spaces });
    }),
  );
};

export default scrape;
