export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  profession: string;
  password?: string;
  cpfCnpj?: string | null;
  postalCode?: string | null;
  addressNumber?: string | null;
}

export type ProfileProps = User;
