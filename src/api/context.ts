import type { Knex } from "knex";

export type Context = {
  db: Knex;
};
