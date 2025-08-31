import { ModalCommonProps } from "@/types/modal.types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as React from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ImageWithLocation {
  uri: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  date?: string;
  filename?: string;
}

interface LocationGroup {
  id: string;
  images: ImageWithLocation[];
  representativeLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  count: number;
}

type CoordsDate = {
  latitude?: number;
  longitude?: number;
  date?: string;
};

const DateRecordModalFigma: React.FC<ModalCommonProps> = ({
  visible,
  onClose,
}) => {
  const [selectedImages, setSelectedImages] = React.useState<
    ImageWithLocation[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // 모달이 열리면 자동으로 이미지 선택 시작
  React.useEffect(() => {
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

  // 위경도를 기준으로 이미지 그룹화 (0.001도 차이 내는 것을 같은 장소로 판단)
  const groupImagesByLocation = (
    images: ImageWithLocation[]
  ): LocationGroup[] => {
    const groups: LocationGroup[] = [];
    const processedImages = new Set<string>();

    images.forEach((image) => {
      if (processedImages.has(image.uri) || !image.location) return;

      const currentGroup: ImageWithLocation[] = [image];
      processedImages.add(image.uri);

      // 비슷한 위치의 다른 이미지들 찾기
      images.forEach((otherImage) => {
        if (
          otherImage.uri !== image.uri &&
          !processedImages.has(otherImage.uri) &&
          otherImage.location
        ) {
          const latDiff = Math.abs(
            image.location!.latitude - otherImage.location!.latitude
          );
          const lngDiff = Math.abs(
            image.location!.longitude - otherImage.location!.longitude
          );

          // 0.001도 차이 내면 같은 장소로 판단 (약 100m 이내)
          if (latDiff < 0.001 && lngDiff < 0.001) {
            currentGroup.push(otherImage);
            processedImages.add(otherImage.uri);
          }
        }
      });

      // 그룹 생성
      if (currentGroup.length > 0) {
        const representative = currentGroup[0];
        groups.push({
          id: `group-${groups.length}`,
          images: currentGroup,
          representativeLocation: representative.location!,
          count: currentGroup.length,
        });
      }
    });

    return groups;
  };

  const locationGroups = groupImagesByLocation(selectedImages);

  const renderLocationGroup = (group: LocationGroup, index: number) => {
    const firstImage = group.images[0];
    const remainingCount = group.images.length - 1;

    return (
      <View
        key={group.id}
        style={[styles.frameParent4, styles.frameParentSpaceBlock]}
      >
        <View style={styles.frameParent5}>
          <View style={styles.frameParent6}>
            <Ionicons
              name="location"
              style={styles.frameChildLayout}
              size={24}
            />
            <View style={styles.frameParent7}>
              <View style={styles.container}>
                <Text style={styles.text8}>
                  {group.count > 1 ? `${group.count}장의 사진` : "1장의 사진"}
                </Text>
              </View>
              <View style={styles.frame}>
                <Text style={[styles.text9, styles.textTypo]}>
                  위도: {group.representativeLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <Text style={[styles.text10, styles.textTypo1]}>
                경도: {group.representativeLocation.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
          <View style={styles.parent3}>
            <Text style={[styles.text11, styles.textTypo1]}>
              {group.count}장
            </Text>
            <Ionicons
              name="ellipsis-horizontal"
              style={styles.frameChildLayout}
              size={24}
            />
          </View>
        </View>

        {/* 이미지 미리보기 */}
        <View style={styles.frameParent8}>
          <View style={styles.frameParent9}>
            {group.images.slice(0, 4).map((img, imgIndex) => (
              <View
                key={img.uri}
                style={[styles.frameItem, styles.frameLayout]}
              >
                <Image source={{ uri: img.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    const imageIndex = selectedImages.findIndex(
                      (img2) => img2.uri === img.uri
                    );
                    if (imageIndex !== -1) handleRemoveImage(imageIndex);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {remainingCount > 0 && (
              <View style={[styles.frameItem, styles.frameLayout]}>
                <Text style={[styles.text12, styles.textTypo1]}>
                  + {remainingCount}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.parent4}>
            <Text style={[styles.text10, styles.textTypo1]}>더보기</Text>
            <Ionicons
              name="chevron-forward"
              style={styles.frameIcon}
              size={10}
              color="#666"
            />
          </View>
        </View>

        <View style={styles.lineView} />
        <View style={[styles.frameParent10, styles.frameParentFlexBox]}>
          <View style={[styles.wrapper3, styles.wrapperFlexBox]}>
            <Text style={styles.textTypo}>+ 메모 추가</Text>
          </View>
          <View style={styles.frameWrapper}>
            <View style={[styles.wrapper4, styles.wrapperFlexBox]}>
              <Text style={styles.textTypo}>+ 평점 추가</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAddImageButton = () => {
    if (selectedImages.length >= 9) return null;

    return (
      <View style={[styles.frameParent4, styles.frameParentSpaceBlock]}>
        <View style={styles.addImageContainer}>
          <TouchableOpacity
            onPress={handlePickImages}
            style={styles.addImageButton}
          >
            <Ionicons name="add" size={32} color="#666" />
            <Text style={styles.addImageText}>이미지 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTakePhoto}
            style={styles.addImageButton}
          >
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={styles.addImageText}>사진 촬영</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.parent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>2025년 8월 11일</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.view}>
            <View style={styles.frameParent}>
              <View style={styles.group}>
                <Text style={styles.text}>2025년 8월 11일</Text>
                <Ionicons
                  name="calendar"
                  style={[styles.calendarDaysIcon, styles.iconLayout]}
                  size={16}
                />
              </View>
              <View style={styles.frameGroup}>
                <View style={styles.container}>
                  <Text style={[styles.text2, styles.textTypo3]}>
                    {selectedImages.length}장
                  </Text>
                  <Text
                    style={[styles.text3, styles.textTypo3]}
                  >{`의 사진 속 `}</Text>
                </View>
                <View style={styles.container}>
                  <Text style={[styles.text2, styles.textTypo3]}>
                    {locationGroups.length}개
                  </Text>
                  <Text style={[styles.text3, styles.textTypo3]}>
                    의 장소를 발견했어요!
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.frameContainer}>
              <View style={styles.frameParent2}>
                <View style={styles.parent2}>
                  <Text style={[styles.text6, styles.textTypo3]}>수정모드</Text>
                  <View style={styles.toggle}>
                    <View style={styles.toggleChild} />
                    <View style={[styles.circleIconSets, styles.iconLayout]} />
                  </View>
                </View>
                <Text style={[styles.text7, styles.textTypo3]}>
                  장소 명이나 사진이 잘못 지정되었다면 수정할 수 있어요.
                </Text>
              </View>

              <View style={styles.frameParent3}>
                {locationGroups.map((group, index) =>
                  renderLocationGroup(group, index)
                )}
                {renderAddImageButton()}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 다음 버튼 - 하단 고정 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={onClose}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
  },
  iconLayout: {
    width: 16,
    height: 16,
  },
  textTypo3: {
    lineHeight: 20,
    fontSize: 14,
    letterSpacing: -0.3,
    textAlign: "left",
    fontFamily: "Pretendard",
  },
  frameParentSpaceBlock: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 8,
  },
  textTypo: {
    color: "#525252",
    lineHeight: 16,
    letterSpacing: -0.2,
    fontSize: 12,
    textAlign: "left",
    fontFamily: "Pretendard",
  },
  textTypo1: {
    lineHeight: 16,
    letterSpacing: -0.2,
    textAlign: "left",
    fontFamily: "Pretendard",
  },
  frameLayout: {
    height: 80,
    backgroundColor: "#d9d9d9",
    borderRadius: 8,
    overflow: "hidden",
  },
  frameParentFlexBox: {
    gap: 10,
    alignSelf: "stretch",
    flexDirection: "row",
  },
  wrapperFlexBox: {
    paddingVertical: 11,
    paddingHorizontal: 46,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  view: {
    gap: 16,
    width: "100%",
    flex: 1,
  },
  frameParent: {
    width: 254,
    gap: 4,
  },
  group: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  text: {
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 28,
    textAlign: "left",
    fontFamily: "Pretendard",
    color: "#404040",
    fontWeight: "700",
  },
  calendarDaysIcon: {
    height: 16,
  },
  frameGroup: {
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
  },
  text2: {
    color: "#404040",
    fontWeight: "700",
    lineHeight: 20,
    fontSize: 14,
  },
  text3: {
    color: "#404040",
  },
  frameContainer: {
    gap: 8,
    alignSelf: "stretch",
  },
  frameParent2: {
    gap: 4,
  },
  parent2: {
    gap: 8,
    alignItems: "center",
    flexDirection: "row",
  },
  text6: {
    color: "#a3a3a3",
    fontWeight: "700",
    lineHeight: 20,
    fontSize: 14,
  },
  toggle: {
    width: 32,
    height: 16,
  },
  toggleChild: {
    height: "100%",
    top: "0%",
    right: "0%",
    bottom: "0%",
    left: "0%",
    borderRadius: 30,
    backgroundColor: "#d4d4d4",
    position: "absolute",
    width: "100%",
  },
  circleIconSets: {
    top: 0,
    left: 0,
    boxShadow: "3px 0px 4.6px rgba(0, 0, 0, 0.1)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 3,
      height: 0,
    },
    shadowRadius: 4.6,
    elevation: 4.6,
    shadowOpacity: 1,
    borderRadius: 50,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    position: "absolute",
    height: 16,
    alignItems: "center",
  },
  text7: {
    color: "#a3a3a3",
  },
  frameParent3: {
    alignSelf: "stretch",
    gap: 16,
  },
  frameParent4: {
    width: 328,
  },
  frameParent5: {
    justifyContent: "space-between",
    gap: 0,
    alignSelf: "stretch",
    flexDirection: "row",
  },
  frameParent6: {
    gap: 8,
    flexDirection: "row",
  },
  frameChildLayout: {
    height: 24,
    width: 24,
  },
  frameParent7: {
    justifyContent: "center",
  },
  text8: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    letterSpacing: -0.3,
    textAlign: "left",
    color: "#404040",
    fontFamily: "Pretendard",
  },
  frame: {
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text9: {
    width: 147,
    alignSelf: "stretch",
  },
  text10: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.2,
    color: "#a3a3a3",
  },
  parent3: {
    width: 95,
    justifyContent: "flex-end",
    gap: 8,
    alignItems: "center",
    flexDirection: "row",
  },
  text11: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.2,
    color: "#404040",
  },
  frameParent8: {
    gap: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  frameParent9: {
    gap: 2,
    overflow: "hidden",
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row",
  },
  frameItem: {
    flex: 1,
  },
  text12: {
    marginTop: -8,
    marginLeft: -9.25,
    top: "50%",
    left: "50%",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.2,
    position: "absolute",
    color: "#404040",
  },
  parent4: {
    gap: 7,
    alignItems: "center",
    flexDirection: "row",
  },
  frameIcon: {
    width: 10,
    height: 10,
  },
  lineView: {
    width: 313,
    borderStyle: "solid",
    borderColor: "#fafafa",
    borderTopWidth: 1,
    height: 1,
  },
  frameParent10: {
    justifyContent: "center",
  },
  wrapper3: {
    flex: 0.3907,
    paddingVertical: 11,
    paddingHorizontal: 46,
    backgroundColor: "#f0f0f0",
  },
  frameWrapper: {
    flexDirection: "row",
    flex: 1,
  },
  wrapper4: {
    flex: 1,
  },
  frameWrapper2: {
    alignSelf: "stretch",
  },
  frameParent11: {
    alignSelf: "stretch",
  },
  frameParent15: {
    backgroundColor: "#f3f3f3",
    padding: 8,
    borderRadius: 8,
    gap: 10,
  },
  wrapper7: {
    width: 28,
    borderRadius: 4,
    backgroundColor: "#ffd2d2",
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text20: {
    fontSize: 11,
    color: "#737373",
    fontWeight: "500",
  },
  frameParent16: {
    gap: 2,
    justifyContent: "center",
  },
  frameParent17: {
    gap: 2,
    flexDirection: "row",
  },
  frameChild4: {
    width: 77,
  },
  messageSquareParent: {
    flex: 0.3907,
    paddingVertical: 11,
    paddingHorizontal: 46,
    backgroundColor: "#f0f0f0",
    gap: 4,
  },
  materialSymbolsstarRoundedGroup: {
    gap: 4,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#404040",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  nextButton: {
    backgroundColor: "#404040",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 5,
  },
  addImageContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  addImageButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
  },
  addImageText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },
});

export default DateRecordModalFigma;
