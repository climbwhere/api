import type { Session, CreateSession } from "../models";
import type { Knex } from "knex";

export const createSession = (knex: Knex) => async (
  createSession: CreateSession,
): Promise<Session> => {
  const [session] = await knex("sessions").insert(createSession).returning("*");
  return session;
};
