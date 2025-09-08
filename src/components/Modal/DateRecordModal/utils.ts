/**
 * DateRecordModal 유틸리티 함수들
 */

import { CoordsDate, ImageWithLocation } from "./types";

/**
 * 위도와 경도를 문자열로 변환
 * @param lat 위도
 * @param lng 경도
 * @returns 좌표 문자열 또는 undefined
 */
export const toLatLngLabel = (
  lat?: number,
  lng?: number
): string | undefined => {
  if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  return `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
};

/**
 * EXIF 데이터에서 좌표와 날짜 정보 추출 (iOS/Android 지원)
 * @param exif EXIF 데이터
 * @returns 좌표와 날짜 정보
 */
export const tryGetFromExif = (exif: any): CoordsDate => {
  if (!exif) return {};

  try {
    // iOS 패턴 처리
    if (exif["{GPS}"]) {
      const g = exif["{GPS}"];
      const lat = typeof g.Latitude === "number" ? g.Latitude : undefined;
      const lng = typeof g.Longitude === "number" ? g.Longitude : undefined;

      // 날짜 추출 (iOS는 {Exif}.DateTimeOriginal 혹은 DateTime)
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

    // Android 패턴 처리
    const lat = exif.GPSLatitude;
    const lng = exif.GPSLongitude;
    const latRef = exif.GPSLatitudeRef; // "N" or "S"
    const lngRef = exif.GPSLongitudeRef; // "E" or "W"

    let latitude: number | undefined =
      typeof lat === "number" ? lat : undefined;
    let longitude: number | undefined =
      typeof lng === "number" ? lng : undefined;

    // 남반구나 서반구 좌표 보정
    if (latitude !== undefined && latRef === "S") latitude = -latitude;
    if (longitude !== undefined && lngRef === "W") longitude = -longitude;

    // 날짜 추출 (Android)
    let dateIso: string | undefined;
    const rawDate: string | undefined = exif.DateTimeOriginal || exif.DateTime;
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
 * 위경도를 기준으로 이미지 그룹화 (0.001도 차이 내는 것을 같은 장소로 판단)
 * @param images 이미지 배열
 * @returns 그룹화된 위치 그룹 배열
 */
export const groupImagesByLocation = (images: ImageWithLocation[]) => {
  const groups: any[] = [];
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
