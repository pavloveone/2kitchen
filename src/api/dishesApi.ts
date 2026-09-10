import { apiClient } from './apiClient';

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  restaurant: number;
}

export interface ModificationDish {
  name: string;
  description: string;
  price: number;
  image: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

export class DishesApi extends apiClient {
  constructor() {
    const baseUrl = `${process.env.REACT_APP_API_URL ?? 'http://127.0.0.1:8080'}/dishes`;
    super(baseUrl);
  }

  public getByRestaurant = async (restaurantId: number) => {
    return this.get<Dish[]>(`/${restaurantId}`);
  };

  public create = async (dish: ModificationDish) => {
    return this.post<void>(``, dish);
  };

  public remove = async (id: number) => {
    return this.delete<void>(``, { data: { id } });
  };
}
