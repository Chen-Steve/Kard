export interface UserType {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  membership: string;
  streak?: number;
}
