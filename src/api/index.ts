import "dotenv/config";

import express from "express";
import cors from "cors";

import bot from "../bot";
import { connect } from "../db";
import { configure } from "./routes";
import { Context } from "./context";

const main = async () => {
  const adminBot = bot.create({
    token: process.env.TELEGRAM_BOT_TOKEN,
    botURL: process.env.BOT_SERVER_URL,
    adminChannel: process.env.ADMIN_CHANNEL,
  });

  const ctx: Context = {
    db: connect(),
    adminBot,
  };

  const app = express();

  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "development"
          ? "*"
          : [
              "https://www.climbwhere.sg",
              "https://app.netlify.com/sites/elastic-franklin-9a8023/deploys",
            ],
    }),
  );

  configure(ctx, app);

  const port = process.env.PORT || 3030;
  app.listen(port, () => {
    console.log(`listening on port ${port}...`);
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
