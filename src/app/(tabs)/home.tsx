import { CardStack } from "@/components/Card/StackCards";
import data from "@/components/Card/data";
import { recentMemories } from "@/lib/data/dummy";
import { Ionicons } from "@expo/vector-icons";
import { NaverMapView } from "@mj-studio/react-native-naver-map";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
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
  ScrollView,
} from "react-native-gesture-handler";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
const imgCloseX = require("../../assets/svg/close.svg");
const imgImage = require("../../assets/svg/image.svg");
const imgCamera = require("../../assets/svg/camera.svg");

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
const _size = width * 0.7; // 카드 크기를 더 작게
const layout = {
  borderRadius: 20,
  width: _size,
  height: _size * 0.95, // 카드 높이 비율 조정 (거의 정사각형)
  spacing: 12,
  cardsGap: 6, // 스택 카드 간격을 더 좁게
};
const maxVisibleItems = 6;

const STACK_WIDGET_IMAGE =
  "http://localhost:3845/assets/69a05a5956c4c2cf24efac82f095dc013d5e1871.svg";

export default function Index() {
  /** ============================= state 영역 ============================= */
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const activeIndex = useSharedValue(0);

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  // 연인 정보 (임시로 하드코딩, 나중에 API에서 가져올 수 있음)
  const [partner, setPartner] = useState<{ name: string } | null>(null);
  // 기록된 장소가 있는지 여부 (더미 상태값)
  const isLocation = false; // true일 때 지도 표시

  const [mapCenter] = useState({
    latitude: 37.5665,
    longitude: 126.978,
  });

  // 최근 추억 데이터 (더미 상태값 - 빈 배열로 테스트 가능)
  const [memoriesData] = useState<typeof recentMemories>([]); // 빈 배열로 테스트

  // 저장된 카드 위치 불러오기
  useEffect(() => {
    AsyncStorage.getItem("@cardPosition").then((saved) => {
      if (saved) {
        const position = JSON.parse(saved);
        setCardPosition(position);
      }
    });
  }, []);

  /** ============================= API 영역 ============================= */

  /** ============================= 비즈니스 로직 영역 ============================= */
  const handleCloseBottomSheet = () => {
    setIsBottomSheetVisible(false);
  };

  const handleTakePhoto = () => {
    setIsBottomSheetVisible(true);
  };

  const handleSelectFromAlbum = () => {
    setIsBottomSheetVisible(false);
    setIsEditMode(true);
  };

  const handleSaveCardPosition = async (position: {
    top: number;
    left: number;
  }) => {
    // AsyncStorage에 먼저 저장
    await AsyncStorage.setItem("@cardPosition", JSON.stringify(position));
    // 상태 업데이트와 편집 모드 종료를 동시에 (상태가 업데이트되기 전에 편집 모드가 종료되지 않도록)
    setCardPosition(position);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // 취소 시 저장된 위치로 되돌림 (이미 저장된 위치가 있으면 그대로 유지)
  };

  const flingUp = Gesture.Fling()
    .direction(Directions.UP)
    .numberOfPointers(1)
    .enabled(!isEditMode)
    .onStart(() => {
      console.log("✅ Fling UP 감지!", activeIndex.value);
      const maxIndex = 4; // 최대 5개 (0~4)
      // 처음에서는 더 이상 이동하지 않음
      if (activeIndex.value > 0) {
        activeIndex.value = withTiming(activeIndex.value - 1, { duration });
      }
    });

  const flingDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .numberOfPointers(1)
    .enabled(!isEditMode)
    .onStart(() => {
      console.log("✅ Fling DOWN 감지!", activeIndex.value, data.length - 1);
      const maxIndex = 4; // 최대 5개 (0~4)
      // 마지막에서는 더 이상 이동하지 않음
      if (activeIndex.value < maxIndex) {
        activeIndex.value = withTiming(activeIndex.value + 1, { duration });
      }
    });

  /** ============================= 컴포넌트 영역 ============================= */

  /** ============================= useEffect 영역 ============================= */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { paddingTop: 0, paddingBottom: insets.bottom },
          colorScheme === "light"
            ? styles.containerLight
            : styles.containerDark,
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* D+0 카드 섹션 */}

          {/* 히어로 이미지 섹션 */}
          <View style={styles.heroSection}>
            <Image
              source={{ uri: HERO_IMAGE }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.heroOverlay} />

            {/* 카드 스택 영역 */}
            <GestureHandlerRootView
              style={[
                styles.stackCardsContainer2,
                styles.debugGestureContainer,
              ]}
            >
              <StatusBar hidden />

              {/* 연인 정보 및 초대 버튼 영역 (카드 스택 위에 두 줄로 배치) */}
              <View style={styles.heroHeaderContent}>
                {/* 첫 번째 줄: 연인 하트 컴포넌트 */}
                <View style={styles.heroPartnerInfo}>
                  <Text style={styles.heroPartnerName}>
                    {partner?.name || "해달"}
                  </Text>
                  <Ionicons
                    name="heart"
                    size={14}
                    color="#FF6638"
                    style={styles.heroHeartIcon}
                  />
                  <Text style={styles.heroPartnerLabel}>나의 연인</Text>
                </View>

                {/* 두 번째 줄: 연인을 초대해주세요 버튼 (연인이 연결되어 있으면 숨김) */}
                {!partner && (
                  <TouchableOpacity
                    style={styles.heroInviteButton}
                    onPress={() => router.push("/auth/invite")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.heroInviteButtonText}>
                      연인을 초대해주세요
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#6F605B"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <GestureDetector
                gesture={Gesture.Race(Gesture.Exclusive(flingUp, flingDown))}
              >
                <View style={[styles.cardStackWrapper]}>
                  {/* 카드 스택과 페이지네이션 */}
                  <CardStack
                    data={data}
                    activeIndex={activeIndex}
                    cardsGap={layout.cardsGap}
                    totalItems={5}
                    isEditMode={isEditMode}
                    savedPosition={cardPosition}
                    onSavePosition={handleSaveCardPosition}
                    onCancelEdit={handleCancelEdit}
                  />
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
                  함께한 장소들이{" "}
                  <Text style={styles.mapSubTitleHighlight}>여기</Text> 모여요
                </Text>
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color="#FF6638"
                  style={styles.mapSubTitleIcon}
                />
              </View>
              {/* 지도 또는 빈 상태 카드 */}
              {isLocation ? (
                <View style={styles.mapCard}>
                  <NaverMapView
                    style={StyleSheet.absoluteFillObject}
                    initialCamera={{
                      latitude: mapCenter.latitude,
                      longitude: mapCenter.longitude,
                      zoom: 15,
                    }}
                    isShowLocationButton={false}
                    isShowCompass={false}
                    isShowScaleBar={false}
                    isShowZoomControls={false}
                  />
                </View>
              ) : (
                <View style={styles.emptyMapCard}>
                  <Ionicons
                    name="location-outline"
                    size={40}
                    color="#A39892"
                    style={styles.emptyMapIcon}
                  />
                  <Text style={styles.emptyMapText}>
                    아직 기록된 장소가 없어요.
                  </Text>
                  <Text style={styles.emptyMapSubText}>
                    첫 추억을 남겨볼까요?
                  </Text>
                  <TouchableOpacity
                    style={styles.createAlbumButton}
                    onPress={() => router.push("/(tabs)/(board)")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.createAlbumButtonGradient}>
                      <Ionicons name="add" size={18} color="#FFFFFF" />
                      <Text style={styles.createAlbumButtonText}>
                        첫 앨범 만들기
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
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
                {memoriesData.length > 0
                  ? memoriesData.map((memory, index) => (
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
                    ))
                  : // 빈 상태: 이미지 컨테이너만 표시 (4개)
                    Array.from({ length: 4 }).map((_, index) => (
                      <View key={`empty-${index}`} style={styles.memoryCard}>
                        <View style={styles.memoryImageContainer} />
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
      {/* BottomSheet 모달 */}
      <Modal
        visible={isBottomSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseBottomSheet}
      >
        <Pressable
          style={styles.bottomSheetOverlay}
          onPress={handleCloseBottomSheet}
        >
          <Pressable
            style={[
              styles.bottomSheet,
              { paddingBottom: Math.max(insets.bottom + 24, 24) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>설정</Text>
              <TouchableOpacity
                style={styles.bottomSheetCloseButton}
                onPress={() => {
                  setIsBottomSheetVisible(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image
                  source={imgCloseX}
                  style={{
                    width: 12,
                    height: 12,
                  }}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.bottomSheetContent}>
              {/* 배경 이미지 변경 */}
              <TouchableOpacity
                onPress={handleTakePhoto}
                activeOpacity={0.7}
                style={styles.bottomSheetOption}
              >
                <View style={styles.bottomSheetOptionIcon}>
                  <Ionicons name="image-outline" size={24} color="#FF6638" />
                </View>
                <View style={styles.bottomSheetOptionTextContainer}>
                  <Text style={styles.bottomSheetOptionTitle}>
                    배경 이미지 변경
                  </Text>
                  <Text style={styles.bottomSheetOptionSubtitle}>
                    우리 사진으로 바꿔보세요.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 디데이 설정하기 */}
              <TouchableOpacity
                onPress={handleSelectFromAlbum}
                activeOpacity={0.7}
                style={styles.bottomSheetOption}
              >
                <View style={styles.bottomSheetOptionIcon}>
                  <Ionicons name="calendar-outline" size={24} color="#FF6638" />
                </View>
                <View style={styles.bottomSheetOptionTextContainer}>
                  <Text style={styles.bottomSheetOptionTitle}>
                    디데이 설정하기
                  </Text>
                  <Text style={styles.bottomSheetOptionSubtitle}>
                    다양한 디데이를 설정할 수 있어요.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </GestureHandlerRootView>
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
    paddingBottom: 96, // 탭바 높이(64) + marginBottom(32)
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FAF8F7",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  partnerName: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#31170F",
    letterSpacing: -0.32,
  },
  heartIcon: {
    marginHorizontal: 2,
  },
  partnerLabel: {
    fontFamily: "Pretendard Variable",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    color: "#6F605B",
    letterSpacing: -0.28,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  inviteButtonText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    color: "#6F605B",
    letterSpacing: -0.24,
  },
  settingsButtonHeader: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  dDayCardSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#FAF8F7",
  },
  dDayCard: {
    backgroundColor: "#FFF5F2",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dDayNumber: {
    fontFamily: "Pretendard",
    fontWeight: "700",
    fontSize: 48,
    lineHeight: 56,
    color: "#31170F",
    letterSpacing: -0.96,
    marginBottom: 4,
  },
  dDayLabel: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#6F605B",
    letterSpacing: -0.28,
  },
  heroSection: {
    height: 300,
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
  heroHeaderContent: {
    position: "absolute",
    top: 120,
    left: 15,
    right: 20,
    zIndex: 10,
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
  },
  heroPartnerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroPartnerName: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#FFFFFF",
    letterSpacing: -0.32,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroHeartIcon: {
    marginHorizontal: 2,
  },
  heroPartnerLabel: {
    fontFamily: "Pretendard Variable",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    letterSpacing: -0.28,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroInviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    alignSelf: "flex-start",
  },
  heroInviteButtonText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    color: "#6F605B",
    letterSpacing: -0.24,
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
    right: 20,
    bottom: 0,
    backgroundColor: "transparent", // 배경 투명하게
    padding: layout.spacing,
    zIndex: 5, // 이미지 위에 표시
  },
  cardStackWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 180,
    marginLeft: 0,
    width: "100%",
    minHeight: 50,
    position: "relative",
  },
  debugGestureContainer: {
    // 디버깅용: 제스처 영역 시각화를 위한 추가 스타일
    // backgroundColor: "rgba(255, 255, 0, 0.1)", // 노란색 반투명 (제스처 컨테이너 영역)
  },
  debugTouchArea: {
    // 디버깅용: 터치 영역 시각화 (빨간색 반투명 배경)
    // backgroundColor: "rgba(255, 0, 0, 0.3)",
    // borderWidth: 3,
    // borderColor: "rgba(255, 0, 0, 0.8)",
    // borderStyle: "dashed",
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
    marginBottom: 12,
  },
  mapSubTitle: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#6F605B",
    letterSpacing: -0.28,
  },
  mapSubTitleHighlight: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    color: "#FF6638",
  },
  mapSubTitleIcon: {
    marginLeft: 2,
  },
  mapCard: {
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F5F1ED",
  },
  emptyMapCard: {
    backgroundColor: "#F5F1ED",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 190,
    maxHeight: 190,
  },
  emptyMapIcon: {
    marginBottom: 12,
  },
  emptyMapText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#6F605B",
    letterSpacing: -0.32,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyMapSubText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    color: "#A39892",
    letterSpacing: -0.28,
    marginBottom: 16,
    textAlign: "center",
  },
  createAlbumButton: {
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
    maxWidth: 240,
  },
  createAlbumButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 6,
    backgroundColor: "#FF6638",
  },
  createAlbumButtonText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
    letterSpacing: -0.3,
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
    width: 88,
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

  // BottomSheet Styles
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.18,
    shadowRadius: 75,
    elevation: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: "100%",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.36,
    lineHeight: 24,
  },
  bottomSheetCloseButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  bottomSheetCloseIcon: {
    width: 16,
    height: 16,
  },
  bottomSheetContent: {
    flexDirection: "column",
    gap: 24,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  bottomSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bottomSheetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F2",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetOptionTextContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
  bottomSheetOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
    lineHeight: 22,
  },
  bottomSheetOptionSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#737373",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
});
