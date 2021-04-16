import type { Knex } from "knex";
import { CreateSession, Session, Gym } from "./models";

export type Database = {
  knex: Knex;
  sessions: {
    create: (session: CreateSession) => Promise<Session>;
  };
  gyms: {
    all: () => Promise<Gym[]>;
    get: (id: string) => Promise<Gym | null>;
    getBySlug: (slug: string) => Promise<Gym | null>;
  };
};
