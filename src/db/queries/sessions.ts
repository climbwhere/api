import type { Session, CreateSession, SessionWithGymSlug } from "../models";
import type { Knex } from "knex";

export const getAllSessionsWithGymSlugs = (knex: Knex) => async (): Promise<
  SessionWithGymSlug[]
> => {
  return knex("sessions")
    .join("gyms", "sessions.gym_id", "gyms.id")
    .select("sessions.id", "gyms.slug AS gym", "start", "end", "spaces")
    .orderBy("start", "asc");
};

export const createOrUpdateSessionByGymAndStart = (knex: Knex) => async (
  session: CreateSession,
): Promise<Session | undefined> => {
  const [updatedSession] = await knex("sessions")
    .where({
      gym_id: session.gym_id,
      start: session.start,
    })
    .update(session)
    .returning("*");
  if (updatedSession) {
    return updatedSession;
  }

  const [insertedSession] = await knex("sessions")
    .insert(createSession)
    .returning("*");
  return insertedSession;
};

export const createSession = (knex: Knex) => async (
  session: CreateSession,
): Promise<Session> => {
  const [insertedSession] = await knex("sessions")
    .insert(session)
    .returning("*");
  return insertedSession;
};
