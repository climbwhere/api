export type CreateSession = {
  gym_id: string;
  starts_at: Date;
  ends_at: Date;
};

export type Session = {
  id: string;
  gym_id: string;
  starts_at: Date;
  ends_at: Date;
};
