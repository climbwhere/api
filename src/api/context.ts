import type { Knex } from "knex";
import type { AdminBot } from "../bot";

export type Context = {
  db: Knex;
  adminBot: AdminBot;
};
