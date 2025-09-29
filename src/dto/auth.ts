export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
