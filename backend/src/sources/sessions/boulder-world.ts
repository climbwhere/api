import axios from 'axios';
import moment from 'moment';
import { flattenDeep } from 'lodash';

import type { Session } from '../../models/session';

async function processSlot(slot, subMetadata, isWeekend): Promise<Session> {
  const dateString = slot.split('_')[0];
  const start = moment(dateString, 'YYYYMMDDkkmm').toDate();

  const endMoment = moment(dateString, 'YYYYMMDDkkmm');
  if (isWeekend) {
    endMoment.add(2, 'hours').add(45, 'minutes');
  } else {
    endMoment.add(3, 'hours');
  }
  const end = endMoment.toDate();

  const spaces =
    subMetadata[slot] !== undefined
      ? subMetadata[slot].split('/').map((comp) => comp.trim())[0]
      : '0';

  return {
    gym: 'Boulder World',
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
        locationId: 'ca204f51-922f-42e3-bdb6-1f8373eb5268',
        accountKey: '566fe29b-2e46-4a73-ad85-c16bfc64b34b',
        serviceKeys: klass,
      },
    }
  );

  return Object.values(res.data.metadata)[0] as string;
}

async function processClass(klass, isWeekend): Promise<Session[]> {
  const firstDateOfClass = await getFirstDateOfClass(klass);
  const date = moment(firstDateOfClass, 'YYYYMMDD').toDate(),
    year = date.getFullYear(),
    month = date.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const res = await axios.get(
    'https://www.picktime.com/book/getClassAppSlots',
    {
      params: {
        locationId: 'ca204f51-922f-42e3-bdb6-1f8373eb5268',
        accountKey: '566fe29b-2e46-4a73-ad85-c16bfc64b34b',
        serviceKeys: klass,
        staffKeys: '',
        endDateAndTime: moment(lastDayOfMonth).format('YYYYMMDD') + '2359',
        v2: true,
      },
    }
  );

  if (!res.data.response) {
    console.warn(`Boulder World: Could not fetch slots for class ${klass}`);
    return [];
  }

  const slots = await Promise.all<Session>(
    res.data.data.map((slot) =>
      processSlot(slot, res.data.subMetadata, isWeekend)
    )
  );

  return slots;
}

export default async function boulderWorld(): Promise<Session[]> {
  const res = await axios.get(
    'https://www.picktime.com/book/getClassesForCurrentLocation',
    {
      params: {
        locationId: 'ca204f51-922f-42e3-bdb6-1f8373eb5268',
        accountKey: '566fe29b-2e46-4a73-ad85-c16bfc64b34b',
      },
    }
  );

  const classes = await Promise.all<Session[][]>(
    res.data.data.map(processClass)
  );

  return flattenDeep(classes);
}
