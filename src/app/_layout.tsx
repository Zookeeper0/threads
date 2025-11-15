import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  profileImageUrl: string;
  description: string;
  link?: string;
  showInstagramBadge?: boolean;
  isPrivate?: boolean;
}

export const AuthContext = createContext<{
  user: User | null;
  login?: () => void;
  logout?: () => void;
  updateUser?: (user: User) => void;
}>({
  user: null,
});

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 stale time (5분)
      staleTime: 5 * 60 * 1000,
      // 기본 cache time (10분)
      gcTime: 10 * 60 * 1000,
      // 재시도 횟수
      retry: 3,
      // 재시도 간격 (지수 백오프)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 에러 발생 시 자동 재시도 비활성화
      retryOnMount: false,
      // 윈도우 포커스 시 자동 재시도
      refetchOnWindowFocus: false,
      // 네트워크 재연결 시 자동 재시도
      refetchOnReconnect: true,
    },
    mutations: {
      // mutation 재시도 횟수
      retry: 1,
      // mutation 재시도 간격
      retryDelay: 1000,
    },
  },
});

/**
 * 전체 앱 레이아웃
 * 1. 구글 애널리틱스 추적 코드
 * 2. 권한 설정
 * 3. 초기화 설정들
 */
export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    console.log("login");

    // 실제 API 서버와 통신
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "eastzoo",
        password: "1234",
      }),
    })
      .then((res) => {
        console.log("login res", res);
        if (res.status >= 400) {
          throw new Error("Invalid credentials");
        }
        return res.json();
      })
      .then((data) => {
        console.log("login data", data);
        setUser(data.user);
        Promise.all([
          SecureStore.setItemAsync("accessToken", data.accessToken),
          SecureStore.setItemAsync("refreshToken", data.refreshToken),
          AsyncStorage.setItem("user", JSON.stringify(data.user)),
        ]);
      })
      .then(() => {
        router.push("/(tabs)");
      })
      .catch((error) => {
        console.log("login error", error);
        // 로그인 실패 시 하드코딩된 사용자로 로그인 (개발용)
        const mockUser = {
          id: "eastzoo",
          name: "eastzoo",
          description: "🐢 lover, programmer, youtuber",
          profileImageUrl: "https://avatars.githubusercontent.com/u/885857?v=4",
        };

        const mockTokens = {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        };

        setUser(mockUser);
        Promise.all([
          SecureStore.setItemAsync("accessToken", mockTokens.accessToken),
          SecureStore.setItemAsync("refreshToken", mockTokens.refreshToken),
          AsyncStorage.setItem("user", JSON.stringify(mockUser)),
        ]).then(() => {
          router.push("/(tabs)");
        });
      });
  };

  const logout = () => {
    setUser(null);
    // 로그아웃 시 모든 쿼리 캐시 클리어
    queryClient.clear();
    Promise.all([
      SecureStore.deleteItemAsync("accessToken"),
      SecureStore.deleteItemAsync("refreshToken"),
      AsyncStorage.removeItem("user"),
    ]);
  };

  useEffect(() => {
    AsyncStorage.getItem("user").then((user) => {
      if (user) {
        setUser(user ? JSON.parse(user) : null);
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="(tabs)"
        >
          {/* 아래 코드 적용시 탭 레이아웃도 스택처럼 쌓이게 됨 */}
          <Stack.Screen name="(tabs)" />
          {/* 모달 페이지는 스택 레이아웃에 포함되지 않음 
        모달 표현 방식으로 모달을 띄우게 부모 레이아웃에서 띄우게 함*/}
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
