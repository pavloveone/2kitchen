import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CreateOrder, Dish, Order, OrderItem, OrdersApi } from '../api';

interface OrderState {
  order: OrderItem[];
  orders: Order[];
  isLoadingOrders: boolean;
  isLoadingOrder: boolean;
  isSimulating: boolean;
  addToOrder: (dish: Dish) => Promise<void>;
  removeFromOrder: (dishId: number) => Promise<void>;
  createOrder: (data: CreateOrder) => Promise<void>;
  getMyOrders: () => Promise<Order[]>;
  simulateOrders: () => Promise<void>;
}

const ordersApi = new OrdersApi();

// dedupe concurrent calls (StrictMode double-mount, multiple mounted callers)
let myOrdersRequest: Promise<Order[]> | null = null;

export const useOrderStore = create<OrderState>()(
  immer((set, get) => ({
    order: [],
    orders: [],
    isLoadingOrders: false,
    isLoadingOrder: false,
    isSimulating: false,
    createOrder: async (data) => {
      set({ isLoadingOrder: true });
      try {
        await ordersApi.create(data);
      } finally {
        set({ isLoadingOrder: false });
      }
    },
    getMyOrders: () => {
      if (myOrdersRequest) return myOrdersRequest;
      myOrdersRequest = (async () => {
        set({ isLoadingOrders: true });
        try {
          const { data } = await ordersApi.getMine();
          set({ orders: data });
          return data;
        } finally {
          set({ isLoadingOrders: false });
          myOrdersRequest = null;
        }
      })();
      return myOrdersRequest;
    },
    simulateOrders: async () => {
      const { getMyOrders } = get();
      set({ isSimulating: true });
      try {
        await ordersApi.simulate();
        await getMyOrders();
      } finally {
        set({ isSimulating: false });
      }
    },
    addToOrder: async (dish) => {
      const { order } = get();
      const existing = order.find((item) => item.dish.id === dish.id);
      const updatedOrder = existing
        ? order.map((item) =>
            item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...order, { dish, quantity: 1 }];
      set({ order: updatedOrder });
    },
    removeFromOrder: async (dishId) => {
      const { order } = get();
      const updatedOrder = order.reduce((acc, item) => {
        if (item.dish.id !== dishId) return [...acc, item];
        return item.quantity > 1 ? [...acc, { ...item, quantity: item.quantity - 1 }] : acc;
      }, [] as OrderItem[]);
      set({ order: updatedOrder });
    },
  })),
);
