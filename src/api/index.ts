import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connect } from "../db";
import { configure } from "./routes";
import createBot from "../createBot";

const main = async () => {
  const {
    BOT_SERVER_URL,
    TELEGRAM_BOT_TOKEN,
    ADMIN_CHANNEL,
    PORT,
  } = process.env;

  const bot = createBot({
    token: TELEGRAM_BOT_TOKEN,
    botURL: BOT_SERVER_URL,
    adminChannel: ADMIN_CHANNEL,
  });

  const ctx = {
    db: connect(),
    bot,
  };

  const app = express();

  app.use(cors());

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
