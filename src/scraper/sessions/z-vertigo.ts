import axios from "axios";
import moment from "moment";
import { flattenDeep } from "lodash";

import type { Session, Gym } from "../../db/models";
import { Context } from "../context";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";

type ZVertigoSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

async function processSlot(slot, subMetadata): Promise<ZVertigoSession> {
  const dateString = slot.split("_")[0];
  const starts_at = moment(dateString, "YYYYMMDDkkmm").toDate();
  const ends_at = moment(dateString, "YYYYMMDDkkmm")
    .add(3, "hours")
    .add(30, "minutes")
    .toDate(); // TODO: don't assume z-vertigo time slot length

  const spaces =
    subMetadata[slot] !== undefined
      ? subMetadata[slot].split("/").map((comp) => comp.trim())[0]
      : "0";

  return {
    starts_at,
    ends_at,
    spaces,
  };
}

async function getFirstDateOfClass(klass): Promise<string> {
  const res = await axios.get(
    "https://www.picktime.com/book/get1stDateForCurrentClass",
    {
      params: {
        locationId: "e0fa32c9-effa-4e57-9a2c-eb4d95e8d23a",
        accountKey: "54130796-0b57-47b6-b2f5-276d79f08409",
        serviceKeys: klass,
      },
    },
  );

  return Object.values(res.data.metadata)[0] as string;
}

async function processClass(klass) {
  const firstDateOfClass = await getFirstDateOfClass(klass);
  const date = moment(firstDateOfClass, "YYYYMMDD").toDate(),
    y = date.getFullYear(),
    m = date.getMonth();
  const lastDayOfMonth = new Date(y, m + 1, 0);

  const res = await axios.get(
    "https://www.picktime.com/book/getClassAppSlots",
    {
      params: {
        locationId: "e0fa32c9-effa-4e57-9a2c-eb4d95e8d23a",
        accountKey: "54130796-0b57-47b6-b2f5-276d79f08409",
        serviceKeys: klass,
        staffKeys: "",
        endDateAndTime: moment(lastDayOfMonth).format("YYYYMMDD") + "2359",
        v2: true,
      },
    },
  );

  if (!res.data.response) {
    console.warn(`Z-Vertigo: Could not fetch slots for class ${klass}`);
    return [];
  }

  const slots = await Promise.all(
    res.data.data.map((slot) => processSlot(slot, res.data.subMetadata)),
  );

  return slots;
}

const scrape = async (ctx: Context, slug: string): Promise<Session[]> => {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  const res = await axios.get(
    "https://www.picktime.com/book/getClassesForCurrentLocation",
    {
      params: {
        locationId: "e0fa32c9-effa-4e57-9a2c-eb4d95e8d23a",
        accountKey: "54130796-0b57-47b6-b2f5-276d79f08409",
      },
    },
  );

  const classes = await Promise.all<ZVertigoSession[][]>(
    res.data.data.map(processClass),
  );

  const sessions = flattenDeep<ZVertigoSession>(classes);

  return Promise.all(
    sessions.map(async (zVertigoSession) =>
      insertOrUpdateSession(ctx.db, {
        ...zVertigoSession,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
