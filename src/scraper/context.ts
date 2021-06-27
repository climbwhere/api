import type { AxiosInstance } from "axios";
import type { Knex } from "knex";
import type { Browser } from "puppeteer";

import { AdminBot } from "../bot";

export type Context = {
  db: Knex;
  browser: Browser;
  http: AxiosInstance;
  adminBot: AdminBot;
};
