import type { AxiosInstance } from "axios";
import type { Knex } from "knex";

export type Context = {
  db: Knex;
  http: AxiosInstance;
};
