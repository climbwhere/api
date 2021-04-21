import "./config";

import axios from "axios";
import puppeteer from "puppeteer";

import gyms from "./gyms";
import sessions from "./sessions";

import type { Context } from "./context";
import { connect } from "../db";

const isProduction = process.env.NODE_ENV === "production";

const SCRAPERS = [gyms, sessions];

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

  await Promise.all(SCRAPERS.map((scrape) => scrape(ctx)));

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
