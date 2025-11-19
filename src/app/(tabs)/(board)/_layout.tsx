import { Ionicons } from "@expo/vector-icons";
import { Slot, router, usePathname, useSegments } from "expo-router";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const segments = useSegments();

  // 기본 경로일 때 앨범 화면으로 리다이렉트
  useEffect(() => {
    // (board)의 기본 경로(index.tsx)일 때 앨범으로 리다이렉트
    const isBoardRoot =
      pathname === "/(tabs)/(board)" ||
      pathname === "/(tabs)/(board)/" ||
      (pathname?.includes("(board)") &&
        !pathname?.includes("/album") &&
        !pathname?.includes("/index") &&
        segments[segments.length - 1] !== "album");

    if (isBoardRoot) {
      router.replace("/(tabs)/(board)/album");
    }
  }, [pathname, segments]);

  // 현재 경로에 따라 지도/앨범 뷰 판단
  const isMapView = pathname?.includes("/album") === false;

  return (
    <View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* 화면 내용 */}
      <Slot />

      {/* 플로팅 헤더 */}
      <View
        style={[
          styles.floatingHeader,
          { top: insets.top + 16 },
          colorScheme === "dark" ? styles.headerDark : styles.headerLight,
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="chevron-back" size={20} color="#6A5A4A" />
          </View>
        </TouchableOpacity>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabItem, !isMapView && styles.tabItemActive]}
            onPress={() => {
              if (pathname?.includes("/album") === false) {
                router.replace("/(tabs)/(board)/album");
              }
            }}
          >
            <Text style={[styles.tabText, !isMapView && styles.tabTextActive]}>
              앨범
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, isMapView && styles.tabItemActive]}
            onPress={() => {
              if (pathname?.includes("/album")) {
                router.replace("/(tabs)/(board)");
              }
            }}
          >
            <Text style={[styles.tabText, isMapView && styles.tabTextActive]}>
              지도
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FAFAFA",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  floatingHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
  },
  headerLight: {
    backgroundColor: "transparent",
  },
  headerDark: {
    backgroundColor: "transparent",
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#FAEFDF",
    borderRadius: 100,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemActive: {
    backgroundColor: "#FF6638",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.11,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6F605B",
    letterSpacing: -0.7,
  },
  tabTextActive: {
    color: "white",
  },
  headerRight: {
    width: 36,
    height: 36,
  },
});
