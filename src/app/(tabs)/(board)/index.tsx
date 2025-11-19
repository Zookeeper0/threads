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

interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  date: string;
  category?: string;
  address?: string;
  description?: string;
  tags?: string[];
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
    address: "서울 용산구 신흥로 97",
    description:
      "한강과 남산이 보이는 루프탑에서 프라이빗한 파인다이닝을 즐길 수 있는 곳.",
    tags: ["파인다이닝", "기념일", "야경"],
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

const MIN_SHEET_HEIGHT = 193;
const MAX_SHEET_HEIGHT = Dimensions.get("window").height * 0.8;

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
        const deltaY = dragStartY.current - gestureState.moveY;
        const newHeight = Math.max(
          MIN_SHEET_HEIGHT,
          Math.min(MAX_SHEET_HEIGHT, dragStartHeight.current + deltaY)
        );
        // 실시간으로 높이 업데이트 (애니메이션 없이 즉시 반영)
        animatedHeight.value = newHeight;
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);

        // 드래그 속도에 따라 스냅
        const velocity = gestureState.vy;
        const deltaY = dragStartY.current - gestureState.moveY;
        const currentHeight = animatedHeight.value;

        let targetHeight = currentHeight;

        // 위로 드래그: 더 작은 임계값 (민감하게)
        if (velocity < -0.5 || deltaY > 50) {
          targetHeight = MAX_SHEET_HEIGHT;
        }
        // 아래로 드래그: 더 큰 임계값 (덜 민감하게)
        // 속도가 빠르거나 충분히 내려야 최소 높이로
        else if (velocity > 1.2 || deltaY < -120) {
          targetHeight = MIN_SHEET_HEIGHT;
        }
        // 중간 위치에서 임계값 기준으로 결정
        // 현재 높이가 최소 높이에 가까우면 더 많이 내려야 최소로
        else {
          const midPoint = (MIN_SHEET_HEIGHT + MAX_SHEET_HEIGHT) / 2;
          const heightRange = MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT;
          const distanceFromMin = currentHeight - MIN_SHEET_HEIGHT;

          // 최소 높이에 가까울수록 더 많이 내려야 최소로 스냅
          if (distanceFromMin < heightRange * 0.3) {
            // 최소 높이 근처에서는 더 많이 내려야 최소로 (deltaY < -80)
            if (deltaY < -80) {
              targetHeight = MIN_SHEET_HEIGHT;
            } else {
              // 그대로 유지 (원래 위치로)
              targetHeight = currentHeight;
            }
          } else if (currentHeight > midPoint) {
            targetHeight = MAX_SHEET_HEIGHT;
          } else {
            // 중간 위치에서는 원래 위치 유지
            targetHeight = currentHeight;
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
    animatedHeight.value = withSpring(MAX_SHEET_HEIGHT, {
      damping: 20,
      stiffness: 100,
      mass: 0.5,
    });
    dragStartHeight.current = MAX_SHEET_HEIGHT;
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

        {/* 필터 */}
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
                  selectedCategory === category.id && styles.filterButtonActive,
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
                    selectedCategory === category.id && styles.filterTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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
          <View style={styles.detailSheetContainer}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailHeaderLabel}>오늘의 기록</Text>
                <Text style={styles.detailHeaderTitle}>{activePlace.name}</Text>
                <Text style={styles.detailHeaderSubtitle}>
                  {activePlace.address
                    ? `${activePlace.date} · ${activePlace.address}`
                    : activePlace.date}
                </Text>
              </View>
              <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel="장소 상세 닫기"
                style={styles.closeButton}
                onPress={handleCloseDetail}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: imgKakaoTalk202509201722229751 }}
              style={styles.detailSheetImage}
              contentFit="cover"
            />

            <View style={styles.detailInfoSection}>
              <View style={styles.detailMetaRow}>
                {activePlace.address && (
                  <View style={styles.detailMeta}>
                    <Image
                      source={{ uri: imgMapPinFillGray }}
                      style={styles.detailMetaIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.detailMetaText}>
                      {activePlace.address}
                    </Text>
                  </View>
                )}
                {activePlace.category && (
                  <View style={styles.detailMeta}>
                    <Image
                      source={{ uri: imgMapPinFill }}
                      style={styles.detailMetaIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.detailMetaTextHighlight}>
                      {activePlace.category}
                    </Text>
                  </View>
                )}
              </View>

              {activePlace.tags && (
                <View style={styles.tagContainer}>
                  {activePlace.tags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.detailDescription}>
                {activePlace.description}
              </Text>
            </View>
          </View>
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
  detailSheetContainer: {
    flex: 1,
    gap: 16,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  detailHeaderLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6638",
    letterSpacing: -0.24,
  },
  detailHeaderTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F0F0F",
    letterSpacing: -0.44,
  },
  detailHeaderSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#7A7A7A",
    letterSpacing: -0.26,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#383838",
  },
  detailSheetImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#F3F3F3",
  },
  detailInfoSection: {
    gap: 12,
  },
  detailMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  detailMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  detailMetaIcon: {
    width: 16,
    height: 16,
  },
  detailMetaText: {
    flex: 1,
    fontSize: 13,
    color: "#505050",
    letterSpacing: -0.26,
  },
  detailMetaTextHighlight: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6638",
    letterSpacing: -0.26,
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#353535",
    letterSpacing: -0.3,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FFF5F0",
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6638",
    letterSpacing: -0.24,
  },
});
