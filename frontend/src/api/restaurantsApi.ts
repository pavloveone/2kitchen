import { apiClient } from './apiClient';

export interface Restaurant {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  createdOn: string;
}

export interface CreateRestaurantRequest {
  name: string;
  description: string;
}

export class RestaurantsApi extends apiClient {
  constructor() {
    const baseUrl = `${process.env.REACT_APP_API_URL ?? 'http://127.0.0.1:8080'}/restaurants`;
    super(baseUrl);
  }

  public getAll = async () => {
    return this.get<Restaurant[]>('');
  };

  public getById = async (id: number) => {
    return this.get<Restaurant>(`/${id}`);
  };

  public getMine = async () => {
    return this.get<Restaurant>('/me');
  };

  public create = async (data: CreateRestaurantRequest) => {
    return this.post<{ id: number }>('', data);
  };

  public updateMine = async (data: CreateRestaurantRequest) => {
    return this.put<void>('/me', data);
  };

  public deleteMine = async () => {
    return this.delete<void>('/me');
  };
}
