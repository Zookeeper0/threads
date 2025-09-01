import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
// (선택) 실제 주소까지 얻고 싶다면 주석 해제
// import * as Location from "expo-location";
import { ModalCommonProps } from "@/types/modal.types";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import LoadingScreen from "../LoadingScreen";

interface ImageWithLocation {
  uri: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string; // 현재는 "위도/경도" 문자열, 필요 시 역지오코딩 결과로 대체 가능
  };
  date?: string;
  filename?: string;
}

type CoordsDate = {
  latitude?: number;
  longitude?: number;
  date?: string;
};

const DateRecordModal: React.FC<ModalCommonProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const [selectedImages, setSelectedImages] = useState<ImageWithLocation[]>([]);
  const [dateDescription, setDateDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"album" | "map">("album");
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열리면 자동으로 이미지 선택 시작
  useEffect(() => {
    if (visible && selectedImages.length === 0) {
      handlePickImages();
    }
  }, [visible]);

  /**
   * 1) ImagePicker가 돌려주는 EXIF에서 좌표/날짜 얻기 (플랫폼별 분기)
   *  - iOS: exif["{GPS}"].Latitude / .Longitude
   *  - Android: exif.GPSLatitude / exif.GPSLongitude 또는 GPSLatitudeRef/GPSLongitudeRef가 함께 올 수 있음
   */
  const tryGetFromExif = (exif: any): CoordsDate => {
    if (!exif) return {};
    try {
      // iOS 패턴
      if (exif["{GPS}"]) {
        const g = exif["{GPS}"];
        const lat = typeof g.Latitude === "number" ? g.Latitude : undefined;
        const lng = typeof g.Longitude === "number" ? g.Longitude : undefined;

        // 날짜(iOS는 {Exif}.DateTimeOriginal 혹은 DateTime)
        let dateIso: string | undefined;
        const exifBlock = exif["{Exif}"] ?? exif;
        const rawDate: string | undefined =
          exifBlock?.DateTimeOriginal || exifBlock?.DateTime;
        if (rawDate && /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(rawDate)) {
          const [d, t] = rawDate.split(" ");
          const [Y, M, D] = d.split(":").map((v: string) => parseInt(v, 10));
          const [h, m, s] = t.split(":").map((v: string) => parseInt(v, 10));
          dateIso = new Date(Y, M - 1, D, h, m, s).toISOString();
        }

        return { latitude: lat, longitude: lng, date: dateIso };
      }

      // Android 패턴
      // 대부분 expo-image-picker는 소수값으로 파싱해 전달하지만,
      // 기기/제조사에 따라 ref가 붙는 경우가 있어 보정 포함
      const lat = exif.GPSLatitude;
      const lng = exif.GPSLongitude;
      const latRef = exif.GPSLatitudeRef; // "N" or "S"
      const lngRef = exif.GPSLongitudeRef; // "E" or "W"

      let latitude: number | undefined =
        typeof lat === "number" ? lat : undefined;
      let longitude: number | undefined =
        typeof lng === "number" ? lng : undefined;

      if (latitude !== undefined && latRef === "S") latitude = -latitude;
      if (longitude !== undefined && lngRef === "W") longitude = -longitude;

      // 날짜(안드로이드에선 DateTimeOriginal 또는 DateTime으로 올 수 있음)
      let dateIso: string | undefined;
      const rawDate: string | undefined =
        exif.DateTimeOriginal || exif.DateTime;
      if (rawDate && /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(rawDate)) {
        const [d, t] = rawDate.split(" ");
        const [Y, M, D] = d.split(":").map((v: string) => parseInt(v, 10));
        const [h, m, s] = t.split(":").map((v: string) => parseInt(v, 10));
        dateIso = new Date(Y, M - 1, D, h, m, s).toISOString();
      }

      return { latitude, longitude, date: dateIso };
    } catch (e) {
      console.log("tryGetFromExif 오류:", e);
      return {};
    }
  };

  /**
   * 2) MediaLibrary에서 자산 상세 정보를 조회해 좌표/생성일 얻기
   *    (ImagePicker가 exif를 못 줄 때 fallback)
   */
  const tryGetFromMediaLibrary = async (
    assetId?: string
  ): Promise<CoordsDate> => {
    if (!assetId) return {};
    try {
      // MediaLibrary 권한(읽기)
      const mlPerm = await MediaLibrary.getPermissionsAsync();
      if (mlPerm.status !== "granted") {
        const req = await MediaLibrary.requestPermissionsAsync();
        if (req.status !== "granted") {
          return {};
        }
      }

      const info = await MediaLibrary.getAssetInfoAsync(assetId);
      const loc = info.location; // { latitude, longitude } | undefined
      const dateIso = info.creationTime
        ? new Date(info.creationTime).toISOString()
        : undefined;

      return {
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        date: dateIso,
      };
    } catch (e) {
      console.log("tryGetFromMediaLibrary 오류:", e);
      return {};
    }
  };

  /**
   * (선택) 진짜 주소 문자열이 필요하면 역지오코딩
   *  - expo-location의 reverseGeocodeAsync는 좌표만 있으면 동작 (권한 없이도 가능)
   *  - 정책/네트워크 상황에 따라 권한을 요구할 수 있으니 필요 시 주석 해제
   */
  // const toAddressString = async (lat?: number, lng?: number) => {
  //   if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  //   try {
  //     const list = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  //     if (list && list[0]) {
  //       const { region, city, district, name, street, streetNumber } = list[0];
  //       const parts = [region, city, district, street, streetNumber, name].filter(Boolean);
  //       return parts.join(" ");
  //     }
  //     return `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
  //   } catch {
  //     return `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
  //   }
  // };

  const toLatLngLabel = (lat?: number, lng?: number) => {
    if (typeof lat !== "number" || typeof lng !== "number") return undefined;
    return `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
  };

  const ensurePickerPermission = async () => {
    // 갤러리 권한
    const media = await ImagePicker.getMediaLibraryPermissionsAsync();
    let status = media.status;
    if (status !== "granted") {
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") {
      Alert.alert("권한 필요", "갤러리 접근 권한을 허용해주세요.");
      return false;
    }
    return true;
  };

  const ensureCameraPermission = async () => {
    const cam = await ImagePicker.getCameraPermissionsAsync();
    let status = cam.status;
    if (status !== "granted") {
      const req = await ImagePicker.requestCameraPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 권한을 허용해주세요.");
      return false;
    }
    return true;
  };

  /** 사진 선택 함수 */
  const handlePickImages = async () => {
    try {
      if (!(await ensurePickerPermission())) return;

      const result: any = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: Math.max(1, 9 - selectedImages.length),
        quality: 0.9,
        exif: true, // ★ 핵심: EXIF 요청
      });

      if (!result.canceled || result.assets?.length) {
        const newImagesBase: ImageWithLocation[] =
          result.assets?.map((asset: any) => ({
            uri: asset.uri,
            filename:
              asset.fileName ||
              asset.filename ||
              asset.uri.split("/").pop() ||
              undefined,
          })) ?? [];

        setSelectedImages((prev) => [...prev, ...newImagesBase].slice(0, 9));

        if (newImagesBase.length > 0) {
          setIsLoading(true);

          const imagesWithMeta = await Promise.all(
            (result.assets ?? []).map(async (asset: any) => {
              // 1차: EXIF에서 시도
              const fromExif = tryGetFromExif(asset.exif);

              // 2차: MediaLibrary에서 보완
              const fromML =
                typeof fromExif.latitude === "number" &&
                typeof fromExif.longitude === "number" &&
                fromExif.date
                  ? {}
                  : await tryGetFromMediaLibrary(asset.assetId);

              const latitude =
                fromExif.latitude ?? (fromML.latitude as number | undefined);
              const longitude =
                fromExif.longitude ?? (fromML.longitude as number | undefined);
              const date =
                fromExif.date ?? fromML.date ?? new Date().toISOString();

              // 주소 문자열(현재는 좌표 문자열로)
              const address = toLatLngLabel(latitude, longitude);
              // 실제 주소가 필요하면 toAddressString(lat, lng) 사용(비동기):
              // const address = await toAddressString(latitude, longitude);

              const enriched: ImageWithLocation = {
                uri: asset.uri,
                filename:
                  asset.fileName ||
                  asset.filename ||
                  asset.uri.split("/").pop() ||
                  undefined,
                date,
                location:
                  typeof latitude === "number" && typeof longitude === "number"
                    ? { latitude, longitude, address }
                    : undefined,
              };

              return enriched;
            })
          );

          // 기존 배열에 매칭하여 덮어쓰기
          setSelectedImages((prev) => {
            const mapByUri = new Map(prev.map((p) => [p.uri, p]));
            for (const item of imagesWithMeta) {
              mapByUri.set(item.uri, {
                ...(mapByUri.get(item.uri) ?? {}),
                ...item,
              });
            }
            return Array.from(mapByUri.values()).slice(0, 9);
          });

          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("이미지 선택 중 오류:", error);
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const okCamera = await ensureCameraPermission();
      const okLibrary = await ensurePickerPermission();
      if (!okCamera || !okLibrary) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        exif: true, // ★ 핵심
      });

      if (!result.canceled && result.assets?.[0]) {
        const a = result.assets[0];

        const base: ImageWithLocation = {
          uri: a.uri,
          filename:
            a.fileName || a.fileName || a.uri.split("/").pop() || undefined,
        };
        setSelectedImages((prev) => [...prev, base].slice(0, 9));

        setIsLoading(true);

        // 1차 EXIF
        const fromExif = tryGetFromExif(a.exif);
        // 2차 ML
        const fromML =
          typeof fromExif.latitude === "number" &&
          typeof fromExif.longitude === "number" &&
          fromExif.date
            ? {}
            : await tryGetFromMediaLibrary(a.assetId as any);

        const latitude =
          fromExif.latitude ?? (fromML.latitude as number | undefined);
        const longitude =
          fromExif.longitude ?? (fromML.longitude as number | undefined);
        const date = fromExif.date ?? fromML.date ?? new Date().toISOString();

        const address = toLatLngLabel(latitude, longitude);
        // 실제 주소가 필요하면:
        // const address = await toAddressString(latitude, longitude);

        const withLoc: ImageWithLocation = {
          ...base,
          date,
          location:
            typeof latitude === "number" && typeof longitude === "number"
              ? { latitude, longitude, address }
              : undefined,
        };

        setSelectedImages((prev) =>
          prev.map((img) => (img.uri === base.uri ? withLoc : img))
        );

        setIsLoading(false);
      }
    } catch (error) {
      console.error("사진 촬영 중 오류:", error);
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log("데이트 기록 저장:", { selectedImages, dateDescription });
    onClose();
  };

  const renderImageGrid = () => {
    const grid: React.ReactNode[] = [];

    selectedImages.forEach((image, index) => {
      grid.push(
        <View key={`image-${index}`} style={styles.imageRow}>
          {/* 왼쪽 1/4: 이미지 */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* 오른쪽 3/4: 위경도 정보 */}
          <View style={styles.locationContainer}>
            {image.location ? (
              <View style={styles.locationDetails}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={16} color="#FF6B9D" />
                  <Text style={styles.locationTitle}>위치 정보</Text>
                </View>
                <Text style={styles.coordinateText}>
                  위도: {image.location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateText}>
                  경도: {image.location.longitude.toFixed(6)}
                </Text>

                <Text style={styles.dateText}>
                  {new Date(image.date || "").toLocaleDateString("ko-KR")}
                </Text>
              </View>
            ) : (
              <View style={styles.noLocationInfo}>
                <Ionicons name="close-circle" size={16} color="#999" />
                <Text style={styles.noLocationText}>GPS 정보 없음</Text>
                <Text style={styles.dateText}>
                  {new Date(image.date || "").toLocaleDateString("ko-KR")}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    });

    if (selectedImages.length < 9) {
      grid.push(
        <TouchableOpacity
          key="add-button"
          style={styles.addImageRow}
          onPress={handlePickImages}
        >
          <View style={styles.addImageContainer}>
            <Ionicons name="add" size={32} color="#666" />
            <Text style={styles.addImageText}>이미지 추가</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return grid;
    // ↑ 필요 시 카메라 버튼도 추가:
    // <TouchableOpacity onPress={handleTakePhoto}>...</TouchableOpacity>
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.safeArea,
          colorScheme === "dark" ? styles.safeAreaDark : styles.safeAreaLight,
        ]}
      >
        {/* 헤더 */}
        <View
          style={[
            styles.header,
            colorScheme === "dark" ? styles.headerDark : styles.headerLight,
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text
              style={[
                styles.headerButtonText,
                colorScheme === "dark"
                  ? styles.headerButtonTextDark
                  : styles.headerButtonTextLight,
              ]}
            >
              취소
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              colorScheme === "dark"
                ? styles.headerTitleDark
                : styles.headerTitleLight,
            ]}
          >
            스토리 보드
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text
              style={[
                styles.headerButtonText,
                styles.doneButton,
                colorScheme === "dark"
                  ? styles.headerButtonTextDark
                  : styles.headerButtonTextLight,
              ]}
            >
              완료
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 */}
        <View
          style={[
            styles.tabContainer,
            colorScheme === "dark"
              ? styles.tabContainerDark
              : styles.tabContainerLight,
          ]}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === "album" && styles.activeTab]}
            onPress={() => setActiveTab("album")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "album"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
                colorScheme === "dark"
                  ? styles.tabTextDark
                  : styles.tabTextLight,
              ]}
            >
              앨범
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "map" && styles.activeTab]}
            onPress={() => setActiveTab("map")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "map"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
                colorScheme === "dark"
                  ? styles.tabTextDark
                  : styles.tabTextLight,
              ]}
            >
              지도
            </Text>
          </TouchableOpacity>
        </View>

        {/* 내용 */}
        <ScrollView style={styles.contentContainer}>
          {activeTab === "album" ? (
            <View style={styles.albumContainer}>
              <View style={styles.imageGrid}>{renderImageGrid()}</View>

              <View style={styles.descriptionContainer}>
                <Text
                  style={[
                    styles.descriptionLabel,
                    colorScheme === "dark"
                      ? styles.descriptionLabelDark
                      : styles.descriptionLabelLight,
                  ]}
                >
                  데이트 설명
                </Text>
                <TextInput
                  style={[
                    styles.descriptionInput,
                    colorScheme === "dark"
                      ? styles.descriptionInputDark
                      : styles.descriptionInputLight,
                  ]}
                  value={dateDescription}
                  onChangeText={setDateDescription}
                  placeholder="오늘 데이트에 대해 이야기해주세요..."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#666" : "#999"
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          ) : (
            <View style={styles.mapContainer}>
              <Text
                style={[
                  styles.mapPlaceholder,
                  colorScheme === "dark"
                    ? styles.mapPlaceholderDark
                    : styles.mapPlaceholderLight,
                ]}
              >
                지도 기능은 추후 구현 예정입니다.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* 로딩 화면 */}
        <LoadingScreen visible={isLoading} />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  safeAreaLight: { backgroundColor: "white" },
  safeAreaDark: { backgroundColor: "#101010" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 55,
  },
  headerLight: { backgroundColor: "white", borderBottomColor: "#e0e0e0" },
  headerDark: { backgroundColor: "#101010", borderBottomColor: "#333" },
  headerButton: { padding: 8, minWidth: 60, alignItems: "center" },
  headerButtonText: { fontSize: 17, fontWeight: "500" },
  headerButtonTextLight: { color: "#000" },
  headerButtonTextDark: { color: "#fff" },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  headerTitleLight: { color: "#000" },
  headerTitleDark: { color: "#fff" },
  doneButton: { fontWeight: "600" },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabContainerLight: { backgroundColor: "white", borderBottomColor: "#e0e0e0" },
  tabContainerDark: { backgroundColor: "#101010", borderBottomColor: "#333" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#FF6B9D" },
  tabText: { fontSize: 16, fontWeight: "500" },
  tabTextLight: { color: "#000" },
  tabTextDark: { color: "#fff" },
  activeTabText: { color: "#FF6B9D" },
  inactiveTabText: { color: "#666" },
  contentContainer: { flex: 1 },
  albumContainer: { padding: 16 },
  imageGrid: { marginBottom: 20 },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
  },
  descriptionContainer: { marginTop: 16 },
  descriptionLabel: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  descriptionLabelLight: { color: "#333" },
  descriptionLabelDark: { color: "#fff" },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  descriptionInputLight: {
    backgroundColor: "white",
    color: "#333",
    borderColor: "#ddd",
  },
  descriptionInputDark: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    borderColor: "#333",
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapPlaceholder: { fontSize: 16, textAlign: "center" },
  mapPlaceholderLight: { color: "#666" },
  mapPlaceholderDark: { color: "#999" },
  imageRow: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  imageContainer: { width: "25%", aspectRatio: 1, position: "relative" },
  selectedImage: { width: "100%", height: "100%" },
  locationContainer: { flex: 1, padding: 12, justifyContent: "center" },
  locationDetails: { flex: 1 },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
  coordinateText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  dateText: { fontSize: 11, color: "#999", marginTop: 8 },
  noLocationInfo: { flex: 1, justifyContent: "center", alignItems: "center" },
  noLocationText: { fontSize: 12, color: "#999", marginTop: 4 },
  addImageRow: {
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  addImageContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: { fontSize: 14, color: "#666", marginTop: 8 },
});

export default DateRecordModal;
