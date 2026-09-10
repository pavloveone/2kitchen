import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export class apiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (authToken) {
        config.headers.set('Authorization', `Bearer ${authToken}`);
      }
      return config;
    });
  }

  protected get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  protected post<T>(url: string, data: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  protected put<T>(url: string, data: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  protected delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}
