import type { Gym } from "../models";
import type { Knex } from "knex";

export const getGym = (knex: Knex) => async (id: string): Promise<Gym> => {
  return knex("gyms").where({ id }).first();
};

export const getGymBySlug = (knex: Knex) => async (
  slug: string,
): Promise<Gym> => {
  return knex("gyms").where({ slug }).first();
};
