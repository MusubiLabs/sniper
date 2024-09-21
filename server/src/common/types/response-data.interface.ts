// src/interfaces/response-data.interface.ts
export interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
}
