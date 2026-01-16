export interface CustomerModel {
  id: string;
  email: string;
  name: string;
  creditLimit: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
