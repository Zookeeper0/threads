import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useState } from "react";
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
    fetch("/login", {
      method: "POST",
      body: JSON.stringify({
        username: "eastzoo",
        password: "1234",
      }),
    })
      .then((res) => {
        console.log(res);
        if (res.status >= 400) {
          throw Alert.alert("Error", "Invalid credentials");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
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
        console.log(error);
      });
  };

  const logout = () => {
    setUser(null);
    Promise.all([
      SecureStore.deleteItemAsync("accessToken"),
      SecureStore.deleteItemAsync("refreshToken"),
      AsyncStorage.removeItem("user"),
    ]);
  };

  return (
    <AuthContext value={{ user, login, logout }}>
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
    </AuthContext>
  );
}
