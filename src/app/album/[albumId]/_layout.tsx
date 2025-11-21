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
import {
  router,
  useLocalSearchParams,
  usePathname,
  withLayoutContext,
} from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 더미 데이터 (실제로는 API에서 가져와야 함)
const imgAlbumCover =
  "http://localhost:3845/assets/9b8974a5e686ef8741ef4f404e037c71632b80a3.png";
const imgAlbumCover1 =
  "http://localhost:3845/assets/82db08c3a962ddb03457b9f6dcc8c17bb49699fe.png";
const imgAlbumCover2 =
  "http://localhost:3845/assets/e4b7d81d22483211645f93f117300e35f95858ce.png";
const imgAlbumCover3 =
  "http://localhost:3845/assets/73b38b2f9233fe14405af7d470c20bf9e76485a6.png";
const imgAlbumCover4 =
  "http://localhost:3845/assets/cb226369901149124ebb988c25a4422d5d93b044.png";
const imgAlbumCover5 =
  "http://localhost:3845/assets/411e9c47c545866a29d7efcc67e3dc2c6a8feb8a.png";

interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
}

const albums: Record<string, Album> = {
  "1": {
    id: "1",
    title: "슈퍼 잼민이",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover,
  },
  "2": {
    id: "2",
    title: "해달 생일 🎂",
    description: "수달 님이 앨범을 생성했어요.",
    coverImage: imgAlbumCover1,
  },
  "3": {
    id: "3",
    title: "청도 글램핑",
    description: "해달 님이 장소를 추가했어요.",
    coverImage: imgAlbumCover2,
  },
  "4": {
    id: "4",
    title: "한강 산책만 3번째",
    description: "해달 님이 장소를 추가했어요.",
    coverImage: imgAlbumCover3,
  },
  "5": {
    id: "5",
    title: "슈퍼 잼민이",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover4,
  },
  "6": {
    id: "6",
    title: "타코야끼 원정대!",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover5,
  },
  "7": {
    id: "7",
    title: "여름 바다",
    description: "수달 님이 앨범을 생성했어요.",
    coverImage: imgAlbumCover,
  },
  "8": {
    id: "8",
    title: "강릉 여행",
    description: "해달 님이 장소를 추가했어요.",
    coverImage: imgAlbumCover1,
  },
  "9": {
    id: "9",
    title: "산 정상 정복",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover2,
  },
  "10": {
    id: "10",
    title: "카페 투어",
    description: "해달 님이 장소를 추가했어요.",
    coverImage: imgAlbumCover3,
  },
  "11": {
    id: "11",
    title: "야경 산책",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover4,
  },
  "12": {
    id: "12",
    title: "디저트 맛집 탐방",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover5,
  },
};

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function AlbumDetailLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { albumId } = useLocalSearchParams();
  const album = albums[albumId as string];
  const pathname = usePathname();

  // 현재 활성 탭 확인
  const isTimelineActive = pathname?.includes("/map") === false;
  const initialRouteName = isTimelineActive ? "index" : "map";

  const handleTabPress = (tabName: "timeline" | "map") => {
    if (tabName === "timeline") {
      router.replace(`/album/${albumId}`);
    } else if (tabName === "map") {
      router.replace(`/album/${albumId}/map`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: insets.top + 51,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#31170F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{album?.title || ""}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 탭바 */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, isTimelineActive && styles.tabActive]}
            onPress={() => handleTabPress("timeline")}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, isTimelineActive && styles.tabTextActive]}
            >
              타임라인
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isTimelineActive && styles.tabActive]}
            onPress={() => handleTabPress("map")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                !isTimelineActive && styles.tabTextActive,
              ]}
            >
              지도
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Material Top Tabs (스크롤 비활성화) */}
      <View style={styles.tabsContainer}>
        <MaterialTopTabs
          initialRouteName={initialRouteName}
          screenOptions={{
            swipeEnabled: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        >
          <MaterialTopTabs.Screen
            name="index"
            options={{ title: "타임라인" }}
          />
          <MaterialTopTabs.Screen name="map" options={{ title: "지도" }} />
        </MaterialTopTabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  headerButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#31170F",
    letterSpacing: -0.36,
  },
  headerRight: {
    width: 24,
    height: 24,
  },
  tabBarContainer: {
    backgroundColor: "#FAF9FA",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  tabBar: {
    flexDirection: "row",
    height: 40,
    backgroundColor: "#F5F0EB",
    borderRadius: 12,
    padding: 3,
    gap: 0,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    minHeight: 34,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#31170F",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  tabsContainer: {
    flex: 1,
  },
});
