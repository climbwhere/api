export type CreateSnapshot = {
  session_id: string;
  spaces: number;
};

export type Snapshot = {
  id: string;
  session_id: string;
  spaces: number;
  created_at: Date;
};
