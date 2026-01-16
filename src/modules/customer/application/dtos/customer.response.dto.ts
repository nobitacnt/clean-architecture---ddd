export interface CreateCustomerResponseDto {
  id: string;
  email: string;
  name: string;
  creditLimit: number;
  isVerified: boolean;
  createdAt: string;
  message: string;
}

export interface CustomerResponseDto {
  id: string;
  email: string;
  name: string;
  creditLimit: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
