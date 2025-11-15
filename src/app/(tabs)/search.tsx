import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useContext, useState } from "react";
import {
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthContext } from "../_layout";

// 임시 이미지 URL (실제로는 Figma에서 받은 이미지 URL을 사용하거나 로컬 에셋 사용)
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop";
const MAP_IMAGE =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop";
const PROFILE_IMAGE_1 =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop";
const PROFILE_IMAGE_2 =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";

interface RecentMemory {
  id: string;
  title: string;
  description: string;
  profileImages: string[];
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
  const screenHeight = Dimensions.get("window").height;

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
      description: "수달 님이 앨범에 캡션을 남겼어요.",
      profileImages: [PROFILE_IMAGE_1, PROFILE_IMAGE_2],
    },
    {
      id: "2",
      title: "해달 생일 🎂",
      description: "수달 님이 앨범을 생성했어요.",
      profileImages: [PROFILE_IMAGE_2],
    },
    {
      id: "3",
      title: "청도 글램핑",
      description: "해달 님이 장소를 추가했어요.",
      profileImages: [PROFILE_IMAGE_1, PROFILE_IMAGE_2],
    },
  ];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      // ScrollView와의 충돌 방지를 위해 false 반환
      return false;
    },
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // 세로 스와이프가 가로 스와이프보다 크고, 충분히 움직였을 때만 처리
      // ScrollView 스크롤과 구분하기 위해 더 엄격한 조건
      return (
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        Math.abs(gestureState.dy) > 15 &&
        Math.abs(gestureState.dx) < 30
      );
    },
    onPanResponderTerminationRequest: () => {
      // ScrollView가 제스처를 가져가려 할 때 허용
      return true;
    },
    onPanResponderGrant: () => {
      // 제스처 시작 시 현재 인덱스 동기화
      currentIndex.value = currentDDayIndex;
      translateY.value = 0;
    },
    onPanResponderMove: (_, gestureState) => {
      // 스와이프 중 실시간 애니메이션
      // 카드 높이(78px)를 기준으로 정규화
      const cardHeight = 78;
      translateY.value = gestureState.dy;
    },
    onPanResponderRelease: (_, gestureState) => {
      const threshold = 50;
      const velocity = gestureState.vy;
      const cardHeight = 78;

      let newIndex = currentDDayIndex;

      if (Math.abs(gestureState.dy) > threshold || Math.abs(velocity) > 0.5) {
        if (gestureState.dy > 0 && currentDDayIndex > 0) {
          // 아래로 스와이프 - 이전 카드
          newIndex = currentDDayIndex - 1;
        } else if (
          gestureState.dy < 0 &&
          currentDDayIndex < dDayCards.length - 1
        ) {
          // 위로 스와이프 - 다음 카드
          newIndex = currentDDayIndex + 1;
        }
      }

      // 인덱스가 변경되면 애니메이션으로 전환
      if (newIndex !== currentDDayIndex) {
        currentIndex.value = withSpring(newIndex, {
          damping: 20,
          stiffness: 100,
        });
        setCurrentDDayIndex(newIndex);
      }

      // 스프링 애니메이션으로 원래 위치로 복귀
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 100,
      });
    },
  });

  // 각 카드의 애니메이션 스타일 (컴포넌트 최상위에서 호출)
  const card0Style = useAnimatedStyle(() => {
    const cardHeight = 78;
    const offset = 0 - currentIndex.value;
    const baseTranslateY = offset * cardHeight;
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    // 현재 카드이거나 스와이프 중에만 보이도록
    const isCurrentCard = offset === 0;
    const isSwipeActive = Math.abs(swipeOffset) > 5;
    const isNextCard = offset === -1 && swipeOffset < 0;
    const isPrevCard = offset === 1 && swipeOffset > 0;
    const shouldShow =
      isCurrentCard || (isSwipeActive && (isNextCard || isPrevCard));
    const opacity = shouldShow ? 1 : 0;
    return {
      opacity,
      transform: [{ translateY: totalOffset }],
      zIndex: dDayCards.length - Math.abs(offset),
    };
  });

  const card1Style = useAnimatedStyle(() => {
    const cardHeight = 78;
    const offset = 1 - currentIndex.value;
    const baseTranslateY = offset * cardHeight;
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const isCurrentCard = offset === 0;
    const isSwipeActive = Math.abs(swipeOffset) > 5;
    const isNextCard = offset === -1 && swipeOffset < 0;
    const isPrevCard = offset === 1 && swipeOffset > 0;
    const shouldShow =
      isCurrentCard || (isSwipeActive && (isNextCard || isPrevCard));
    const opacity = shouldShow ? 1 : 0;
    return {
      opacity,
      transform: [{ translateY: totalOffset }],
      zIndex: dDayCards.length - Math.abs(offset),
    };
  });

  const card2Style = useAnimatedStyle(() => {
    const cardHeight = 78;
    const offset = 2 - currentIndex.value;
    const baseTranslateY = offset * cardHeight;
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const isCurrentCard = offset === 0;
    const isSwipeActive = Math.abs(swipeOffset) > 5;
    const isNextCard = offset === -1 && swipeOffset < 0;
    const isPrevCard = offset === 1 && swipeOffset > 0;
    const shouldShow =
      isCurrentCard || (isSwipeActive && (isNextCard || isPrevCard));
    const opacity = shouldShow ? 1 : 0;
    return {
      opacity,
      transform: [{ translateY: totalOffset }],
      zIndex: dDayCards.length - Math.abs(offset),
    };
  });

  const card3Style = useAnimatedStyle(() => {
    const cardHeight = 78;
    const offset = 3 - currentIndex.value;
    const baseTranslateY = offset * cardHeight;
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const isCurrentCard = offset === 0;
    const isSwipeActive = Math.abs(swipeOffset) > 5;
    const isNextCard = offset === -1 && swipeOffset < 0;
    const isPrevCard = offset === 1 && swipeOffset > 0;
    const shouldShow =
      isCurrentCard || (isSwipeActive && (isNextCard || isPrevCard));
    const opacity = shouldShow ? 1 : 0;
    return {
      opacity,
      transform: [{ translateY: totalOffset }],
      zIndex: dDayCards.length - Math.abs(offset),
    };
  });

  const card4Style = useAnimatedStyle(() => {
    const cardHeight = 78;
    const offset = 4 - currentIndex.value;
    const baseTranslateY = offset * cardHeight;
    const swipeOffset = translateY.value;
    const totalOffset = baseTranslateY + swipeOffset;
    const isCurrentCard = offset === 0;
    const isSwipeActive = Math.abs(swipeOffset) > 5;
    const isNextCard = offset === -1 && swipeOffset < 0;
    const isPrevCard = offset === 1 && swipeOffset > 0;
    const shouldShow =
      isCurrentCard || (isSwipeActive && (isNextCard || isPrevCard));
    const opacity = shouldShow ? 1 : 0;
    return {
      opacity,
      transform: [{ translateY: totalOffset }],
      zIndex: dDayCards.length - Math.abs(offset),
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
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: 0, paddingBottom: insets.bottom },
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
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
          <View style={styles.heroContent}>
            <View
              style={styles.dDayStackContainer}
              {...panResponder.panHandlers}
            >
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
            </View>
          </View>
        </View>

        {/* 메인 컨텐츠 영역 */}
        <View style={styles.mainContent}>
          {/* 추억 지도 섹션 */}
          <View style={styles.memoryMapCard}>
            <View style={styles.memoryMapHeader}>
              <Text style={styles.memoryMapTitle}>우리의 추억 지도</Text>
              <Ionicons name="chevron-forward" size={16} color="#737373" />
            </View>
            <View style={styles.mapContainer}>
              <Image
                source={{ uri: MAP_IMAGE }}
                style={styles.mapImage}
                contentFit="cover"
              />
              {/* 지도 마커들 */}
              <View style={styles.mapMarker1} />
              <View style={styles.mapMarker2} />
              <View style={styles.mapMarker3} />
              <View style={styles.mapMarker4} />
            </View>
          </View>

          {/* 최근 추억 섹션 */}
          <View style={styles.recentMemoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 추억</Text>
              <Text style={styles.moreLink}>더보기</Text>
            </View>
            <View style={styles.memoriesList}>
              {recentMemories.map((memory) => (
                <View key={memory.id} style={styles.memoryItem}>
                  <View style={styles.memoryItemLeft}>
                    <View style={styles.memoryThumbnail} />
                    <View style={styles.memoryInfo}>
                      <Text style={styles.memoryTitle}>{memory.title}</Text>
                      <Text style={styles.memoryDescription}>
                        {memory.description}
                      </Text>
                      <View style={styles.profileGroup}>
                        {memory.profileImages.map((img, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.profileImage,
                              idx > 0 && styles.profileImageOverlap,
                            ]}
                          >
                            <Image
                              source={{ uri: img }}
                              style={styles.profileImageInner}
                              contentFit="cover"
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={styles.memoryItemRight}>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#737373"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 다가오는 이벤트 섹션 */}
          <View style={styles.eventCard}>
            <Text style={styles.eventLabel}>다가오는 이벤트</Text>
            <View style={styles.eventContent}>
              <View style={styles.eventLeft}>
                <Text style={styles.eventTitle}>수달 생일 🎂</Text>
                <Text style={styles.eventDate}>2025.11.01</Text>
              </View>
              <Text style={styles.eventCountdown}>D-40</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#ffffff",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    height: 205,
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
    overflow: "visible",
  },
  dDayCardWrapper: {
    position: "absolute",
    minWidth: 142,
    height: 78,
    left: 0,
    top: 0,
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
    backgroundColor: "#ffffff",
  },
  mainContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 24,
    paddingHorizontal: 16,
    minHeight: 833,
  },
  memoryMapCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4.7,
    elevation: 2,
  },
  memoryMapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
    width: 18,
    height: 22,
    backgroundColor: "#FF8D28",
    borderRadius: 9,
    transform: [{ translateX: -9 }, { translateY: -11 }],
  },
  mapMarker2: {
    position: "absolute",
    left: "55%",
    top: "35%",
    width: 18,
    height: 22,
    backgroundColor: "#FF8D28",
    borderRadius: 9,
    transform: [{ translateX: -9 }, { translateY: -11 }],
  },
  mapMarker3: {
    position: "absolute",
    left: "80%",
    top: "70%",
    width: 18,
    height: 22,
    backgroundColor: "#FF8D28",
    borderRadius: 9,
    transform: [{ translateX: -9 }, { translateY: -11 }],
  },
  mapMarker4: {
    position: "absolute",
    left: "85%",
    top: "25%",
    width: 18,
    height: 22,
    backgroundColor: "#FF8D28",
    borderRadius: 9,
    transform: [{ translateX: -9 }, { translateY: -11 }],
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
    gap: 8,
  },
  memoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  memoryItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  memoryThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#BDBDBD",
  },
  memoryInfo: {
    flex: 1,
    gap: 8,
  },
  memoryTitle: {
    fontFamily: "Pretendard",
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 24,
    color: "#040404",
    letterSpacing: -0.32,
  },
  memoryDescription: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#A3A3A3",
    letterSpacing: -0.28,
  },
  profileGroup: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ffffff",
    overflow: "hidden",
    marginLeft: -6,
  },
  profileImageOverlap: {
    zIndex: 1,
  },
  profileImageInner: {
    width: "100%",
    height: "100%",
  },
  memoryItemRight: {
    padding: 6,
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
