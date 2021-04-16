export type { CreateSession, Session, SessionWithGymSlug } from "./session";

export type Gym = {
  id: string;
  slug: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
};
