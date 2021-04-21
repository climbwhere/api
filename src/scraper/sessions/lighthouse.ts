import moment from "moment";
import axios from "axios";

import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";

import type { Gym, Session } from "../../db/models";
import type { Context } from "../context";

const scrape = async (ctx: Context): Promise<Session[]> => {
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

  return Promise.all(
    sessions.map(async (lighthouseSession) =>
      insertOrUpdateSession(ctx.db, {
        ...lighthouseSession,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
