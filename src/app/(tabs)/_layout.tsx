import { Ionicons } from "@expo/vector-icons";
import { type BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Animated as RNAnimated,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";

// Figma에서 가져온 아이콘 URL
const HOME_ACTIVE_ICON_1 =
  "http://localhost:3845/assets/f13afbf4730c6ad710ab5d3efcd9a724879a98a0.svg";
const HOME_ACTIVE_ICON_2 =
  "http://localhost:3845/assets/51bc2896c48bfe24994175dcdf9465e3886f39a2.svg";
const HOME_INACTIVE_ICON_1 =
  "http://localhost:3845/assets/794a779afd75460d2bd13b6b169a57ab2a463a1e.svg";
const HOME_INACTIVE_ICON_2 =
  "http://localhost:3845/assets/fc92483020d135d272b71f0066221ed34b1c005c.svg";
const MEMORY_BOARD_ICON_1 =
  "http://localhost:3845/assets/159819f6d150aa93c6001433f101c28791008907.svg";
const MEMORY_BOARD_ICON_2 =
  "http://localhost:3845/assets/59dd1cfcf37d24d6e99caa4133a97ff819482226.svg";
const CALENDAR_ICON_1 =
  "http://localhost:3845/assets/94386111e00b29ffc9c28d77fa1199fada2c90b9.svg";
const CALENDAR_ICON_2 =
  "http://localhost:3845/assets/1b8f06732fdb510ae3356741333bc763398b65b3.svg";
const CALENDAR_ICON_3 =
  "http://localhost:3845/assets/a972c3bf392f5835e0344b8ec62baab06ec26063.svg";
const MY_ICON =
  "http://localhost:3845/assets/4a834572d9322ed0ebcedab3d9b10ab4d956b410.svg";

interface AnimatedTabBarButtonProps extends BottomTabBarButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  restProps?: any;
}

const AnimatedTabBarButton = ({
  children,
  onPress,
  style,
  ...restProps
}: AnimatedTabBarButtonProps) => {
  const scaleValue = useRef(new RNAnimated.Value(1)).current;

  const handlePressOut = () => {
    RNAnimated.sequence([
      RNAnimated.spring(scaleValue, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 200,
      }),
      RNAnimated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 200,
      }),
    ]).start();
  };

  return (
    <Pressable
      {...(restProps as any)}
      onPress={onPress}
      onPressOut={handlePressOut}
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
      // Disable Android ripple effect
      android_ripple={{ borderless: false, radius: 0 }}
    >
      <RNAnimated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </RNAnimated.View>
    </Pressable>
  );
};

export default function TabLayout() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  console.log("pathname", pathname);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 메모리보드 화면일 때 탭바 숨기기
  const isBoardScreen = pathname?.includes("(board)");
  const translateY = useSharedValue(isBoardScreen ? 200 : 0);

  // 탭바 translateY 값을 일반 숫자로 변환 (애니메이션 적용을 위해)
  const [tabBarTranslateY, setTabBarTranslateY] = useState(
    isBoardScreen ? 200 : 0
  );
  const [tabBarOpacity, setTabBarOpacity] = useState(isBoardScreen ? 0 : 1);

  // 탭바 애니메이션
  useEffect(() => {
    const targetY = isBoardScreen ? 200 : 0;
    const targetOpacity = isBoardScreen ? 0 : 1;

    translateY.value = withTiming(targetY, {
      duration: 300,
    });

    // opacity는 즉시 변경 (더 확실하게 숨기기)
    setTabBarOpacity(targetOpacity);

    // translateY 값 추적
    const updateTranslateY = () => {
      setTabBarTranslateY(translateY.value);
    };

    // 초기값 설정
    setTabBarTranslateY(targetY);

    // 애니메이션 중 값 추적
    const interval = setInterval(() => {
      updateTranslateY();
    }, 16);

    return () => clearInterval(interval);
  }, [isBoardScreen, translateY]);

  // 앱 시작 시 홈 화면으로 이동 (한 번만 실행)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname === "/(tabs)" || pathname === "/") {
        router.replace("/(tabs)/search");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const toLoginPage = () => {
    setIsLoginModalOpen(false);
    router.push("/login");
  };

  return (
    <>
      <Tabs
        backBehavior="history"
        initialRouteName="search"
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: isBoardScreen ? "transparent" : "#FFFCF8",
              borderTopWidth: 0,
              elevation: isBoardScreen ? 0 : 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isBoardScreen ? 0 : 0.1,
              shadowRadius: 10,
              height: isBoardScreen ? 0 : 64,
              paddingBottom: isBoardScreen ? 0 : 9,
              paddingTop: isBoardScreen ? 0 : 9,
              paddingHorizontal: isBoardScreen ? 0 : 16,
              borderRadius: 9999,
              marginHorizontal: "auto",
              marginBottom: isBoardScreen ? -300 : Math.max(9, insets.bottom),
              width: isBoardScreen ? 0 : 360,
              position: "absolute",
              bottom: isBoardScreen ? -300 : tabBarTranslateY,
              alignSelf: "center",
              opacity: isBoardScreen ? 0 : tabBarOpacity,
              overflow: "hidden",
              pointerEvents: isBoardScreen ? "none" : "auto",
              zIndex: isBoardScreen ? -999 : 1,
            },
          ],
          tabBarButton: (props: any) => <AnimatedTabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="search"
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabBarLabel,
                  {
                    color: focused ? "#31170F" : "#432014",
                    fontWeight: focused ? "700" : "400",
                  },
                ]}
              >
                홈
              </Text>
            ),
            tabBarIcon: ({ focused }) => {
              const iconSize = focused ? 28 : 24;
              // SVG가 로드되지 않을 경우를 대비해 Ionicons로 폴백
              if (focused) {
                return (
                  <View
                    style={[
                      styles.iconContainer,
                      { width: iconSize, height: iconSize },
                    ]}
                  >
                    <Ionicons name="home" size={iconSize} color="#FF6638" />
                  </View>
                );
              }
              return (
                <View
                  style={[
                    styles.iconContainer,
                    { width: iconSize, height: iconSize },
                  ]}
                >
                  <Ionicons
                    name="home-outline"
                    size={iconSize}
                    color="#432014"
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="(board)"
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabBarLabel,
                  {
                    color: "#432014",
                    fontWeight: focused ? "700" : "400",
                  },
                ]}
              >
                메모리보드
              </Text>
            ),
            tabBarIcon: ({ focused }) => {
              const iconSize = focused ? 28 : 24;
              return (
                <View
                  style={[
                    styles.iconContainer,
                    { width: iconSize, height: iconSize },
                  ]}
                >
                  <Ionicons
                    name={focused ? "map" : "map-outline"}
                    size={iconSize}
                    color={focused ? "#31170F" : "#432014"}
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="calendar"
          listeners={{
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                openLoginModal();
              }
            },
          }}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabBarLabel,
                  {
                    color: "#432014",
                    fontWeight: focused ? "700" : "400",
                  },
                ]}
              >
                캘린더
              </Text>
            ),
            tabBarIcon: ({ focused }) => {
              const iconSize = focused ? 28 : 24;
              return (
                <View
                  style={[
                    styles.iconContainer,
                    { width: iconSize, height: iconSize },
                  ]}
                >
                  <Ionicons
                    name={focused ? "calendar" : "calendar-outline"}
                    size={iconSize}
                    color={focused ? "#31170F" : "#432014"}
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="[username]"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              if (!isLoggedIn) {
                openLoginModal();
              } else {
                router.navigate(`/@${user.id}`);
              }
            },
          }}
          options={{
            tabBarLabel: ({ focused }) => {
              const isActive = focused && user?.id === pathname?.slice(2);
              return (
                <Text
                  style={[
                    styles.tabBarLabel,
                    {
                      color: "#432014",
                      fontWeight: isActive ? "700" : "400",
                    },
                  ]}
                >
                  마이
                </Text>
              );
            },
            tabBarIcon: ({ focused }) => {
              const isActive = focused && user?.id === pathname?.slice(2);
              const iconSize = isActive ? 28 : 24;
              return (
                <View
                  style={[
                    styles.iconContainer,
                    { width: iconSize, height: iconSize },
                  ]}
                >
                  <Ionicons
                    name={isActive ? "person" : "person-outline"}
                    size={iconSize}
                    color={isActive ? "#31170F" : "#432014"}
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="(calendar)"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="(post)/[username]/post/[postID]"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <Modal
        visible={isLoginModalOpen}
        transparent={true}
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View style={{ backgroundColor: "white", padding: 20 }}>
            <Pressable onPress={toLoginPage}>
              <Text>Login Modal</Text>
            </Pressable>
            <TouchableOpacity onPress={closeLoginModal}>
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: -0.24,
  },
  iconContainer: {
    width: 28,
    height: 28,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  iconLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: "100%",
    height: "100%",
  },
});
