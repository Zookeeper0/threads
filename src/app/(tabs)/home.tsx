import Card from "@/components/Card/StackCards";
import data from "@/components/Card/data";
import { recentMemories } from "@/lib/data/dummy";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";

// 임시 이미지 URL (실제로는 Figma에서 받은 이미지 URL을 사용하거나 로컬 에셋 사용)
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop";
const MAP_IMAGE =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop";

const colors = {
  primary: "#6667AB",
  light: "#fff",
  dark: "#111",
};

interface DDayCard {
  id: string;
  days: number;
  label: string;
}
const { width } = Dimensions.get("window");

const duration = 600;
const _size = width * 0.9;
const layout = {
  borderRadius: 16,
  width: _size,
  height: _size * 1.27,
  spacing: 12,
  cardsGap: 22,
};
const maxVisibleItems = 6;

const STACK_WIDGET_IMAGE =
  "http://localhost:3845/assets/69a05a5956c4c2cf24efac82f095dc013d5e1871.svg";

export default function Index() {
  /** ============================= state 영역 ============================= */
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();

  const activeIndex = useSharedValue(0);
  /** ============================= API 영역 ============================= */

  /** ============================= 비즈니스 로직 영역 ============================= */

  const flingUp = Gesture.Fling()
    .direction(Directions.UP)
    .onStart(() => {
      if (activeIndex.value === 0) {
        return;
      }

      activeIndex.value = withTiming(activeIndex.value - 1, { duration });
    });

  const flingDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .onStart(() => {
      if (activeIndex.value === data.length) {
        return;
      }

      activeIndex.value = withTiming(activeIndex.value + 1, { duration });
    });

  // 디버깅용: 터치 감지 확인
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      console.log("✅ Tap 감지됨 - 제스처 영역 내 터치 확인!");
    })
    .onEnd(() => {
      console.log("✅ Tap 종료");
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      console.log("✅ Pan started - 드래그 시작 감지!");
      if (activeIndex.value === 0) {
        return;
      }

      activeIndex.value = withTiming(activeIndex.value - 1, { duration });
    })
    .onUpdate((e) => {
      console.log(`✅ Pan update - Y 이동: ${e.translationY.toFixed(2)}`);
    })
    .onEnd(() => {
      console.log("✅ Pan ended - 드래그 종료");
    });

  /** ============================= 컴포넌트 영역 ============================= */

  /** ============================= useEffect 영역 ============================= */
  return (
    <View
      style={[
        styles.container,
        { paddingTop: 0, paddingBottom: insets.bottom },
        colorScheme === "light" ? styles.containerLight : styles.containerDark,
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로 이미지 섹션 */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: HERO_IMAGE }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          {/* 설정 아이콘 */}
          <TouchableOpacity
            style={[styles.settingsButton, { top: insets.top + 16 }]}
            onPress={() => router.push("/settings")}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* 카드 스택 영역 */}
          <GestureHandlerRootView
            style={[styles.stackCardsContainer2, styles.debugGestureContainer]}
          >
            <StatusBar hidden />
            <GestureDetector
              gesture={Gesture.Race(
                tapGesture,
                panGesture,
                Gesture.Exclusive(flingUp, flingDown)
              )}
            >
              <View
                style={[
                  {
                    alignItems: "center",
                    flex: 1,
                    justifyContent: "flex-end",
                    marginBottom: layout.cardsGap * 2,
                    width: "100%",
                    minHeight: 200, // 최소 높이 보장
                    position: "relative", // 카드들이 absolute로 겹치도록
                  },
                  styles.debugTouchArea, // 디버깅용: 터치 영역 시각화
                ]}
                pointerEvents="box-none"
              >
                {data.map((c, index) => {
                  return (
                    <Card
                      info={c}
                      key={c.id}
                      index={index}
                      totalLength={data.length - 1}
                      activeIndex={activeIndex}
                      cardsGap={layout.cardsGap}
                    />
                  );
                })}
              </View>
            </GestureDetector>
          </GestureHandlerRootView>
        </View>

        {/* 메인 컨텐츠 영역 */}
        <View style={styles.mainContent}>
          {/* 추억 지도 섹션 */}
          <View style={styles.memoryMapCard}>
            <View style={styles.memoryMapHeader}>
              <Text style={styles.memoryMapTitle}>우리의 추억 지도</Text>
              <Ionicons name="chevron-forward" size={24} color="#31170F" />
            </View>
            <View style={styles.mapSubTitleContainer}>
              <Text style={styles.mapSubTitle}>
                <Text style={styles.mapSubTitleText}>함께한 장소</Text>{" "}
                <Text style={styles.mapSubTitleBold}>8</Text>곳
              </Text>
              <Ionicons name="location" size={14} color="#FF7347" />
            </View>
            <View style={styles.mapContainer}>
              <Image
                source={{ uri: MAP_IMAGE }}
                style={styles.mapImage}
                contentFit="cover"
              />
              {/* 지도 마커들 */}
              <View style={styles.mapMarker1}>
                <View style={styles.mapMarkerOuter} />
                <View style={styles.mapMarkerInner} />
              </View>
              <View style={styles.mapMarker2}>
                <View style={styles.mapMarkerOuter} />
                <View style={styles.mapMarkerInner} />
              </View>
              <View style={styles.mapMarker3}>
                <View style={styles.mapMarkerOuter} />
                <View style={styles.mapMarkerInner} />
              </View>
              <View style={styles.mapMarker4}>
                <View style={styles.mapMarkerOuter} />
                <View style={styles.mapMarkerInner} />
              </View>
              <View style={styles.mapMarker5}>
                <View style={styles.mapMarkerOuter} />
                <View style={styles.mapMarkerInner} />
              </View>
            </View>
          </View>

          {/* 최근 추억 섹션 */}
          <View style={styles.recentMemoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 추억</Text>
              <Text style={styles.moreLink}>더보기</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.memoriesList}
            >
              {recentMemories.map((memory, index) => (
                <View key={memory.id} style={styles.memoryCard}>
                  <View style={styles.memoryImageContainer}>
                    <Image
                      source={{ uri: memory.imageUrl }}
                      style={styles.memoryImage}
                      contentFit="cover"
                    />
                  </View>
                  <Text
                    style={[
                      styles.memoryCardTitle,
                      index === 0 && styles.memoryCardTitleFirst,
                    ]}
                  >
                    {memory.title}
                  </Text>
                  <Text style={styles.memoryCardDate}>{memory.date}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 다가오는 이벤트 섹션 */}
          {/* <View style={styles.eventCard}>
            <Text style={styles.eventLabel}>다가오는 이벤트</Text>
            <View style={styles.eventContent}>
              <View style={styles.eventLeft}>
                <Text style={styles.eventTitle}>수달 생일 🎂</Text>
                <Text style={styles.eventDate}>2025.11.01</Text>
              </View>
              <Text style={styles.eventCountdown}>D-40</Text>
            </View>
          </View> */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FAF8F7",
  },
  containerDark: {
    backgroundColor: "#FAF8F7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    //   paddingBottom: 96, // 탭바 높이(64) + marginBottom(32)
  },
  heroSection: {
    height: 215,
    width: "100%",
    position: "relative",
    overflow: "visible", // 디버깅용: 제스처 영역이 보이도록
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  settingsButton: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  stackCardsContainer1: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: colors.primary,
    padding: layout.spacing,
  },
  stackCardsContainer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent", // 배경 투명하게
    padding: layout.spacing,
    zIndex: 5, // 이미지 위에 표시
  },
  debugGestureContainer: {
    // 디버깅용: 제스처 영역 시각화를 위한 추가 스타일
    backgroundColor: "rgba(255, 255, 0, 0.1)", // 노란색 반투명 (제스처 컨테이너 영역)
  },
  debugTouchArea: {
    // 디버깅용: 터치 영역 시각화 (빨간색 반투명 배경)
    backgroundColor: "rgba(255, 0, 0, 0.3)",
    borderWidth: 3,
    borderColor: "rgba(255, 0, 0, 0.8)",
    borderStyle: "dashed",
  },
  dDayStackContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    width: "100%",
  },
  stackWidgetContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  dDayStackWrapper: {
    position: "relative",
    minWidth: 142,
    height: 78,
    overflow: "hidden",
  },
  dDayCardWrapper: {
    position: "absolute",
    minWidth: 142,
    height: 78,
    left: 0,
    top: 0,
    width: "100%",
  },
  counterCard: {
    backgroundColor: "rgba(119, 119, 119, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 142,
    height: 78,
    justifyContent: "center",
  },
  stackWidget: {
    width: 6,
    height: 59,
    justifyContent: "center",
    alignItems: "center",
  },
  stackWidgetImage: {
    width: 6,
    height: 59,
  },
  counterNumber: {
    fontFamily: "Pretendard",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 32,
    color: "#ffffff",
    letterSpacing: -0.48,
  },
  counterLabel: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: -0.24,
    marginTop: 4,
  },
  paginationDots: {
    flexDirection: "column",
    gap: 4,
    justifyContent: "center",
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dotActive: {
    backgroundColor: "#FAF8F7",
  },
  mainContent: {
    backgroundColor: "#FAF8F7",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -8,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  memoryMapCard: {
    backgroundColor: "#FAF8F7",
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 16,
  },
  memoryMapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mapSubTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  mapSubTitle: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#6F605B",
    letterSpacing: -0.28,
  },
  mapSubTitleText: {
    color: "#6F605B",
  },
  mapSubTitleBold: {
    fontFamily: "Pretendard Variable",
    fontWeight: "700",
    color: "#FF6638",
  },
  memoryMapTitle: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 20,
    color: "#040404",
    letterSpacing: -0.36,
  },
  mapContainer: {
    height: 165,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapMarker1: {
    position: "absolute",
    left: "30%",
    top: "65%",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  mapMarker2: {
    position: "absolute",
    left: "55%",
    top: "35%",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  mapMarker3: {
    position: "absolute",
    left: "80%",
    top: "70%",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  mapMarker4: {
    position: "absolute",
    left: "85%",
    top: "25%",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  mapMarker5: {
    position: "absolute",
    left: "50%",
    top: "45%",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  mapMarkerOuter: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  mapMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF7347",
  },
  recentMemoriesSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 20,
    color: "#040404",
    letterSpacing: -0.36,
  },
  moreLink: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#737373",
    letterSpacing: -0.28,
  },
  memoriesList: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  memoryCard: {
    alignItems: "center",
    gap: 8,
    width: 85,
  },
  memoryImageContainer: {
    width: 85,
    height: 85,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E8E3E0",
  },
  memoryImage: {
    width: "100%",
    height: "100%",
  },
  memoryCardTitle: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#31170F",
    textAlign: "center",
    letterSpacing: -0.28,
  },
  memoryCardTitleFirst: {
    color: "#432014",
  },
  memoryCardDate: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    color: "#A39892",
    textAlign: "center",
    letterSpacing: -0.24,
  },
  eventCard: {
    backgroundColor: "#E5E5E5",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  eventLabel: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#737373",
    letterSpacing: -0.28,
  },
  eventContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  eventLeft: {
    gap: 3,
  },
  eventTitle: {
    fontFamily: "Pretendard",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
    letterSpacing: -0.32,
  },
  eventDate: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#737373",
    letterSpacing: -0.28,
  },
  eventCountdown: {
    fontFamily: "Pretendard",
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 34,
    color: "#000000",
    letterSpacing: -0.56,
  },
});
