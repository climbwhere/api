import axios from "axios";
import moment from "moment-timezone";
import FormData from "form-data";
import cheerio from "cheerio";
import { flatten } from "lodash";

import type { Moment } from "moment-timezone";
import type { Context } from "../context";
import type { Gym, Session } from "../../db/models";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";

type BFFSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

function parseXML(xml, i): BFFSession[] {
  // Let's use a date variable, because each instantiation of this function is for one day
  const date = moment(new Date()).add(i + 1, "days");
  const slots = [];
  // XML scraping
  const $ = cheerio.load(xml);
  $("label").each((i, e) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const $$ = cheerio.load(e.attribs["aria-label"]);
    const startTime = moment($$("span.display-time").text(), "hh:mmaa");
    date.set({
      hour: startTime.get("hour"),
      minute: startTime.get("minute"),
      second: startTime.get("second"),
    });
    const starts_at = moment(date.toDate()).startOf("minute").toDate();
    const ends_at = moment(starts_at).add(3, "hours").toDate();
    const spaces = $$("div.num-slots-available-container").text().split(" ")[0];
    // Add scraped information to acc
    slots.push({
      starts_at,
      ends_at,
      spaces,
    });
  });

  return slots;
}

function createRequest(date: Moment) {
  const formData = new FormData();
  formData.append("type", "13677944");
  formData.append("calendar", "3778158");
  formData.append("date", moment(date).format("yyyy-MM-DD"));
  formData.append("ignoreAppointment", "");

  return axios.post("https://app.acuityscheduling.com/schedule.php", formData, {
    headers: { ...formData.getHeaders() },
    params: {
      action: "availableTimes",
      showSelect: 0,
      fulldate: 1,
      owner: "19322912",
    },
  });
}

const scrape = async (ctx: Context, slug: string): Promise<Session[]> => {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  // First, create all the requests we'll need to get our data
  const requests = [];
  // BFF slots only become available one week before.
  for (let i = 1; i < 8; i++) {
    requests.push(createRequest(moment(new Date()).add(i, "days")));
  }
  // Make requests
  const res = await Promise.all(requests);
  // Each request returns some xml that we can parse
  const sessions = flatten(
    res.map((r, i) => {
      return parseXML(r.data, i);
    }),
  );

  return Promise.all(
    sessions.map(async (bffSession) =>
      insertOrUpdateSession(ctx.db, { ...bffSession, gym_id: gym.id }),
    ),
  );
};

export default scrape;
