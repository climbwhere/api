import 'ts-polyfill/lib/es2019-array';

import puppeteer, { Browser } from 'puppeteer';

import * as Sentry from '@sentry/node';
import { readStore, writeStore } from './output';

import fs from 'fs';
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Singapore');

import type { Session } from './models/session';
import boulderPlus from './sources/sessions/boulder-plus';
import zVertigo from './sources/sessions/z-vertigo';
import boulderWorld from './sources/sessions/boulder-world';
import fitbloc from './sources/sessions/fitbloc';
import bff from './sources/sessions/bff';
import oyeyo from './sources/sessions/oyeyo';
import lighthouse from './sources/sessions/lighthouse';

const { NODE_ENV, SENTRY_DSN } = process.env;

const isProduction = NODE_ENV === 'production';

async function sessions(browser: Browser) {
  writeStore('sessions.json', {});

  async function tempFunc(workFunc: (browser: Browser) => Promise<Session[]>) {
    const data = await workFunc(browser);

    const store = readStore('sessions.json');
    writeStore('sessions.json', {
      ...store,
      data: store.data ? [...store.data, ...data] : data,
    });
  }

  await Promise.all(
    [boulderPlus, boulderWorld, fitbloc, bff, oyeyo, zVertigo, lighthouse].map(
      tempFunc
    )
  );

  const store = readStore('sessions.json');
  writeStore('sessions.json', {
    ...store,
    last_updated: new Date(),
  });
}

async function scrape() {
  const isARMMac = process.arch === 'arm64' && process.platform === 'darwin';

  const browser = await puppeteer.launch({
    headless: isProduction,
    defaultViewport: null,
    args: isProduction ? ['--no-sandbox'] : [],
    executablePath: isARMMac
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined,
  });

  await sessions(browser);

  await browser.close();
}

async function main() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
    });
  }

  try {
    fs.mkdirSync('traces');
  } catch (err) {}

  try {
    await scrape();
  } catch (err) {
    console.error(err);
    Sentry?.captureException(err);
    process.exit(1);
  }
}

main();
