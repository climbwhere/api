import type { Session } from "./session";
import type { Gym } from "./gym";

export type Snapshot = {
  id: string;
  data: SnapshotData;
  created_at: Date;
  has_errors: boolean;
};

export type SnapshotData = {
  gyms?: Gym[];
  sessions?: {
    [name: string]:
      | { data: Session[]; error: undefined }
      | { data: undefined; error: { message: string } };
  };
};
