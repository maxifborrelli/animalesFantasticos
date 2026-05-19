export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface RegisterUserInput {
  fullName: string;
  email: string;
  phone: string | null;
  password: string;
}

export interface CreateUserRecord {
  fullName: string;
  email: string;
  phone: string | null;
  passwordHash: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateUserProfileInput {
  userId: number;
  fullName: string;
  phone: string | null;
}
