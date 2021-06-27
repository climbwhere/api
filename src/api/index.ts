import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import bot from "../bot";
import { connect } from "../db";
import { configure } from "./routes";
import { Context } from "./context";

const main = async () => {
  const {
    BOT_SERVER_URL,
    TELEGRAM_BOT_TOKEN,
    ADMIN_CHANNEL,
    PORT,
    ENV,
  } = process.env;

  const adminBot = bot.create({
    token: TELEGRAM_BOT_TOKEN,
    botURL: BOT_SERVER_URL,
    adminChannel: ADMIN_CHANNEL,
  });

  const ctx: Context = {
    db: connect(),
    adminBot,
  };

  const app = express();

  app.use(
    cors({
      origin: ENV === "development" ? "*" : ["https://www.climbwhere.sg"],
    }),
  );

  configure(ctx, app);

  const port = PORT || 3030;
  app.listen(port, () => {
    console.log(`listening on port ${port}...`);
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
