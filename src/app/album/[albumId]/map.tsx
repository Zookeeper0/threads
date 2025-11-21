import { Ionicons } from "@expo/vector-icons";
import { NaverMapView } from "@mj-studio/react-native-naver-map";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LocationItem {
  id: string;
  name: string;
  date: string;
  latitude: number;
  longitude: number;
}

// 더미 위치 데이터 (실제로는 API에서 가져와야 함)
const locationItems: LocationItem[] = [
  {
    id: "1",
    name: "모수 서울",
    date: "2025. 11. 3.",
    latitude: 37.5665,
    longitude: 126.978,
  },
  {
    id: "2",
    name: "리움 미술관",
    date: "2025. 11. 5.",
    latitude: 37.5775,
    longitude: 126.979,
  },
  {
    id: "3",
    name: "그랜드하얏트 서울",
    date: "2025. 11. 7.",
    latitude: 37.5685,
    longitude: 126.977,
  },
];

export default function AlbumMap() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { albumId } = useLocalSearchParams();
  const pathname = usePathname();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // 지도 화면일 때만 bottom sheet 표시
  const isMapScreen = pathname?.includes("/map") === true;

  useEffect(() => {
    // 지도 화면이고 위치 데이터가 있을 때만 bottom sheet 표시
    if (isMapScreen && locationItems.length > 0) {
      setIsBottomSheetVisible(true);
    } else {
      setIsBottomSheetVisible(false);
    }
  }, [isMapScreen]);

  // 화면 크기에 따른 동적 크기 계산
  const paddingHorizontal = screenWidth * 0.04;
  const fontSize = {
    small: screenWidth * 0.035,
    medium: screenWidth * 0.04,
    large: screenWidth * 0.045,
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetVisible(false);
  };

  const handleLocationPress = (location: LocationItem) => {
    // TODO: 해당 위치로 지도 이동 및 상세 정보 표시
    console.log("Location pressed:", location);
  };

  return (
    <View style={styles.container}>
      <NaverMapView
        style={StyleSheet.absoluteFillObject}
        initialCamera={{
          latitude: 37.5665,
          longitude: 126.978,
          zoom: 15,
        }}
        isShowLocationButton={false}
        isShowCompass={false}
        isShowScaleBar={false}
        isShowZoomControls={false}
      />
      {/* TODO: 앨범에 관련된 장소 마커 표시 */}

      {/* BottomSheet 모달 - 지도 화면일 때만 표시 */}
      {isMapScreen && locationItems.length > 0 && (
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
              {/* 드래그 핸들 */}
              <View style={styles.dragIndicatorContainer}>
                <View style={styles.dragIndicator} />
              </View>

              {/* 위치 리스트 */}
              <ScrollView
                style={styles.locationList}
                showsVerticalScrollIndicator={false}
              >
                {locationItems.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.locationItem}
                    onPress={() => handleLocationPress(location)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="location"
                      size={screenWidth * 0.06}
                      color="#31170F"
                      style={styles.locationIcon}
                    />
                    <View style={styles.locationInfo}>
                      <Text
                        style={[
                          styles.locationName,
                          { fontSize: fontSize.medium },
                        ]}
                      >
                        {location.name}
                      </Text>
                      <Text
                        style={[
                          styles.locationDate,
                          { fontSize: fontSize.small },
                        ]}
                      >
                        {location.date}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={screenWidth * 0.05}
                      color="#A0A0A0"
                      style={styles.chevronIcon}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    minHeight: 200,
  },
  dragIndicatorContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E8E3E0",
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F1EF",
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontWeight: "600",
    color: "#31170F",
    letterSpacing: -0.32,
    marginBottom: 4,
  },
  locationDate: {
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
  },
  chevronIcon: {
    marginLeft: 12,
  },
});
