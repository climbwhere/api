import type { Knex } from "knex";
import { CreateSession, Session, Gym, SessionWithGymSlug } from "./models";

export type Database = {
  knex: Knex;
  sessions: {
    allWithGymSlugs: () => Promise<SessionWithGymSlug[]>;
    createOrUpdateByGymAndStart: (session: CreateSession) => Promise<Session>;
    create: (session: CreateSession) => Promise<Session>;
  };
  gyms: {
    all: () => Promise<Gym[]>;
    get: (id: string) => Promise<Gym | null>;
    getBySlug: (slug: string) => Promise<Gym | null>;
  };
};
