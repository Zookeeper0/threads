import axios, { AxiosError, AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    console.log("config", config);
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        // 토큰이 재발급되었으므로, 원래의 요청을 다시 보냅니다.
        return api(originalRequest);
      } catch (e) {
        // 리프레시 토큰이 만료되었거나 유효하지 않은 경우 로그아웃 처리
        // RecoilLogout();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    console.log("request 함수 호출됨, config:", config);
    console.log("baseURL:", api.defaults.baseURL);

    const { data }: any = await api.request<T>({ ...config });
    console.log("API 응답 데이터:", data);
    return data;
  } catch (error) {
    const { response }: any = error as unknown as AxiosError;
    console.log("[response] 에러:", error);
    console.log("에러 상세:", {
      message: (error as any)?.message,
      code: (error as any)?.code,
      response: response?.data,
      status: response?.status,
    });

    if (response) {
      throw response.data;
    }

    throw error;
  }
};

const setUserId = (userId: any) => {
  api.defaults.headers.common["userId"] = userId;
};

const setToken = (token: any) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

const setIp = (ip: string) => {
  api.defaults.headers.common["ip"] = ip;
};

export { request, setIp, setToken, setUserId };
