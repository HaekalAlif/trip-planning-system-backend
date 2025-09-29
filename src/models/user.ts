export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
