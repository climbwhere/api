import axios from 'axios';
import moment from 'moment';
import FormData from 'form-data';
import cheerio from 'cheerio';
import { flatten } from 'lodash';

import type { Session } from '../../models/session';

function parseXML(xml, i) {
  // Let's use a date variable, because each instantiation of this function is for one day
  const date = moment(new Date()).add(i + 1, 'days');
  const slots = [];
  // XML scraping
  const $ = cheerio.load(xml);
  $('label').each((i, e) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const $$ = cheerio.load(e.attribs['aria-label']);
    const startTime = moment($$('span.display-time').text(), 'hh:mmaa');
    date.set({
      hour: startTime.get('hour'),
      minute: startTime.get('minute'),
      second: startTime.get('second'),
    });
    const start = moment(date.toDate()).toDate();
    const end = moment(start).add(3, 'hours').toDate();
    const spaces = $$('div.num-slots-available-container').text().split(' ')[0];
    // Add scraped information to acc
    slots.push({
      gym: 'BFF Climb',
      start,
      end,
      spaces,
    });
  });

  return slots;
}

function createRequest(date) {
  const formData = new FormData();
  formData.append('type', '13677944');
  formData.append('calendar', '3778158');
  formData.append('date', moment(date).format('yyyy-MM-DD'));
  formData.append('ignoreAppointment', '');

  return axios.post('https://app.acuityscheduling.com/schedule.php', formData, {
    headers: { ...formData.getHeaders() },
    params: {
      action: 'availableTimes',
      showSelect: 0,
      fulldate: 1,
      owner: '19322912',
    },
  });
}

export default async function bff(): Promise<Session[]> {
  // First, create all the requests we'll need to get our data
  const requests = [];
  // BFF slots only become available one week before.
  for (let i = 1; i < 8; i++) {
    requests.push(createRequest(moment(new Date()).add(i, 'days')));
  }
  // Make requests
  const res = await Promise.all(requests);
  // Each request returns some xml that we can parse
  const slots = res.map((r, i) => {
    return parseXML(r.data, i);
  });

  return flatten(slots);
}
