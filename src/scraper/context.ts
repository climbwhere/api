import type { AxiosInstance } from "axios";
import type { Database } from "../db";

export type Context = {
  db: Database;
  http: AxiosInstance;
};
