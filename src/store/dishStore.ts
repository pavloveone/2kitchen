import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Dish, DishesApi, ModificationDish } from '../api';

interface DishesState {
  dishes: Dish[];
  isLoadingDishes: boolean;
  loadDishes: (restaurantId: number) => Promise<void>;
  addDish: (data: ModificationDish, restaurantId: number) => Promise<void>;
}

const dishesApi = new DishesApi();

// dedupe concurrent calls for the same restaurant (StrictMode double-mount)
let dishesRequest: { restaurantId: number; promise: Promise<void> } | null = null;

export const useDishStore = create<DishesState>()(
  immer((set, get) => ({
    dishes: [],
    isLoadingDishes: false,
    loadDishes: (restaurantId) => {
      if (dishesRequest && dishesRequest.restaurantId === restaurantId) {
        return dishesRequest.promise;
      }
      const promise = (async () => {
        set({ isLoadingDishes: true });
        try {
          const { data } = await dishesApi.getByRestaurant(restaurantId);
          set({ dishes: data });
        } finally {
          set({ isLoadingDishes: false });
          dishesRequest = null;
        }
      })();
      dishesRequest = { restaurantId, promise };
      return promise;
    },
    addDish: async (data, restaurantId) => {
      const { loadDishes } = get();
      set({ isLoadingDishes: true });

      try {
        await dishesApi.create(data);
        await loadDishes(restaurantId);
      } finally {
        set({ isLoadingDishes: false });
      }
    },
  })),
);
