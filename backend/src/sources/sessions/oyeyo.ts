import axios from 'axios';
import moment from 'moment';
import { flatten, flattenDeep } from 'lodash';

import type { Session } from '../../models/session';

async function processSlot(slot, subMetadata): Promise<Session> {
  const dateString = slot.split('_')[0];
  const start = moment(dateString, 'YYYYMMDDkkmm').toDate();
  const end = moment(dateString, 'YYYYMMDDkkmm').add(2, 'hours').toDate(); // TODO: don't assume oyeyo time slot length

  const spaces =
    subMetadata[slot] !== undefined
      ? subMetadata[slot].split('/').map((comp) => comp.trim())[0]
      : '0';

  return {
    gym: 'Oyeyo',
    start,
    end,
    spaces,
  };
}

async function getFirstDateOfClass(klass): Promise<string> {
  const res = await axios.get(
    'https://www.picktime.com/book/get1stDateForCurrentClass',
    {
      params: {
        locationId: '07e26051-689f-471c-8201-bf03796a6a04',
        accountKey: '5176b721-0be8-447e-b43b-3652af54bd7b',
        serviceKeys: klass,
      },
    }
  );

  return Object.values(res.data.metadata)[0] as string;
}

async function processStaff(klass, staff): Promise<Session[]> {
  const firstDateOfClass = await getFirstDateOfClass(klass);
  const date = moment(firstDateOfClass, 'YYYYMMDD').toDate(),
    year = date.getFullYear(),
    month = date.getMonth();
  const lastDayOfNextMonth = new Date(year, month + 1, 0);

  const res = await axios.get(
    'https://www.picktime.com/book/getClassAppSlots',
    {
      params: {
        locationId: '07e26051-689f-471c-8201-bf03796a6a04',
        accountKey: '5176b721-0be8-447e-b43b-3652af54bd7b',
        serviceKeys: klass,
        staffKeys: staff,
        endDateAndTime: moment(lastDayOfNextMonth).format('YYYYMMDD') + '2359',
        v2: true,
      },
    }
  );

  const slots = Promise.all<Session>(
    res.data.data.map(async (slot) => processSlot(slot, res.data.subMetadata))
  );

  return slots;
}

async function processClass(klass): Promise<Session[][]> {
  const res = await axios.get(
    'https://www.picktime.com/book/getStaffForCurrentClass',
    {
      params: {
        locationId: '07e26051-689f-471c-8201-bf03796a6a04',
        accountKey: '5176b721-0be8-447e-b43b-3652af54bd7b',
        serviceKeys: klass,
      },
    }
  );

  const staffs = await Promise.all<Session[]>(
    res.data.data.map((staff) => processStaff(klass, staff))
  );

  return staffs;
}

export default async function oyeyo(): Promise<Session[]> {
  const res = await axios.get(
    'https://www.picktime.com/book/getClassesForCurrentLocation',
    {
      params: {
        locationId: '07e26051-689f-471c-8201-bf03796a6a04',
        accountKey: '5176b721-0be8-447e-b43b-3652af54bd7b',
      },
    }
  );

  const classes = await Promise.all<Session[][]>(
    res.data.data.map(processClass)
  );

  return flattenDeep(classes);
}
