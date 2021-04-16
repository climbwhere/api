export type Gym = {
  id: string;
  slug: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type CreateSession = {
  gym_id: string;
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
