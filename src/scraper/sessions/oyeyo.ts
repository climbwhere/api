import axios from "axios";
import moment from "moment";
import { flattenDeep } from "lodash";

import type { Session } from "../../db/models/session";
import type { Context } from "../context";
import type { Gym } from "../../db/models";

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
        locationId: "07e26051-689f-471c-8201-bf03796a6a04",
        accountKey: "5176b721-0be8-447e-b43b-3652af54bd7b",
        serviceKeys: klass,
      },
    },
  );

  return Object.values(res.data.metadata)[0] as string;
}

async function processStaff(klass, staff): Promise<OyeyoSession[]> {
  const firstDateOfClass = await getFirstDateOfClass(klass);
  const date = moment(firstDateOfClass, "YYYYMMDD").toDate(),
    year = date.getFullYear(),
    month = date.getMonth();
  const lastDayOfNextMonth = new Date(year, month + 1, 0);

  const res = await axios.get(
    "https://www.picktime.com/book/getClassAppSlots",
    {
      params: {
        locationId: "07e26051-689f-471c-8201-bf03796a6a04",
        accountKey: "5176b721-0be8-447e-b43b-3652af54bd7b",
        serviceKeys: klass,
        staffKeys: staff,
        endDateAndTime: moment(lastDayOfNextMonth).format("YYYYMMDD") + "2359",
        v2: true,
      },
    },
  );

  const slots = Promise.all<OyeyoSession>(
    res.data.data.map(async (slot) => processSlot(slot, res.data.subMetadata)),
  );

  return slots;
}

async function processClass(klass): Promise<OyeyoSession[][]> {
  const res = await axios.get(
    "https://www.picktime.com/book/getStaffForCurrentClass",
    {
      params: {
        locationId: "07e26051-689f-471c-8201-bf03796a6a04",
        accountKey: "5176b721-0be8-447e-b43b-3652af54bd7b",
        serviceKeys: klass,
      },
    },
  );

  const staffs = await Promise.all<OyeyoSession[]>(
    res.data.data.map((staff) => processStaff(klass, staff)),
  );

  return staffs;
}

const scrape = async (ctx: Context): Promise<void> => {
  const gym: Gym = await ctx.db("gyms").where({ slug: "oyeyo" }).first();
  if (!gym) {
    return;
  }

  const res = await axios.get(
    "https://www.picktime.com/book/getClassesForCurrentLocation",
    {
      params: {
        locationId: "07e26051-689f-471c-8201-bf03796a6a04",
        accountKey: "5176b721-0be8-447e-b43b-3652af54bd7b",
      },
    },
  );

  const classes = await Promise.all<OyeyoSession[][]>(
    res.data.data.map(processClass),
  );

  const sessions = flattenDeep<OyeyoSession>(classes);

  await Promise.all(
    sessions.map(async (oyeyoSession) => {
      try {
        await ctx.db("sessions").insert({
          gym_id: gym.id,
          starts_at: oyeyoSession.starts_at,
          ends_at: oyeyoSession.ends_at,
        });
      } catch (error) {
        if (error.code !== "23505") {
          throw error;
        }
      }

      const session: Session = await ctx
        .db("sessions")
        .where({ gym_id: gym.id, starts_at: oyeyoSession.starts_at })
        .first();

      await ctx
        .db("snapshots")
        .insert({ session_id: session.id, spaces: oyeyoSession.spaces });
    }),
  );
};

export default scrape;
