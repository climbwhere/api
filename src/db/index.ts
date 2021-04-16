import Knex from "knex";

import config from "../../knexfile";
import { getAllGyms, getGym, getGymBySlug } from "./queries/gyms";
import {
  createSession,
  getAllSessionsWithGymSlugs,
  updateSessionByGymAndStart,
} from "./queries/sessions";

import type { Database } from "./types";

const env = process.env.NODE_ENV ?? "development";

export const connect = (): Database => {
  const knex = Knex(config[env]);
  return {
    knex,
    sessions: {
      allWithGymSlugs: getAllSessionsWithGymSlugs(knex),
      updateByGymAndStart: updateSessionByGymAndStart(knex),
      create: createSession(knex),
    },
    gyms: {
      all: getAllGyms(knex),
      get: getGym(knex),
      getBySlug: getGymBySlug(knex),
    },
  };
};

export { Database };
