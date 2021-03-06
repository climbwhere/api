import axios from "axios";
import moment from "moment";
import { flattenDeep } from "lodash";

import type { Session, Gym } from "../../db/models";
import type { Context } from "../context";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";

const LOCATION_ID = "07e26051-689f-471c-8201-bf03796a6a04";
const ACCOUNT_KEY = "5176b721-0be8-447e-b43b-3652af54bd7b";

type OyeyoSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

async function processSlot(slot, subMetadata): Promise<OyeyoSession> {
  const dateString = slot.split("_")[0];
  const starts_at = moment(dateString, "YYYYMMDDkkmm").toDate();
  const ends_at = moment(dateString, "YYYYMMDDkkmm").add(2, "hours").toDate(); // TODO: don't assume oyeyo time slot length

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
        locationId: LOCATION_ID,
        accountKey: ACCOUNT_KEY,
        serviceKeys: klass,
      },
    },
  );

  return Object.values(res.data.metadata)[0] as string;
}

async function processStaff(klass, staff): Promise<OyeyoSession[]> {
  const firstDateOfClass = await getFirstDateOfClass(klass);
  // 270621: Booking window doesn't seem to exist? It's just the last date of the month then
  // const lastDate = moment(firstDateOfClass, "YYYYMMDD").add(1, "week");
  const lastDate = moment(firstDateOfClass, "YYYYMMDD").endOf("month");

  const res = await axios.get(
    "https://www.picktime.com/book/getClassAppSlots",
    {
      params: {
        locationId: LOCATION_ID,
        accountKey: ACCOUNT_KEY,
        serviceKeys: klass,
        staffKeys: staff,
        endDateAndTime: lastDate.format("YYYYMMDD") + "2359",
        v2: true,
      },
    },
  );

  if (res.data.data == null) {
    return [];
  }
  const slots = await Promise.all<OyeyoSession>(
    res.data.data.map(async (slot) => processSlot(slot, res.data.subMetadata)),
  );

  return slots;
}

async function processClass(klass): Promise<OyeyoSession[][]> {
  const res = await axios.get(
    "https://www.picktime.com/book/getStaffForCurrentClass",
    {
      params: {
        locationId: LOCATION_ID,
        accountKey: ACCOUNT_KEY,
        serviceKeys: klass,
      },
    },
  );

  if (res.data.data == null) {
    return [];
  }
  const staffs = await Promise.all<OyeyoSession[]>(
    res.data.data.map((staff) => processStaff(klass, staff)),
  );

  return staffs;
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
        locationId: LOCATION_ID,
        accountKey: ACCOUNT_KEY,
      },
    },
  );

  if (res.data.data == null) {
    return [];
  }
  const classes = await Promise.all<OyeyoSession[][]>(
    res.data.data.map(processClass),
  );

  const sessions = flattenDeep<OyeyoSession>(classes);

  return Promise.all(
    sessions.map(async (oyeyoSession) =>
      insertOrUpdateSession(ctx.db, {
        ...oyeyoSession,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
