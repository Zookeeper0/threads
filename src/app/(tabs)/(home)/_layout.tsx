import { AuthContext } from "@/app/_layout";
import DateRecordModalFigma from "@/components/DateRecordModalFigma";
import SideMenu from "@/components/SideMenu";
import { Ionicons } from "@expo/vector-icons";
import {
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import type {
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { Slot, router, withLayoutContext } from "expo-router";
import { createContext, useContext, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export const AnimationContext = createContext<{
  pullDownPosition: SharedValue<number>;
}>({
  pullDownPosition: null as any,
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isDateRecordModalOpen, setIsDateRecordModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const pullDownPosition = useSharedValue(0);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${pullDownPosition.value}deg` }],
    };
  });
  console.log("user!!", user);

  return (
    <AnimationContext value={{ pullDownPosition }}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          colorScheme === "dark" ? styles.containerDark : styles.containerLight,
        ]}
      >
        <BlurView
          style={[
            styles.header,
            colorScheme === "dark" ? styles.headerDark : styles.headerLight,
          ]}
          intensity={colorScheme === "dark" ? 5 : 70}
        >
          {isLoggedIn && (
            <Pressable
              style={styles.menuButton}
              onPress={() => {
                setIsSideMenuOpen(true);
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={colorScheme === "dark" ? "gray" : "black"}
              />
            </Pressable>
          )}
          <SideMenu
            isVisible={isSideMenuOpen}
            onClose={() => setIsSideMenuOpen(false)}
          />
          <Animated.Image
            source={require("../../../assets/images/react-logo.png")}
            style={[styles.headerLogo, rotateStyle]}
          />
          {!isLoggedIn && (
            <TouchableOpacity
              style={[
                styles.loginButton,
                colorScheme === "dark"
                  ? styles.loginButtonDark
                  : styles.loginButtonLight,
              ]}
              onPress={() => {
                console.log("loginButton onPress");
                router.navigate(`/login`);
              }}
            >
              <Text
                style={
                  colorScheme === "dark"
                    ? styles.loginButtonTextDark
                    : styles.loginButtonTextLight
                }
              >
                로그인
              </Text>
            </TouchableOpacity>
          )}
        </BlurView>
        {isLoggedIn ? (
          <>
            {/* 데이트 기록하기 버튼 */}
            <View style={styles.dateRecordContainer}>
              <TouchableOpacity
                style={[
                  styles.dateRecordButton,
                  colorScheme === "dark"
                    ? styles.dateRecordButtonDark
                    : styles.dateRecordButtonLight,
                ]}
                onPress={() => {
                  console.log("데이트 기록하기 버튼 클릭");
                  setIsDateRecordModalOpen(true);
                }}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={colorScheme === "dark" ? "black" : "white"}
                  style={styles.dateRecordIcon}
                />
                <Text
                  style={[
                    styles.dateRecordText,
                    colorScheme === "dark"
                      ? styles.dateRecordTextDark
                      : styles.dateRecordTextLight,
                  ]}
                >
                  오늘 데이트 기록하기
                </Text>
              </TouchableOpacity>
            </View>

            <MaterialTopTabs
              screenOptions={{
                lazy: true,
                tabBarStyle: {
                  backgroundColor: colorScheme === "dark" ? "#101010" : "white",
                  shadowColor: "transparent",
                  position: "relative",
                },
                tabBarLabelStyle: {
                  fontSize: 16,
                  fontWeight: "bold",
                },
                tabBarPressColor: "transparent",
                tabBarActiveTintColor:
                  colorScheme === "dark" ? "white" : "#555",
                tabBarIndicatorStyle: {
                  backgroundColor: colorScheme === "dark" ? "white" : "black",
                  height: 1,
                },
                tabBarIndicatorContainerStyle: {
                  backgroundColor: colorScheme === "dark" ? "#aaa" : "#555",
                  position: "absolute",
                  top: 49,
                  height: 1,
                },
              }}
            >
              <MaterialTopTabs.Screen
                name="index"
                options={{ title: "For You" }}
              />
              <MaterialTopTabs.Screen
                name="following"
                options={{ title: "Following" }}
              />
            </MaterialTopTabs>

            {/* 데이트 기록 모달 */}
            <DateRecordModalFigma
              visible={isDateRecordModalOpen}
              onClose={() => setIsDateRecordModalOpen(false)}
            />
          </>
        ) : (
          <Slot />
        )}
      </View>
    </AnimationContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
  },
  headerLight: {
    backgroundColor: "white",
  },
  headerDark: {
    backgroundColor: "#101010",
  },
  menuButton: {
    position: "absolute",
    left: 16,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  loginButton: {
    padding: 8,
    borderRadius: 4,
    position: "absolute",
    right: 16,
  },
  loginButtonLight: {
    backgroundColor: "black",
  },
  loginButtonDark: {
    backgroundColor: "white",
  },
  loginButtonTextLight: {
    color: "white",
  },
  loginButtonTextDark: {
    color: "black",
  },
  dateRecordContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  dateRecordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateRecordButtonLight: {
    backgroundColor: "#E8E8E8",
  },
  dateRecordButtonDark: {
    backgroundColor: "#FF8FB1",
  },
  dateRecordIcon: {
    marginRight: 8,
  },
  dateRecordText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateRecordTextLight: {
    color: "white",
  },
  dateRecordTextDark: {
    color: "black",
  },
});
