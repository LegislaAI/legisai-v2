export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  birthDate: Date;
  profession: string;
  password?: string;
}

export interface RecoverPasswordStep1Payload {
  email: string;
}

export interface RecoverPasswordStep3Payload {
  code: string;
  password: string;
}
