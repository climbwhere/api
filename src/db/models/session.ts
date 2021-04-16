export type CreateSession = {
  gym_id: string;
  start: Date;
  end: Date;
  spaces: number;
};

export type SessionWithGymSlug = {
  id: string;
  gym: string;
  start: Date;
  end: Date;
  spaces: number;
};

export type Session = {
  id: string;
  gym_id: string;
  start: Date;
  end: Date;
  spaces: number;
};
