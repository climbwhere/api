import { Browser } from 'puppeteer';
import moment from 'moment';

import type { Session } from '../../models/session';

export default async function fitbloc(browser: Browser): Promise<Session[]> {
  const page = await browser.newPage();

  await page.goto('https://fitbloc.com/booking/');
  await page.waitFor(5000);

  const sessions = await page.evaluate(() => {
    const sessions = [];

    const sessionElems = document.querySelectorAll('.bw-session');
    for (const sessionElem of sessionElems) {
      const nameElem = sessionElem.querySelector('.bw-session__name');
      const startTimeElem = sessionElem.querySelector('.hc_starttime');
      const endTimeElem = sessionElem.querySelector('.hc_endtime');
      const waitlistElem = sessionElem.querySelector('.hc_waitlist');
      const slotsElem = sessionElem.querySelector('.hc_availability');

      if (!nameElem) {
        continue;
      }

      if (!nameElem.textContent.includes('Gym Entry')) {
        continue;
      }

      let spaces = 0;
      if (!waitlistElem) {
        if (!slotsElem) {
          continue;
        }
        spaces = parseInt(slotsElem.textContent.trim().slice(0, 2), 10);
      }

      sessions.push({
        gym: 'Fit Bloc',
        start: startTimeElem.getAttribute('datetime'),
        end: endTimeElem.getAttribute('datetime'),
        spaces,
      });
    }

    return sessions;
  });

  return sessions.map((session) => ({
    ...session,
    start: moment(session.start).toDate(),
    end: moment(session.end).toDate(),
  }));
}
