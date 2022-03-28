import "dotenv/config";
import "./config";

import { isNil, isEmpty } from "lodash";
import axios from "axios";

import bot from "../bot";
import { connect } from "../db";
import scrapeSessions from "./sessions";

import type { SnapshotData, SnapshotSession } from "../db/models/snapshot";
import type { Context } from "./context";

const main = async () => {
  const adminBot = bot.create({
    token: process.env.TELEGRAM_BOT_TOKEN,
    botURL: process.env.BOT_SERVER_URL,
    adminChannel: process.env.ADMIN_CHANNEL,
  });

  const db = connect();
  const ctx: Context = {
    db,
    http: axios,
    adminBot,
  };

  const data: SnapshotData = {};
  data.gyms = await db("gyms")
    .select("*")
    .whereNotIn("slug", [
      "bff-bukit-timah",
      "bff-bendemeer",
      "boulder-plus-aperia",
      "boulder-plus-chevrons",
    ]);
  data.sessions = (await scrapeSessions(ctx)) as SnapshotSession;

  // Report scraper errors
  let hasErrors = false;
  const errors = Object.keys(data.sessions).filter(
    (gym) => !isNil(data.sessions[gym].error),
  );
  if (!isEmpty(errors)) {
    // await adminBot.sendToAdminChannel(
    //   "Scraper errors detected:",
    //   errors
    //     .map((gym) => `${gym} - ${data.sessions[gym].error.message}`)
    //     .join("\n"),
    // );
    hasErrors = true;
  }

  // Warn for empty results
  // const gymsWithNoResults = [];
  // Object.keys(data.sessions).forEach((gym) => {
  //   if (isEmpty(data.sessions[gym].data)) {
  //     gymsWithNoResults.push(gym);
  //   }
  // });
  // // Ignore bff and lighthouse
  // if (
  //   !isEmpty(
  //     gymsWithNoResults.filter((gym) => !["bff", "lighthouse"].includes(gym)),
  //   )
  // ) {
  //   await adminBot.sendToAdminChannel(
  //     "WARNING Scrapers without output:",
  //     gymsWithNoResults.join("\n"),
  //   );
  // }

  await ctx.db("snapshots").insert({ has_errors: hasErrors, data });

  await db.destroy(); // Close DB connection

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
