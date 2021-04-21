import type { Knex } from "knex";
import type { Session } from "../models";

type InsertOrUpdateSession = {
  gym_id: string;
  starts_at: Date;
  ends_at: Date;
  spaces: number;
};

const insertOrUpdateSession = async (
  db: Knex,
  session: InsertOrUpdateSession,
): Promise<Session> => {
  const existingSession = await db("sessions")
    .where({
      gym_id: session.gym_id,
      starts_at: session.starts_at,
    })
    .first();

  if (existingSession) {
    const [updatedSession] = await db("sessions")
      .where({
        id: existingSession.id,
      })
      .update(session)
      .returning("*");
    return updatedSession;
  } else {
    const [insertedSession] = await db("sessions")
      .insert(session)
      .returning("*");
    return insertedSession;
  }
};

export default insertOrUpdateSession;
