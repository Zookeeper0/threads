import { Stack } from "expo-router";

/**
 * 전체 앱 레이아웃
 * 1. 구글 애널리틱스 추적 코드
 * 2. 권한 설정
 * 3. 초기화 설정들
 */
export default function RootLayout() {
  return (
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
  );
}
