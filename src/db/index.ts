import Knex from "knex";

import config from "../../knexfile";
import { getGym, getGymBySlug } from "./queries/gyms";
import { createSession } from "./queries/sessions";

import type { Database } from "./types";

const env = process.env.NODE_ENV ?? "development";

export const connect = (): Database => {
  const knex = Knex(config[env]);
  return {
    knex,
    sessions: {
      create: createSession(knex),
    },
    gyms: {
      get: getGym(knex),
      getBySlug: getGymBySlug(knex),
    },
  };
};

export { Database };
