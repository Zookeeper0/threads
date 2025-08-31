import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";

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

    // 개발 환경에서는 MirageJS 서버 사용, 실제 기기에서는 하드코딩된 로그인 처리
    if (__DEV__) {
      fetch("/login", {
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
          Alert.alert("Error", "로그인에 실패했습니다.");
        });
    } else {
      // 실제 기기에서는 하드코딩된 로그인 처리
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
    }
  };

  const logout = () => {
    setUser(null);
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
    <AuthContext.Provider value={{ user, login, logout }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* 아래 코드 적용시 탭 레이아웃도 스택처럼 쌓이게 됨 */}
        <Stack.Screen name="(tabs)" />
        {/* 모달 페이지는 스택 레이아웃에 포함되지 않음 
      모달 표현 방식으로 모달을 띄우게 부모 레이아웃에서 띄우게 함*/}
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </AuthContext.Provider>
  );
}
