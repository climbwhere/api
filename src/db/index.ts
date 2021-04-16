import knex from "knex";

import config from "../../knexfile";

import type { Knex } from "knex";

const env = process.env.NODE_ENV ?? "development";

export const connect = (): Knex => {
  return knex(config[env]);
};
