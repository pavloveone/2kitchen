import { apiClient } from './apiClient';
import { Dish } from './dishesApi';

export type Order = {
  id: number;
  restaurant: number;
  items: string; // JSON
  order_time: string;
  status: string;
  payment_status: string;
};

export type OrderItem = {
  dish: Dish;
  quantity: number;
};

export type CreateOrder = {
  restaurant: number;
  items: OrderItem[];
};

export class OrdersApi extends apiClient {
  constructor() {
    const baseUrl = `${process.env.REACT_APP_API_URL ?? 'http://127.0.0.1:8080'}/orders`;
    super(baseUrl);
  }

  public getMine = async () => {
    return this.get<Order[]>(``);
  };

  public create = async (order: CreateOrder) => {
    return this.post<void>(``, order);
  };

  public simulate = async () => {
    return this.post<void>(`/simulate`, {});
  };
}
