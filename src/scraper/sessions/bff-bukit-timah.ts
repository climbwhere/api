import moment from "moment-timezone";
import { isEmpty, flatten } from "lodash";

import type { Context } from "../context";
import type { Gym, Session } from "../../db/models";
import insertOrUpdateSession from "../../db/queries/insertOrUpdateSession";
import { AxiosResponse } from "axios";

// Bukit Timah
const CLUB_ID = 1;
const ZONE_ID = 8;
const ZONE_TYPE_ID = 9;

export type BFFSession = {
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};
type BFFCalendarClass = {
  NumberOfPeople: null; // Wonder if they'll use this ever
  Status: string | "Bookable";
  StartTime: string;
  EndTime: string;
};
type BFFCalendarHourData = {
  Hour: string;
  ClassesPerDay: BFFCalendarClass[];
};
export type BFFScheduleResponse = {
  CalendarData: BFFCalendarHourData[];
  PagerData: {
    Days: string[];
    QueryStartDate: string;
  };
};

// These type-defs feel more like "quick working" to me, so let's not share them.
type SessionsByDay = {
  [day: string]: {
    [time: string]: BFFSession;
  };
};
type RequestOptions = { withCredentials: boolean; headers: { Cookie: string } };

async function scrapeCalendarData(
  ctx: Context,
  capacity: number,
  requestOptions: RequestOptions,
): Promise<BFFScheduleResponse[]> {
  const requests: Promise<AxiosResponse<BFFScheduleResponse>>[] = [];
  for (let i = 0; i < capacity; i++) {
    const req = ctx.http.post<BFFScheduleResponse>(
      "https://bffclimb.perfectgym.com/clientportal2/FacilityBookings/FacilityCalendar/GetWeeklySchedule",
      {
        clubId: CLUB_ID,
        zoneTypeId: ZONE_TYPE_ID,
        zoneId: ZONE_ID,
        slots: i + 1,
        ageLimitId: null,
        daysInWeek: 7,
      },
      {
        ...requestOptions,
      },
    );
    requests.push(req);
  }
  const results = await Promise.all(requests);
  return results.map((res) => res.data);
}

function calculateSessionsFromData(
  prev: SessionsByDay,
  availableSessionsData: BFFScheduleResponse,
): SessionsByDay {
  const sessionsByDay: SessionsByDay = prev;
  // first, generate sessions with at least 1 slot available
  const slotsPerDay = availableSessionsData.CalendarData;
  const days = availableSessionsData.PagerData.Days;
  // For each day, get all slots
  days.forEach((dayString, indexOfDay) => {
    const sessionsOfDay = {};
    slotsPerDay.forEach((slot) => {
      const slotTime = slot.Hour.split("T")[1];
      const dataOfDay = slot.ClassesPerDay[indexOfDay];
      if (!isEmpty(dataOfDay)) {
        // Hours of the slot need to be derived from slot.Hours, then combined with the StartTime and EndTime
        const startTime = dataOfDay[0].StartTime.slice(0, -8).concat(slotTime);
        sessionsOfDay[slotTime] = {
          starts_at: moment(startTime).toDate(),
          ends_at: moment(startTime).add(2, "hours").toDate(),
          spaces: 1,
        };

        // case where we already generated
        if (
          sessionsByDay[dayString] != null &&
          sessionsByDay[dayString][slotTime] != null
        ) {
          sessionsByDay[dayString][slotTime].spaces += 1;
        }
      }
    });

    // case where we have not generated
    if (sessionsByDay[dayString] == null) {
      sessionsByDay[dayString] = sessionsOfDay;
    }
  });
  return sessionsByDay;
}

function calculateSessions(calendarData: BFFScheduleResponse[]): BFFSession[] {
  // bottom-up generation
  let sessionsByDay: SessionsByDay = {};
  calendarData.forEach((availableSessionsData) => {
    sessionsByDay = calculateSessionsFromData(
      sessionsByDay,
      availableSessionsData,
    );
  });
  return flatten(
    Object.keys(sessionsByDay).map((day) => Object.values(sessionsByDay[day])),
  );
}

const scrape = async (ctx: Context, slug: string): Promise<Session[]> => {
  const gym: Gym = await ctx.db("gyms").where({ slug }).first();
  if (!gym) {
    return;
  }

  // Login
  const loginRes = await ctx.http.post(
    "https://bffclimb.perfectgym.com/clientportal2/Auth/Login",
    {
      RememberMe: false,
      Login: process.env.BFF_CREDS.split(":")[0],
      Password: process.env.BFF_CREDS.split(":")[1],
    },
    { withCredentials: true },
  );
  const requestOptions = {
    withCredentials: true,
    headers: {
      Cookie: loginRes.headers["set-cookie"].join(";"),
    },
  };

  // Get gym capacity
  const clubZoneTypesResponse = await ctx.http.post(
    "https://bffclimb.perfectgym.com/clientportal2/FacilityBookings/FacilityCalendar/GetClubZoneTypes",
    {
      clubId: CLUB_ID,
    },
    { ...requestOptions },
  );
  const gymCapacity = Object.keys(
    clubZoneTypesResponse.data[ZONE_TYPE_ID].Zones[ZONE_ID].ZoneCapacity,
  ).length;

  // Get Calendar data
  const calendarData = await scrapeCalendarData(
    ctx,
    gymCapacity,
    requestOptions,
  );

  const sessions = calculateSessions(calendarData);

  // Log out of session
  await ctx.http.post(
    "https://bffclimb.perfectgym.com/clientportal2/Auth/Login/LogOff",
    {},
    { ...requestOptions },
  );

  return Promise.all(
    sessions.map(async (session) =>
      insertOrUpdateSession(ctx.db, {
        ...session,
        gym_id: gym.id,
      }),
    ),
  );
};

export default scrape;
