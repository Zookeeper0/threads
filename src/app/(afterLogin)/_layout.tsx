/**
 * 로그인 후의 레이아웃들 설정
 */
import { Stack } from "expo-router";

export default function AfterLoginLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
