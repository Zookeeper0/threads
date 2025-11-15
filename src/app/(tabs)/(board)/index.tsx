import { NaverMapView } from "@mj-studio/react-native-naver-map";
import { Image } from "expo-image";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
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
}

const places: Place[] = [
  {
    id: "1",
    name: "모수 서울",
    latitude: 37.5665,
    longitude: 126.978,
    imageUrl: imgRectangle589,
    date: "2025. 7. 16.",
  },
  {
    id: "2",
    name: "우성아파트 놀이터",
    latitude: 37.567,
    longitude: 126.979,
    imageUrl: imgRectangle588,
    date: "2025. 7. 16.",
  },
  {
    id: "3",
    name: "롯데호텔",
    latitude: 37.5655,
    longitude: 126.9775,
    imageUrl: imgRectangle590,
    date: "2025. 7. 16.",
  },
  {
    id: "4",
    name: "리움 미술관",
    latitude: 37.568,
    longitude: 126.9785,
    imageUrl: imgRectangle589,
    date: "2025. 7. 16.",
  },
  {
    id: "5",
    name: "그랜드하얏트 서울",
    latitude: 37.566,
    longitude: 126.9795,
    imageUrl: imgRectangle589,
    date: "2025. 7. 16.",
  },
];

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

export default function MapView() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapCenter, setMapCenter] = useState({
    latitude: 37.5665,
    longitude: 126.978,
  });

  const recentPlaces = places.slice(0, 3);

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
        {/* 지도 마커 오버레이 */}
        {places.map((place, index) => {
          // 마커 위치를 절대 좌표로 계산 (간단한 예시)
          const markerPositions = [
            { top: 113, left: 32 },
            { top: 192, left: 117 },
            { top: 277, left: 244 },
            { top: 317, left: 79 },
            { top: 413, left: 215 },
          ];
          const position = markerPositions[index] || { top: 200, left: 100 };
          return (
            <View
              key={place.id}
              style={[
                styles.markerOverlay,
                { top: position.top, left: position.left },
              ]}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerImageContainer}>
                  <Image
                    source={{ uri: place.imageUrl }}
                    style={styles.markerImage}
                    contentFit="cover"
                  />
                </View>
                <Text style={styles.markerLabel} numberOfLines={1}>
                  {place.name}
                </Text>
              </View>
            </View>
          );
        })}
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
      <View style={styles.bottomSheet}>
        {/* Grabber */}
        <View style={styles.grabberContainer}>
          <View style={styles.grabber} />
        </View>

        {/* 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
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

        {/* 최근 추가된 장소 리스트 */}
        <View style={styles.placeListContainer}>
          <Text style={styles.placeListTitle}>최근 추가된 장소</Text>
          {recentPlaces.map((place, index) => (
            <TouchableOpacity key={place.id} style={styles.placeItem}>
              <View style={styles.placeItemContent}>
                <View style={styles.placeItemInfo}>
                  <View style={styles.placeItemHeader}>
                    <Image
                      source={{
                        uri: index === 0 ? imgMapPinFill : imgMapPinFillGray,
                      }}
                      style={styles.placePinIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.placeName}>{place.name}</Text>
                  </View>
                  <Text style={styles.placeDate}>{place.date}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.placeItemArrow}>
                <Image
                  source={{ uri: imgChevronRight }}
                  style={styles.arrowIcon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    height: 193,
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
  },
  grabberContainer: {
    alignItems: "center",
    paddingBottom: 10,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: "#CFCFCF",
    borderRadius: 100,
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
  placeListContainer: {
    gap: 8,
  },
  placeListTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.36,
    marginBottom: 8,
  },
  placeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
  },
  placeItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  placeItemInfo: {
    flex: 1,
  },
  placeItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
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
    padding: 6,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
});
