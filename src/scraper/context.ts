import type { AxiosInstance } from "axios";
import type { Knex } from "knex";
import type { Browser } from "puppeteer";

export type Context = {
  db: Knex;
  browser: Browser;
  http: AxiosInstance;
};
