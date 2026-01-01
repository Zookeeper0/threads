import { Ionicons } from "@expo/vector-icons";
import { NaverMapView } from "@mj-studio/react-native-naver-map";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Figma에서 가져온 이미지 URL
const imgKakaoTalk202509201722229751 =
  "http://localhost:3845/assets/5af4214d615e3eff906fb7977dd6e806c4a81c5e.png";
const imgRectangle588 =
  "http://localhost:3845/assets/81d6200acc496cc366a87e6a8aa18100efb27168.png";
const imgRectangle589 =
  "http://localhost:3845/assets/c2ca324f794e36221d0f0aa49c169cd4de527ccc.png";
const imgRectangle590 =
  "http://localhost:3845/assets/9fd99e5c2ead957567ad46b885c8dcffcfdd8c46.png";
const imgMaterialSymbolsLightMyLocationRounded =
  "http://localhost:3845/assets/f4beab465f0aac2c99e4d5dc1484e4dbaf5eeb8c.svg";
const imgMenu =
  "http://localhost:3845/assets/c15118a38464005d2c1a09db8ac7a8a50f6dcf7b.svg";
const imgFrame =
  "http://localhost:3845/assets/7a399b2f31e84d512e70be0431d775b96b74c3af.svg";
const imgFrame1 =
  "http://localhost:3845/assets/b522d9db08afc9af52de6b9cbada49bc4c434eed.svg";
const imgMapPinFill =
  "http://localhost:3845/assets/8e85a79a98365e59949459867b33e92fba43db9b.svg";
const imgChevronRight =
  "http://localhost:3845/assets/edf2a23c01e75dd580a93db392420d97fa85bd4a.svg";
const imgMapPinFillGray =
  "http://localhost:3845/assets/7c0d9f96fe2472450162dfbdea9ec87de2d55dba.svg";

interface Memory {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  icon?: string;
}

interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  date: string;
  category?: string;
  categoryName?: string;
  address?: string;
  description?: string;
  tags?: string[];
  memories?: Memory[];
}

const categories = [
  { id: "all", name: "전체", icon: imgMenu },
  { id: "restaurant", name: "식당", icon: imgFrame },
  { id: "cafe", name: "카페", icon: imgFrame1 },
  { id: "bar", name: "술집", icon: imgFrame1 },
  { id: "shopping", name: "쇼핑", icon: imgFrame1 },
  { id: "culture", name: "문화생활", icon: imgFrame1 },
  { id: "activity", name: "액티비티", icon: imgFrame1 },
  { id: "tour", name: "관광", icon: imgFrame1 },
  { id: "etc", name: "기타", icon: imgFrame1 },
];

const places: Place[] = [
  {
    id: "1",
    name: "모수 서울",
    latitude: 37.526,
    longitude: 126.969,
    imageUrl: imgRectangle588,
    date: "2025. 7. 16.",
    category: "restaurant",
    categoryName: "식당",
    address: "서울특별시 용산구 회나무로41길 4",
    description:
      "한강과 남산이 보이는 루프탑에서 프라이빗한 파인다이닝을 즐길 수 있는 곳.",
    tags: ["파인다이닝", "기념일", "야경"],
    memories: [
      {
        id: "1",
        title: "해달 생일",
        date: "2025.11.10",
        icon: "🎂",
      },
      {
        id: "2",
        title: "첫 만남",
        date: "2025.10.15",
        icon: "💕",
      },
      {
        id: "3",
        title: "기념일",
        date: "2025.09.20",
        icon: "🎉",
      },
      {
        id: "4",
        title: "데이트",
        date: "2025.08.25",
        icon: "🌹",
      },
      {
        id: "5",
        title: "저녁 식사",
        date: "2025.07.30",
        icon: "🍽️",
      },
    ],
  },
  {
    id: "2",
    name: "리움 미술관",
    latitude: 37.539,
    longitude: 126.999,
    imageUrl: imgRectangle589,
    date: "2025. 7. 14.",
    category: "culture",
    address: "서울 용산구 이태원로55길 60-16",
    description: "팀랩 전시가 열리고 있는 핫한 전시 공간.",
    tags: ["전시", "문화생활", "이태원"],
  },
  {
    id: "3",
    name: "그랜드하얏트 서울",
    latitude: 37.539,
    longitude: 126.995,
    imageUrl: imgRectangle590,
    date: "2025. 7. 10.",
    category: "activity",
    address: "서울 용산구 소월로 322",
    description: "한강뷰 수영장과 루프탑 바가 있는 도심 속 리조트.",
    tags: ["호텔", "수영장", "뷰맛집"],
  },
];

const MIN_SHEET_HEIGHT = 240;
const MAX_SHEET_HEIGHT = Dimensions.get("window").height * 0.7;
const MAX_SHEET_HEIGHT_DETAIL = Dimensions.get("window").height * 0.35; // 상세 시트일 때 최대 높이
const MIN_SHEET_HEIGHT_DETAIL = Dimensions.get("window").height * 0.35; // 상세 시트일 때 최소 높이 (최대와 동일하게 설정하여 줄일 수 없게 함)

export default function MapView() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapCenter, setMapCenter] = useState({
    latitude: 37.5665,
    longitude: 126.978,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(MIN_SHEET_HEIGHT);
  const listScrollRef = useRef<ScrollView>(null);

  // 애니메이션을 위한 shared value
  const animatedHeight = useSharedValue(MIN_SHEET_HEIGHT);

  // 애니메이션 스타일
  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
    };
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Grabber 영역에서만 드래그 시작
        return true;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 세로 드래그가 가로 드래그보다 클 때만 처리
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 10
        );
      },
      onPanResponderTerminationRequest: () => {
        // 리스트 스크롤과의 충돌 방지 - 드래그 중이면 거부
        return !isDragging;
      },
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        dragStartY.current = evt.nativeEvent.pageY;
        dragStartHeight.current = animatedHeight.value;
      },
      onPanResponderMove: (_, gestureState) => {
        // 상세 시트일 때는 드래그로 높이 변경 불가
        if (activePlace) {
          // 높이 변경 없음 (항상 고정 높이 유지)
          return;
        }

        // 일반 리스트 모드: 기존 로직
        const deltaY = dragStartY.current - gestureState.moveY;
        const maxHeight = MAX_SHEET_HEIGHT;
        const minHeight = MIN_SHEET_HEIGHT;
        const newHeight = Math.max(
          minHeight,
          Math.min(maxHeight, dragStartHeight.current + deltaY)
        );
        animatedHeight.value = newHeight;
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);

        // 드래그 속도에 따라 스냅
        const velocity = gestureState.vy;
        const deltaY = dragStartY.current - gestureState.moveY;
        const currentHeight = animatedHeight.value;
        const maxHeight = activePlace
          ? MAX_SHEET_HEIGHT_DETAIL
          : MAX_SHEET_HEIGHT;
        const minHeight = activePlace
          ? MIN_SHEET_HEIGHT_DETAIL
          : MIN_SHEET_HEIGHT;

        let targetHeight = currentHeight;

        // 상세 시트일 때는 높이 변경 불가 (최소 = 최대)
        if (activePlace) {
          targetHeight = MIN_SHEET_HEIGHT_DETAIL;
        } else {
          // 위로 드래그: 더 작은 임계값 (민감하게)
          if (velocity < -0.5 || deltaY > 50) {
            targetHeight = maxHeight;
          }
          // 아래로 드래그: 더 큰 임계값 (덜 민감하게)
          // 속도가 빠르거나 충분히 내려야 최소 높이로
          else if (velocity > 1.2 || deltaY < -120) {
            targetHeight = minHeight;
          }
          // 중간 위치에서 임계값 기준으로 결정
          // 현재 높이가 최소 높이에 가까우면 더 많이 내려야 최소로
          else {
            const midPoint = (minHeight + maxHeight) / 2;
            const heightRange = maxHeight - minHeight;
            const distanceFromMin = currentHeight - minHeight;

            // 최소 높이에 가까울수록 더 많이 내려야 최소로 스냅
            if (distanceFromMin < heightRange * 0.3) {
              // 최소 높이 근처에서는 더 많이 내려야 최소로 (deltaY < -80)
              if (deltaY < -80) {
                targetHeight = minHeight;
              } else {
                // 그대로 유지 (원래 위치로)
                targetHeight = currentHeight;
              }
            } else if (currentHeight > midPoint) {
              targetHeight = maxHeight;
            } else {
              // 중간 위치에서는 원래 위치 유지
              targetHeight = currentHeight;
            }
          }
        }

        // 부드러운 스프링 애니메이션으로 스냅
        animatedHeight.value = withSpring(targetHeight, {
          damping: 20,
          stiffness: 100,
          mass: 0.5,
        });
        dragStartHeight.current = targetHeight;
      },
    })
  ).current;

  const handlePlacePress = (place: Place) => {
    setActivePlace(place);
    animatedHeight.value = withSpring(MAX_SHEET_HEIGHT_DETAIL, {
      damping: 20,
      stiffness: 100,
      mass: 0.5,
    });
    dragStartHeight.current = MAX_SHEET_HEIGHT_DETAIL;
  };

  const handleCloseDetail = () => {
    setActivePlace(null);
    animatedHeight.value = withSpring(MIN_SHEET_HEIGHT, {
      damping: 20,
      stiffness: 100,
      mass: 0.5,
    });
    dragStartHeight.current = MIN_SHEET_HEIGHT;
  };

  return (
    <View style={styles.container}>
      {/* 네이버 지도 */}
      <View style={styles.map}>
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

      {/* 내 위치 버튼 */}
      <TouchableOpacity style={styles.myLocationButton}>
        <Image
          source={{ uri: imgMaterialSymbolsLightMyLocationRounded }}
          style={styles.myLocationIcon}
          contentFit="contain"
        />
      </TouchableOpacity>

      {/* 하단 시트 */}
      <Animated.View style={[styles.bottomSheet, animatedSheetStyle]}>
        {/* Grabber - 드래그 가능 영역 */}
        <View style={styles.grabberContainer} {...panResponder.panHandlers}>
          <View style={styles.grabber} />
        </View>

        {/* 필터 - 상세 시트가 열려있을 때는 숨김 */}
        {!activePlace && (
          <View style={styles.filterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
              scrollEnabled={!isDragging}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterButton,
                    selectedCategory === category.id &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Image
                    source={{ uri: category.icon }}
                    style={styles.filterIcon}
                    contentFit="contain"
                  />
                  <Text
                    style={[
                      styles.filterText,
                      selectedCategory === category.id &&
                        styles.filterTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 최근 추가된 장소 리스트 / 상세 시트 */}
        {!activePlace ? (
          <ScrollView
            ref={listScrollRef}
            style={styles.placeListScrollView}
            contentContainerStyle={styles.placeListContainer}
            scrollEnabled={!isDragging}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.placeListTitle}>최근 추가된 장소</Text>
            {places.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeItem}
                onPress={() => handlePlacePress(place)}
              >
                <View style={styles.placeItemContent}>
                  <Image
                    source={{ uri: imgMapPinFill }}
                    style={styles.placePinIcon}
                    contentFit="contain"
                  />
                  <View style={styles.placeItemInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeDate}>{place.date}</Text>
                  </View>
                </View>
                <View style={styles.placeItemArrow}>
                  <Image
                    source={{ uri: imgChevronRight }}
                    style={styles.arrowIcon}
                    contentFit="contain"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.detailSheetScrollView}
            contentContainerStyle={styles.detailSheetContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={!isDragging}
          >
            {/* 헤더 */}
            <View style={styles.detailHeader}>
              <View style={styles.detailHeaderLeft}>
                <Text style={styles.detailHeaderTitle}>{activePlace.name}</Text>
                {activePlace.address && (
                  <Text style={styles.detailHeaderAddress}>
                    {activePlace.address}
                  </Text>
                )}
                {activePlace.categoryName && (
                  <View style={styles.detailCategoryTag}>
                    <Image
                      source={{
                        uri:
                          categories.find((c) => c.id === activePlace.category)
                            ?.icon || imgFrame,
                      }}
                      style={styles.detailCategoryIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.detailCategoryText}>
                      {activePlace.categoryName}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseDetail}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* 구분선 */}
            <View style={styles.detailDivider} />

            {/* 이 장소에서 남긴 추억 */}
            <View style={styles.memoriesSection}>
              <View style={styles.memoriesSectionHeader}>
                <Ionicons name="heart" size={16} color="#FF6638" />
                <Text style={styles.memoriesSectionTitle}>
                  이 장소에서 남긴 추억
                </Text>
              </View>

              {activePlace.memories && activePlace.memories.length > 0 ? (
                <View style={styles.memoriesList}>
                  {activePlace.memories.map((memory) => (
                    <TouchableOpacity
                      key={memory.id}
                      style={styles.memoryItem}
                      onPress={() => {
                        // TODO: 메모리 상세 페이지로 이동
                      }}
                    >
                      <View style={styles.memoryImagePlaceholder}>
                        {memory.imageUrl ? (
                          <Image
                            source={{ uri: memory.imageUrl }}
                            style={styles.memoryImage}
                            contentFit="cover"
                          />
                        ) : null}
                      </View>
                      <View style={styles.memoryItemContent}>
                        <View style={styles.memoryItemTitleRow}>
                          <Text style={styles.memoryItemTitle}>
                            {memory.title}
                          </Text>
                          {memory.icon && (
                            <Text style={styles.memoryItemIcon}>
                              {memory.icon}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.memoryItemDate}>{memory.date}</Text>
                      </View>
                      <Image
                        source={{ uri: imgChevronRight }}
                        style={styles.memoryItemArrow}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyMemories}>
                  <Text style={styles.emptyMemoriesText}>
                    아직 남긴 추억이 없어요.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  map: {
    flex: 1,
    position: "relative",
  },
  markerOverlay: {
    position: "absolute",
    zIndex: 10,
  },
  markerContainer: {
    alignItems: "center",
    gap: 4,
  },
  markerImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
  markerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#040404",
    textAlign: "center",
    letterSpacing: -0.28,
    maxWidth: 63,
  },
  myLocationButton: {
    position: "absolute",
    right: 16,
    top: 498,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 8,
  },
  myLocationIcon: {
    width: 24,
    height: 24,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.18,
    shadowRadius: 75,
    elevation: 20,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
    overflow: "hidden",
    flexDirection: "column",
  },
  grabberContainer: {
    alignItems: "center",
    paddingBottom: 10,
    paddingTop: 8,
    paddingVertical: 8,
    flexShrink: 0,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: "#CFCFCF",
    borderRadius: 100,
  },
  filterWrapper: {
    flexShrink: 0,
  },
  filterContainer: {
    gap: 8,
    paddingBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ECEFF1",
    borderRadius: 100,
  },
  filterButtonActive: {
    backgroundColor: "#FF6638",
  },
  filterIcon: {
    width: 16,
    height: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#404040",
    letterSpacing: -0.28,
  },
  filterTextActive: {
    color: "white",
  },
  placeListScrollView: {
    flex: 1,
  },
  placeListContainer: {
    gap: 0,
    paddingBottom: 8,
  },
  placeListTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.36,
    marginBottom: 12,
  },
  placeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  placeItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  placeItemInfo: {
    flex: 1,
    gap: 4,
  },
  placePinIcon: {
    width: 18,
    height: 18,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#040404",
    letterSpacing: -0.32,
  },
  placeDate: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A3A3A3",
    letterSpacing: -0.28,
  },
  placeItemArrow: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: "#A3A3A3",
  },
  detailSheetScrollView: {
    flex: 1,
  },
  detailSheetContainer: {
    paddingBottom: 24,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 4,
    paddingBottom: 16,
  },
  detailHeaderLeft: {
    flex: 1,
    gap: 8,
  },
  detailHeaderTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F0F0F",
    letterSpacing: -0.44,
    lineHeight: 30,
  },
  detailHeaderAddress: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6F605B",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  detailCategoryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFF5F2",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  detailCategoryIcon: {
    width: 14,
    height: 14,
  },
  detailCategoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6F605B",
    letterSpacing: -0.24,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#383838",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
  },
  memoriesSection: {
    gap: 16,
  },
  memoriesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memoriesSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F0F0F",
    letterSpacing: -0.32,
  },
  memoriesList: {
    gap: 12,
  },
  memoryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  memoryImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E8E3E0",
    overflow: "hidden",
  },
  memoryImage: {
    width: "100%",
    height: "100%",
  },
  memoryItemContent: {
    flex: 1,
    gap: 4,
  },
  memoryItemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memoryItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F0F0F",
    letterSpacing: -0.32,
  },
  memoryItemIcon: {
    fontSize: 16,
  },
  memoryItemDate: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A39892",
    letterSpacing: -0.28,
  },
  memoryItemArrow: {
    width: 16,
    height: 16,
    tintColor: "#A39892",
  },
  emptyMemories: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyMemoriesText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A39892",
    letterSpacing: -0.28,
  },
});
