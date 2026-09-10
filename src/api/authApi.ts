import { apiClient } from './apiClient';

export interface RegisterUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdOn: string;
}

export interface LoginResponse {
  user: UserResponse;
  access_token: string;
  refresh_token: string;
}

export class AuthApi extends apiClient {
  constructor() {
    const baseUrl = `${process.env.REACT_APP_API_URL ?? 'http://127.0.0.1:8080'}/users`;
    super(baseUrl);
  }

  public register = async (data: RegisterUserRequest) => {
    return this.post<{ id: number }>('', data);
  };

  public login = async (data: LoginRequest) => {
    return this.post<LoginResponse>('/login', data);
  };
}
