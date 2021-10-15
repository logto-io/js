import axios, { AxiosError } from 'axios';

import { OPError } from './errors';

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(
  (config) => config,
  async (error: Error) => {
    return Promise.reject(
      new OPError({
        errorMessage: 'request error with OP',
        errorDescription: error.message,
      })
    );
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const opError = new OPError({
      errorMessage: 'response error with OP',
      errorDescription: error.message,
    });
    return Promise.reject(opError);
  }
);

export const opRequest = axiosInstance;
