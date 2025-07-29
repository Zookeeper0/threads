import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";

/**
 * - 아이콘 참고 사이트
 * https://icons.expo.fyi/Index
 */
export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home"
              size={24}
              color={focused ? "black" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="search"
              size={24}
              color={focused ? "black" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        listeners={{
          tabPress: (e) => {
            // add는 페이지가 아닌 모달이 떠야하는 탭, 라우터 기능 방지
            e.preventDefault();
            router.navigate("/modal");
          },
        }}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <Ionicons name="add" size={24} color={focused ? "black" : "gray"} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="heart-outline"
              size={24}
              color={focused ? "black" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="[username]"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person-outline"
              size={24}
              color={focused ? "black" : "gray"}
            />
          ),
        }}
      />
      {/* 메인 화면에서 "/" 와 "/following" 페이지를 탭을통해 이동할 수 있는데 following은 탭에 표시하지 않음 
        href: null 옵션을 추가하면 탭에 표시되지 않음
      */}
      {/* <Tabs.Screen
        name="following"
        options={{
          tabBarLabel: () => null,
          href: null,
        }}
      /> */}
    </Tabs>
  );
}
