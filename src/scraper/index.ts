import "./config";

import axios from "axios";

import gyms from "./gyms";
import sessions from "./sessions";

import type { Context } from "./context";
import { connect } from "../db";

const SCRAPERS = [gyms, sessions];

const main = async () => {
  const db = connect();

  const ctx: Context = {
    db,
    http: axios,
  };

  await Promise.all(SCRAPERS.map((scrape) => scrape(ctx)));

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
