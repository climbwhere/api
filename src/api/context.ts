import type { Knex } from "knex";
import type { AdminBot } from "../createBot";

export type Context = {
  db: Knex;
  bot: AdminBot;
};
