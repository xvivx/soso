import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    silence?: boolean;
  }
  export interface AxiosResponse {
    message: string;
  }
}
