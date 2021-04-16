import type { Session, CreateSession, SessionWithGymSlug } from "../models";
import type { Knex } from "knex";

export const getAllSessionsWithGymSlugs = (knex: Knex) => async (): Promise<
  SessionWithGymSlug[]
> => {
  return knex("sessions")
    .join("gyms", "sessions.gym_id", "gyms.id")
    .select("sessions.id", "gyms.slug AS gym", "start", "end", "spaces");
};

export const createSession = (knex: Knex) => async (
  createSession: CreateSession,
): Promise<Session> => {
  const [session] = await knex("sessions").insert(createSession).returning("*");
  return session;
};
