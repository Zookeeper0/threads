/**
 * 권한 관련 유틸리티 함수들
 */

import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";

/**
 * 갤러리 접근 권한 확인 및 요청
 * @returns 권한 허용 여부
 */
export const ensurePickerPermission = async (): Promise<boolean> => {
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

/**
 * 카메라 접근 권한 확인 및 요청
 * @returns 권한 허용 여부
 */
export const ensureCameraPermission = async (): Promise<boolean> => {
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

/**
 * MediaLibrary에서 자산 상세 정보를 조회해 좌표/생성일 얻기
 * @param assetId 자산 ID
 * @returns 좌표와 날짜 정보
 */
export const tryGetFromMediaLibrary = async (assetId?: string) => {
  if (!assetId) return {};

  try {
    // MediaLibrary 권한 확인
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
