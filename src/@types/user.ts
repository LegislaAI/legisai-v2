export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  profession: string;
  password?: string;
}

export type ProfileProps = User;
