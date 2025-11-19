import { Ionicons } from "@expo/vector-icons";
import { type BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { Tabs, usePathname, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
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

// SVG 아이콘 import
const TabHomeIcon = require("../../assets/svg/tab_home.svg");
const TabHomeActiveIcon = require("../../assets/svg/tab_home_active.svg");
const TabMapIcon = require("../../assets/svg/tab_map.svg");
const TabMapActiveIcon = require("../../assets/svg/tab_map_active.svg");
const TabCalendarIcon = require("../../assets/svg/tab_calendar.svg");
const TabCalendarActiveIcon = require("../../assets/svg/tab_calendar_active.svg");
const TabMyIcon = require("../../assets/svg/tab_my.svg");
const TabMyActiveIcon = require("../../assets/svg/tab_my_active.svg");

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
        {
          width: 59,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 0,
        },
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
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  console.log("pathname", pathname);
  console.log("segments", segments);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 메모리보드 화면일 때 탭바 숨기기
  // segments를 사용하여 더 정확하게 감지
  const isBoardScreen =
    pathname?.includes("(board)") ||
    pathname?.includes("/board") ||
    segments.some(
      (segment: string) => segment === "(board)" || segment === "board"
    );
  const translateY = useSharedValue(isBoardScreen ? 200 : 0);

  // 탭바 translateY 값을 일반 숫자로 변환 (애니메이션 적용을 위해)
  const [tabBarTranslateY, setTabBarTranslateY] = useState(
    isBoardScreen ? 200 : 0
  );
  const [tabBarOpacity, setTabBarOpacity] = useState(isBoardScreen ? 0 : 1);

  // 탭바 애니메이션
  useEffect(() => {
    // 아래에서 위로 올라오도록 음수에서 0으로
    const targetY = isBoardScreen ? -300 : 0;
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
        router.replace("/(tabs)/home");
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

  // 안드로이드 네비게이션 바에 따른 탭바 위치 계산
  const getTabBarMarginBottom = () => {
    if (isBoardScreen) return -300;

    // 기본 marginBottom
    const baseMarginBottom = 18;

    // 안드로이드에서 네비게이션 바가 있을 때 (insets.bottom이 0이거나 작은 값)
    if (Platform.OS === "android") {
      // insets.bottom이 0보다 크면 safe area를 반영
      // 안드로이드에서 네비게이션 바가 있으면 보통 insets.bottom이 0이지만,
      // 시스템 UI가 있으면 추가 여백이 필요할 수 있음
      if (insets.bottom > 0) {
        return baseMarginBottom + insets.bottom;
      }
      // 네비게이션 바가 있을 때는 추가 여백 필요 (일반적으로 16-24px)
      // 네비게이션 바가 없으면 기본값 사용
      return baseMarginBottom;
    }

    // iOS에서는 safe area를 반영
    return baseMarginBottom + Math.max(0, insets.bottom - 20);
  };

  // 탭바 중앙 정렬을 위한 left 값 계산
  const getTabBarLeft = () => {
    if (isBoardScreen) return 0;
    const screenWidth = Dimensions.get("window").width;
    const tabBarWidth = 330;
    return (screenWidth - tabBarWidth) / 2;
  };

  return (
    <>
      <Tabs
        backBehavior="history"
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: isBoardScreen ? "transparent" : "#FFFCF8",
              borderTopWidth: 0,
              elevation: isBoardScreen ? 0 : 20,
              shadowColor: "#E8E8E8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isBoardScreen ? 0 : 1,
              shadowRadius: 20,
              height: isBoardScreen ? 0 : 64,
              paddingBottom: isBoardScreen ? 0 : 9,
              paddingTop: isBoardScreen ? 0 : 9,
              paddingLeft: isBoardScreen ? 0 : 14,
              borderRadius: 9999,
              marginBottom: getTabBarMarginBottom(),
              width: isBoardScreen ? 0 : 330,
              position: "absolute",
              left: 0,
              right: 0,
              bottom: isBoardScreen ? -300 : tabBarTranslateY,
              opacity: isBoardScreen ? 0 : tabBarOpacity,
              overflow: "hidden",
              pointerEvents: isBoardScreen ? "none" : "auto",
              zIndex: isBoardScreen ? -999 : 1,
              gap: isBoardScreen ? 0 : 20,
              justifyContent: "space-between",
              alignSelf: "center" as const,
              marginHorizontal: isBoardScreen
                ? 0
                : (Dimensions.get("window").width - 330) / 2,
              boxShadow: "0px 4px 20px #e8e8e8",
            },
          ],
          tabBarButton: (props: any) => <AnimatedTabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="home"
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
                numberOfLines={1}
              >
                홈
              </Text>
            ),
            tabBarIcon: ({ focused }) => {
              const iconSize = 30;
              return (
                <View
                  style={[
                    styles.iconContainer,
                    focused && styles.iconContainerShadow,
                  ]}
                >
                  <Image
                    source={focused ? TabHomeActiveIcon : TabHomeIcon}
                    style={{ width: iconSize, height: iconSize }}
                    contentFit="contain"
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="(board)"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/(tabs)/(board)/album");
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
                numberOfLines={1}
              >
                메모리보드
              </Text>
            ),
            tabBarIcon: ({ focused }) => {
              const iconSize = 30;
              return (
                <View
                  style={[
                    styles.iconContainer,
                    focused && styles.iconContainerShadow,
                    {
                      position: "absolute",
                      left: 6,
                    },
                  ]}
                >
                  <Image
                    source={focused ? TabMapActiveIcon : TabMapIcon}
                    style={{ width: iconSize, height: iconSize }}
                    contentFit="contain"
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="calendar"
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
                numberOfLines={1}
              >
                캘린더
              </Text>
            ),
            tabBarIcon: ({ focused }) => {
              const iconSize = 30;
              return (
                <View
                  style={[
                    styles.iconContainer,
                    focused && styles.iconContainerShadow,
                  ]}
                >
                  <Image
                    source={focused ? TabCalendarActiveIcon : TabCalendarIcon}
                    style={{ width: iconSize, height: iconSize }}
                    contentFit="contain"
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="[username]"
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
                numberOfLines={1}
              >
                마이
              </Text>
            ),
            tabBarIcon: ({ focused }) => {
              const iconSize = 30;
              return (
                <View
                  style={[
                    styles.iconContainer,
                    focused && styles.iconContainerShadow,
                  ]}
                >
                  <Image
                    source={focused ? TabMyActiveIcon : TabMyIcon}
                    style={{ width: iconSize, height: iconSize }}
                    contentFit="contain"
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
    marginTop: 2,
    letterSpacing: -0.24,
    fontFamily: "Pretendard Variable",
    color: "#432014",
    lineHeight: 12,
    includeFontPadding: false,
  },
  iconContainer: {
    width: 30,
    height: 30,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  iconContainerShadow: {
    shadowColor: "rgba(109, 94, 77, 0.11)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.11,
    shadowRadius: 2,
    elevation: 2,
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
