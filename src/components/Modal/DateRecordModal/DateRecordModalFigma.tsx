import { locationSearchName } from "@/api/location/locationApi";
import { ModalCommonProps } from "@/types/modal.types";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./dateRecordModalFigma.style";

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
  placeName?: string; // 장소명 추가
}

type CoordsDate = {
  latitude?: number;
  longitude?: number;
  date?: string;
};

interface DateRecordModalFigmaProps extends ModalCommonProps {
  onLoadingChange?: (loading: boolean) => void;
}

// API 응답 타입 정의
interface LocationSearchResponse {
  place_name: string;
  // 다른 필드들도 있을 수 있음
}

// API 요청 타입 정의
interface LocationSearchRequest {
  latitude: number;
  longitude: number;
}

const DateRecordModalFigma: React.FC<DateRecordModalFigmaProps> = ({
  visible,
  onClose,
  onLoadingChange,
}) => {
  const [selectedImages, setSelectedImages] = useState<ImageWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 로딩 상태 변경 시 상위 컴포넌트에 알림
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // 모달이 닫히면 자동으로 이미지 선택 시작
  useEffect(() => {
    if (visible && selectedImages.length === 0) {
      handlePickImages();
    }
  }, [visible]);

  // 장소명 가져오기 mutation
  const placeNameMutation = useMutation<
    any, // 실제 응답 타입이 { data: [{ placeName: string, ... }], ... } 형태이므로 any로 둡니다.
    Error,
    LocationSearchRequest
  >({
    mutationFn: async (variables) => {
      console.log("mutationFn 호출됨, variables:", variables);
      const response = await locationSearchName(variables);
      console.log("locationSearchName 응답:", response);
      return response; // 전체 응답 반환
    },
    onSuccess: (data, variables) => {
      console.log("API 성공:", data, variables);
      // data.data[0].placeName을 추출하여 저장
      const firstPlaceName =
        data && data.data && Array.isArray(data.data) && data.data.length > 0
          ? data.data[0].placeName || data.data[0].name // placeName이 없으면 name 사용
          : "알 수 없는 장소";
      setLocationGroups((prev) =>
        prev.map((group) =>
          group.representativeLocation.latitude === variables.latitude &&
          group.representativeLocation.longitude === variables.longitude
            ? { ...group, placeName: firstPlaceName }
            : group
        )
      );
    },
    onError: (error, variables) => {
      console.error("API 실패:", error, variables);
      // 실패 시 "알 수 없는 장소"로 설정
      setLocationGroups((prev) =>
        prev.map((group) =>
          group.representativeLocation.latitude === variables.latitude &&
          group.representativeLocation.longitude === variables.longitude
            ? { ...group, placeName: "알 수 없는 장소" }
            : group
        )
      );
    },
  });

  /**
   * 모든 그룹의 장소명을 가져오는 함수
   */
  const fetchAllPlaceNames = (groups: LocationGroup[]) => {
    console.log("장소명 가져오기 시작, 그룹 수:", groups.length);
    console.log("전체 그룹 데이터:", JSON.stringify(groups, null, 2));

    // 각 그룹에 대해 mutation 실행
    groups.forEach((group, index) => {
      const locationData = {
        latitude: group.representativeLocation.latitude,
        longitude: group.representativeLocation.longitude,
      };

      console.log(`그룹 ${index + 1} 처리:`, locationData);
      console.log(
        `그룹 ${index + 1} representativeLocation:`,
        group.representativeLocation
      );

      // mutation 호출
      placeNameMutation.mutate(locationData);
    });
  };

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
        selectionLimit: Math.max(1, 15 - selectedImages.length),
        quality: 0.9,
        exif: true, // ★ 핵심: EXIF 요청
      });

      if (!result.canceled && result.assets?.length) {
        // 먼저 로딩 시작
        setIsLoading(true);

        const newImagesBase: ImageWithLocation[] =
          result.assets?.map((asset: any) => ({
            uri: asset.uri,
            filename:
              asset.fileName ||
              asset.filename ||
              asset.uri.split("/").pop() ||
              undefined,
          })) ?? [];

        // 기본 이미지 정보 먼저 추가
        // setSelectedImages((prev) => [...prev, ...newImagesBase].slice(0, 9));

        // EXIF 및 메타데이터 처리
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
          return Array.from(mapByUri.values()).slice(0, 15);
        });

        // ★ 렌더 커밋(그룹화 포함) 이후에 로더 내리기
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsLoading(false));
        });
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

        // 먼저 로딩 시작
        setIsLoading(true);

        const base: ImageWithLocation = {
          uri: a.uri,
          filename:
            a.fileName || a.fileName || a.uri.split("/").pop() || undefined,
        };

        // 기본 이미지 정보 먼저 추가
        // setSelectedImages((prev) => [...prev, base].slice(0, 9));

        // EXIF 및 메타데이터 처리
        const fromExif = tryGetFromExif(a.exif);
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

        // ★ 메타 완료된 객체로 한 번에 추가
        setSelectedImages((prev) => [...prev, withLoc].slice(0, 15));

        // ★ 커밋 뒤 로더 해제
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsLoading(false));
        });
      }
    } catch (error) {
      console.error("사진 촬영 중 오류:", error);
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 모달이 닫힐 때 모든 상태값 초기화
  const handleClose = () => {
    setSelectedImages([]);
    setIsLoading(false);
    onClose();
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

  // 그룹화된 이미지들
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);

  // 이미지가 변경될 때마다 그룹화하고 장소명 가져오기
  useEffect(() => {
    const groups = groupImagesByLocation(selectedImages);

    // 기존 그룹의 장소명을 보존하면서 새로운 그룹 설정
    setLocationGroups((prevGroups) => {
      const newGroups = groups.map((newGroup) => {
        // 기존 그룹에서 같은 위치의 그룹 찾기
        const existingGroup = prevGroups.find(
          (existingGroup) =>
            Math.abs(
              existingGroup.representativeLocation.latitude -
                newGroup.representativeLocation.latitude
            ) < 0.001 &&
            Math.abs(
              existingGroup.representativeLocation.longitude -
                newGroup.representativeLocation.longitude
            ) < 0.001
        );

        // 기존 그룹이 있으면 장소명을 유지, 없으면 새로운 그룹 반환
        return existingGroup
          ? { ...newGroup, placeName: existingGroup.placeName }
          : newGroup;
      });

      return newGroups;
    });

    // 새로운 그룹에만 장소명 API 호출
    const newGroups = groups.filter((newGroup) => {
      return !locationGroups.some(
        (existingGroup) =>
          Math.abs(
            existingGroup.representativeLocation.latitude -
              newGroup.representativeLocation.latitude
          ) < 0.001 &&
          Math.abs(
            existingGroup.representativeLocation.longitude -
              newGroup.representativeLocation.longitude
          ) < 0.001
      );
    });

    if (newGroups.length > 0) {
      fetchAllPlaceNames(newGroups);
    }
  }, [selectedImages]);

  const renderLocationGroup = (group: LocationGroup, index: number) => {
    const maxDisplayImages = 4;
    const displayImages = group.images.slice(0, maxDisplayImages);
    const remainingCount = Math.max(0, group.images.length - maxDisplayImages);

    return (
      <View
        key={group.id}
        style={[styles.frameParent4, styles.frameParentSpaceBlock]}
      >
        {/* 장소 정보 헤더 */}
        <View style={styles.frameParent5}>
          <View style={styles.frameParent6}>
            <Ionicons
              name="location"
              style={styles.frameChildLayout}
              size={24}
              color="#FF6B9D"
            />
            <View style={styles.frameParent7}>
              <View style={styles.container}>
                <Text style={styles.text8}>
                  {group.placeName ? group.placeName : "알 수 없는 장소"}
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
              color="#666"
            />
          </View>
        </View>

        {/* 이미지 미리보기 */}
        <View style={styles.frameParent8}>
          {displayImages.length <= 2 ? (
            <View style={styles.imageGridContainer}>
              {displayImages.map((img, imgIndex) => (
                <View
                  key={img.uri}
                  style={[
                    styles.imageGridItem,
                    displayImages.length === 1 && styles.singleImageItem,
                    displayImages.length === 2 && styles.twoImageItem,
                  ]}
                >
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.previewImage}
                  />
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
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageGridContainer}
              contentContainerStyle={styles.imageGridContent}
            >
              {displayImages.map((img, imgIndex) => (
                <View
                  key={img.uri}
                  style={[styles.imageGridItem, styles.multiImageItem]}
                >
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.previewImage}
                  />
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
                <View
                  style={[
                    styles.imageGridItem,
                    styles.remainingCountContainer,
                    styles.multiImageItem,
                  ]}
                >
                  <View style={styles.remainingCountOverlay}>
                    <Text style={styles.remainingCountText}>
                      +{remainingCount}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
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

        {/* 액션 버튼들 */}
        <View style={[styles.frameParent10, styles.frameParentFlexBox]}>
          <TouchableOpacity
            style={[
              styles.wrapper3,
              styles.wrapperFlexBox,
              styles.actionButton,
            ]}
          >
            <Ionicons name="create-outline" size={16} color="#666" />
            <Text style={[styles.textTypo, styles.actionButtonText]}>
              메모 추가
            </Text>
          </TouchableOpacity>
          <View style={styles.frameWrapper}>
            <TouchableOpacity
              style={[
                styles.wrapper4,
                styles.wrapperFlexBox,
                styles.actionButton,
              ]}
            >
              <Ionicons name="star-outline" size={16} color="#666" />
              <Text style={[styles.textTypo, styles.actionButtonText]}>
                평점 추가
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderAddImageButton = () => {
    if (selectedImages.length >= 15) return null;

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
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.parent}>
        {/* 간단한 로딩 화면 */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FF6B9D" />
              <Text style={styles.loadingText}>
                사진에서 날짜와 장소를 추출하고 있어요...
              </Text>
            </View>
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
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
                {locationGroups.length > 0 ? (
                  <>
                    {locationGroups.map((group, index) =>
                      renderLocationGroup(group, index)
                    )}
                    {renderAddImageButton()}
                  </>
                ) : (
                  renderAddImageButton()
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 다음 버튼 - 하단 고정 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleClose}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default DateRecordModalFigma;
