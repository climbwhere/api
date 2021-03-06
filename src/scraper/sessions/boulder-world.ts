import axios from "axios";
import moment from "moment";
import { flattenDeep } from "lodash";

import type { Session, Gym } from "../../db/models";
import type { Context } from "../context";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";

const LOCATION_ID = "ca204f51-922f-42e3-bdb6-1f8373eb5268",
  ACCOUNT_KEY = "566fe29b-2e46-4a73-ad85-c16bfc64b34b",
  WEEKEND_SK = "2be7247c-4c08-42c5-beb4-1678c449d108"; // weekend slots

type BoulderWorldSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

async function processSlot(
  slot,
  subMetadata,
  isWeekend,
): Promise<BoulderWorldSession> {
  const dateString = slot.split("_")[0];
  const starts_at = moment(dateString, "YYYYMMDDkkmm").toDate();

  const endMoment = moment(dateString, "YYYYMMDDkkmm");
  if (isWeekend) {
    endMoment.add(2, "hours").add(45, "minutes");
  } else {
    endMoment.add(3, "hours");
  }
  const ends_at = endMoment.toDate();

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

async function processClass(klass, isWeekend): Promise<BoulderWorldSession[]> {
  const firstDateOfClass = await getFirstDateOfClass(klass);
  let lastDate;
  if (isWeekend) {
    lastDate = moment(firstDateOfClass, "YYYYMMDD").add(2, "days");
  } else {
    lastDate = moment(firstDateOfClass, "YYYYMMDD").add(5, "days");
  }

  const res = await axios.get(
    "https://www.picktime.com/book/getClassAppSlots",
    {
      params: {
        locationId: LOCATION_ID,
        accountKey: ACCOUNT_KEY,
        serviceKeys: klass,
        staffKeys: "",
        endDateAndTime: lastDate.format("YYYYMMDD") + "2359",
        v2: true,
      },
    },
  );

  if (!res.data.response) {
    console.warn(`Boulder World: Could not fetch slots for class ${klass}`);
    return [];
  }

  if (res.data.data == null) {
    return [];
  }
  const slots = await Promise.all<BoulderWorldSession>(
    res.data.data.map((slot) =>
      processSlot(slot, res.data.subMetadata, isWeekend),
    ),
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
        locationId: LOCATION_ID,
        accountKey: ACCOUNT_KEY,
      },
    },
  );

  if (res.data.data == null) {
    return [];
  }
  const classes = await Promise.all<BoulderWorldSession[][]>(
    res.data.data.map((klass) => processClass(klass, klass === WEEKEND_SK)),
  );

  const sessions = flattenDeep<BoulderWorldSession>(classes);

  return Promise.all(
    sessions.map(async (boulderWorldSession) =>
      insertOrUpdateSession(ctx.db, {
        ...boulderWorldSession,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
