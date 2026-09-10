import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CreateRestaurantRequest, Restaurant, RestaurantsApi } from '../api';

interface RestaurantState {
  restaurants: Restaurant[];
  myRestaurant: Restaurant | null;
  isLoadingRestaurants: boolean;
  isLoadingMyRestaurant: boolean;
  loadRestaurants: () => Promise<void>;
  loadMyRestaurant: () => Promise<void>;
  registerRestaurant: (data: CreateRestaurantRequest) => Promise<void>;
  updateMyRestaurant: (data: CreateRestaurantRequest) => Promise<void>;
  deleteMyRestaurant: () => Promise<void>;
}

const restaurantsApi = new RestaurantsApi();

// dedupe concurrent calls (StrictMode double-mount, multiple mounted callers)
let restaurantsRequest: Promise<void> | null = null;
let myRestaurantRequest: Promise<void> | null = null;

export const useRestaurantStore = create<RestaurantState>()(
  immer((set) => ({
    restaurants: [],
    myRestaurant: null,
    isLoadingRestaurants: false,
    isLoadingMyRestaurant: false,
    loadRestaurants: () => {
      if (restaurantsRequest) return restaurantsRequest;
      restaurantsRequest = (async () => {
        set({ isLoadingRestaurants: true });
        try {
          const { data } = await restaurantsApi.getAll();
          set({ restaurants: data });
        } finally {
          set({ isLoadingRestaurants: false });
          restaurantsRequest = null;
        }
      })();
      return restaurantsRequest;
    },
    loadMyRestaurant: () => {
      if (myRestaurantRequest) return myRestaurantRequest;
      myRestaurantRequest = (async () => {
        set({ isLoadingMyRestaurant: true });
        try {
          const { data } = await restaurantsApi.getMine();
          set({ myRestaurant: data });
        } finally {
          set({ isLoadingMyRestaurant: false });
          myRestaurantRequest = null;
        }
      })();
      return myRestaurantRequest;
    },
    registerRestaurant: async (data) => {
      await restaurantsApi.create(data);
      const { data: mine } = await restaurantsApi.getMine();
      set({ myRestaurant: mine });
    },
    updateMyRestaurant: async (data) => {
      await restaurantsApi.updateMine(data);
      const { data: mine } = await restaurantsApi.getMine();
      set({ myRestaurant: mine });
    },
    deleteMyRestaurant: async () => {
      await restaurantsApi.deleteMine();
      set({ myRestaurant: null });
    },
  })),
);
