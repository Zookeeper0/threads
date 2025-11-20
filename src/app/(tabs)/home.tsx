import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";

// 임시 이미지 URL (실제로는 Figma에서 받은 이미지 URL을 사용하거나 로컬 에셋 사용)
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop";
const MAP_IMAGE =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop";

interface RecentMemory {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
}

interface DDayCard {
  id: string;
  days: number;
  label: string;
}

const STACK_WIDGET_IMAGE =
  "http://localhost:3845/assets/69a05a5956c4c2cf24efac82f095dc013d5e1871.svg";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const [currentDDayIndex, setCurrentDDayIndex] = useState(0);
  const translateY = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const CARD_HEIGHT = 78;
  const CARD_SPACING = 2;

  const dDayCards: DDayCard[] = [
    {
      id: "1",
      days: 1234,
      label: "우리가 함께한 시간",
    },
    {
      id: "2",
      days: 1000,
      label: "첫 만남부터",
    },
    {
      id: "3",
      days: 500,
      label: "데이트 시작",
    },
    {
      id: "4",
      days: 365,
      label: "1주년",
    },
    {
      id: "5",
      days: 100,
      label: "최근 기념일",
    },
  ];

  const recentMemories: RecentMemory[] = [
    {
      id: "1",
      title: "슈퍼 잼민이",
      date: "3일 전",
      imageUrl:
        "http://localhost:3845/assets/9b8974a5e686ef8741ef4f404e037c71632b80a3.png",
    },
    {
      id: "2",
      title: "해달 생일 🎂",
      date: "3일 전",
      imageUrl:
        "http://localhost:3845/assets/82db08c3a962ddb03457b9f6dcc8c17bb49699fe.png",
    },
    {
      id: "3",
      title: "청도 글램핑",
      date: "2주 전",
      imageUrl:
        "http://localhost:3845/assets/e4b7d81d22483211645f93f117300e35f95858ce.png",
    },
    {
      id: "4",
      title: "한강 산책면",
      date: "한달전",
      imageUrl:
        "http://localhost:3845/assets/73b38b2f9233fe14405af7d470c20bf9e76485a6.png",
    },
  ];

  // 인덱스 변경 함수
  const updateIndex = (newIndex: number) => {
    if (newIndex !== currentDDayIndex) {
      setCurrentDDayIndex(newIndex);
    }
  };

  // currentIndex를 currentDDayIndex와 동기화
  useEffect(() => {
    currentIndex.value = currentDDayIndex;
  }, [currentDDayIndex, currentIndex]);

  // 제스처 핸들러
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10]) // 세로 스와이프만 활성화
        .failOffsetX([-30, 30]) // 가로 스와이프는 무시 (ScrollView가 처리)
        .onStart(() => {
          // 제스처 시작 시 현재 인덱스를 shared value에 동기화
          translateY.value = 0;
        })
        .onUpdate((event) => {
          // 세로 스와이프만 처리
          translateY.value = event.translationY;
        })
        .onEnd((event) => {
          const threshold = 30;
          const velocity = event.velocityY;

          // 현재 인덱스를 shared value에서 가져옴
          const currentIdx = Math.round(currentIndex.value);
          let newIndex = currentIdx;

          // 스와이프 거리나 속도가 임계값을 넘으면 인덱스 변경
          if (
            Math.abs(event.translationY) > threshold ||
            Math.abs(velocity) > 500
          ) {
            if (event.translationY > 0 && currentIdx > 0) {
              // 아래로 스와이프 - 이전 카드
              newIndex = currentIdx - 1;
            } else if (
              event.translationY < 0 &&
              currentIdx < dDayCards.length - 1
            ) {
              // 위로 스와이프 - 다음 카드
              newIndex = currentIdx + 1;
            }
          }

          // 인덱스 변경 애니메이션
          currentIndex.value = withSpring(newIndex, {
            damping: 20,
            stiffness: 100,
          });

          // translateY를 0으로 리셋
          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 100,
          });

          // JS 스레드에서 상태 업데이트
          if (newIndex !== currentIdx) {
            runOnJS(updateIndex)(newIndex);
          }
        }),
    [dDayCards.length]
  );

  // 각 카드의 애니메이션 스타일 (컴포넌트 최상위에서 호출)
  const card0Style = useAnimatedStyle(() => {
    const offset = 0 - currentIndex.value;
    const baseTranslateY = offset * (CARD_HEIGHT + CARD_SPACING);
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const distance = Math.abs(offset);
    const opacity = distance <= 1 ? 1 : 0;
    const scale = interpolate(
      distance,
      [0, 1, 2],
      [1, 0.95, 0.9],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: totalOffset }, { scale }],
    };
  });

  const card1Style = useAnimatedStyle(() => {
    const offset = 1 - currentIndex.value;
    const baseTranslateY = offset * (CARD_HEIGHT + CARD_SPACING);
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const distance = Math.abs(offset);
    const opacity = distance <= 1 ? 1 : 0;
    const scale = interpolate(
      distance,
      [0, 1, 2],
      [1, 0.95, 0.9],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: totalOffset }, { scale }],
    };
  });

  const card2Style = useAnimatedStyle(() => {
    const offset = 2 - currentIndex.value;
    const baseTranslateY = offset * (CARD_HEIGHT + CARD_SPACING);
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const distance = Math.abs(offset);
    const opacity = distance <= 1 ? 1 : 0;
    const scale = interpolate(
      distance,
      [0, 1, 2],
      [1, 0.95, 0.9],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: totalOffset }, { scale }],
    };
  });

  const card3Style = useAnimatedStyle(() => {
    const offset = 3 - currentIndex.value;
    const baseTranslateY = offset * (CARD_HEIGHT + CARD_SPACING);
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const distance = Math.abs(offset);
    const opacity = distance <= 1 ? 1 : 0;
    const scale = interpolate(
      distance,
      [0, 1, 2],
      [1, 0.95, 0.9],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: totalOffset }, { scale }],
    };
  });

  const card4Style = useAnimatedStyle(() => {
    const offset = 4 - currentIndex.value;
    const baseTranslateY = offset * (CARD_HEIGHT + CARD_SPACING);
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const distance = Math.abs(offset);
    const opacity = distance <= 1 ? 1 : 0;
    const scale = interpolate(
      distance,
      [0, 1, 2],
      [1, 0.95, 0.9],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: totalOffset }, { scale }],
    };
  });

  const cardStyles = [
    card0Style,
    card1Style,
    card2Style,
    card3Style,
    card4Style,
  ];

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
          <View style={styles.heroContent}>
            <GestureHandlerRootView style={styles.dDayStackContainer}>
              <GestureDetector gesture={panGesture}>
                <View style={styles.dDayStackWrapper}>
                  {dDayCards.map((card, index) => (
                    <Animated.View
                      key={card.id}
                      style={[styles.dDayCardWrapper, cardStyles[index]]}
                    >
                      <View style={styles.counterCard}>
                        <Text style={styles.counterNumber}>D+{card.days}</Text>
                        <Text style={styles.counterLabel}>{card.label}</Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </GestureDetector>
              <View style={styles.stackWidgetContainer}>
                <View style={styles.stackWidget}>
                  <Image
                    source={{ uri: STACK_WIDGET_IMAGE }}
                    style={styles.stackWidgetImage}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.paginationDots}>
                  {dDayCards.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentDDayIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </GestureHandlerRootView>
          </View>
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
    overflow: "hidden",
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
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 25,
    paddingBottom: 40,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
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
