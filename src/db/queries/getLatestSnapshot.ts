import type { Knex } from "knex";
import type { Snapshot } from "../models";

const getLatestSnapshot = async (db: Knex): Promise<Snapshot | null> => {
  return db("snapshots").orderBy("created_at", "desc").first();
};

export default getLatestSnapshot;
