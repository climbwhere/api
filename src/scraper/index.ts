import "./config";

import axios from "axios";
import puppeteer from "puppeteer";

import { connect } from "../db";
import getLatestSnapshot from "../db/queries/getLatestSnapshot";
import gyms from "./gyms";
import sessions from "./sessions";
import calculateChanges from "./shared/helpers/calculateChanges";

import type { SnapshotData } from "../db/models/snapshot";
import type { Context } from "./context";
import moment from "moment";

const isProduction = process.env.NODE_ENV === "production";

const SCRAPERS = [
  { resource: "gyms", scrape: gyms },
  { resource: "sessions", scrape: sessions },
];

const main = async () => {
  const db = connect();

  const browser = await puppeteer.launch({
    headless: isProduction,
    defaultViewport: null,
    args: isProduction ? ["--no-sandbox"] : [],
  });

  const ctx: Context = {
    db,
    browser,
    http: axios,
  };

  const results = await Promise.all(
    SCRAPERS.map(async ({ resource, scrape }) => {
      const result = await scrape(ctx);
      return { resource, result };
    }),
  );

  const previousSnapshot = await getLatestSnapshot(ctx.db);
  const previousData = previousSnapshot?.data;

  const data: SnapshotData = {};
  results.forEach(({ resource, result }) => {
    if (result) {
      data[resource] = result;
    }
  });
  await ctx.db("snapshots").insert({ data });

  const changes = calculateChanges(previousData, data);
  console.log(JSON.stringify(changes, null, 4));

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
