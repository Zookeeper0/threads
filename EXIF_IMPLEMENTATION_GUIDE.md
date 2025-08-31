ㄱ# EXIF 데이터 구현 가이드

## 현재 구현 상태

현재 `DateRecordModal` 컴포넌트는 기본적인 EXIF 파싱을 구현하고 있습니다. 하지만 실제 프로덕션 환경에서는 더 정교한 패키지를 사용하는 것을 권장합니다.

## 권장 패키지

### 1. react-native-exif (권장)

```bash
npm install react-native-exif
```

**장점:**

- 안정적이고 검증된 패키지
- GPS, 날짜, 카메라 설정 등 다양한 메타데이터 추출
- TypeScript 지원

**사용 예시:**

```typescript
import ExifReader from "react-native-exif";

const extractGPSFromImage = async (uri: string) => {
  try {
    const exifData = await ExifReader.read(uri);

    if (exifData.GPSLatitude && exifData.GPSLongitude) {
      return {
        latitude: exifData.GPSLatitude,
        longitude: exifData.GPSLongitude,
        date: exifData.DateTime,
      };
    }

    return {};
  } catch (error) {
    console.log("EXIF 읽기 실패:", error);
    return {};
  }
};
```

### 2. expo-media-library

```bash
npx expo install expo-media-library
```

**장점:**

- Expo 공식 패키지
- 이미지 메타데이터에 직접 접근
- 권한 관리 포함

**사용 예시:**

```typescript
import * as MediaLibrary from "expo-media-library";

const extractGPSFromImage = async (uri: string) => {
  try {
    const asset = await MediaLibrary.createAssetAsync(uri);

    if (asset.location) {
      return {
        latitude: asset.location.latitude,
        longitude: asset.location.longitude,
        date: asset.creationTime,
      };
    }

    return {};
  } catch (error) {
    console.log("메타데이터 읽기 실패:", error);
    return {};
  }
};
```

### 3. react-native-image-metadata

```bash
npm install react-native-image-metadata
```

**장점:**

- 다양한 이미지 형식 지원
- 상세한 메타데이터 추출
- 성능 최적화

## 현재 구현의 한계

1. **기본적인 EXIF 파싱만 구현**

   - JPEG 파일의 APP1 마커만 지원
   - 복잡한 EXIF 구조 처리 제한적

2. **에러 처리 부족**

   - 다양한 이미지 형식에 대한 대응 부족
   - 메모리 사용량 최적화 필요

3. **성능 이슈**
   - 큰 이미지 파일 처리 시 지연 가능
   - Base64 변환으로 인한 메모리 사용량 증가

## 개선 방향

### 1. 단계적 구현

```typescript
const extractGPSFromImage = async (uri: string) => {
  try {
    // 1단계: expo-media-library 시도
    const mediaData = await tryMediaLibrary(uri);
    if (mediaData.success) return mediaData.data;

    // 2단계: react-native-exif 시도
    const exifData = await tryExifReader(uri);
    if (exifData.success) return exifData.data;

    // 3단계: 현재 구현된 파서 시도
    const customData = await tryCustomParser(uri);
    if (customData.success) return customData.data;

    // 4단계: 시뮬레이션 데이터 반환
    return getSimulatedData();
  } catch (error) {
    console.log("모든 방법 실패:", error);
    return getSimulatedData();
  }
};
```

### 2. 캐싱 구현

```typescript
const exifCache = new Map<string, any>();

const extractGPSFromImageWithCache = async (uri: string) => {
  if (exifCache.has(uri)) {
    return exifCache.get(uri);
  }

  const result = await extractGPSFromImage(uri);
  exifCache.set(uri, result);

  return result;
};
```

### 3. 배치 처리

```typescript
const extractGPSFromMultipleImages = async (uris: string[]) => {
  const results = await Promise.allSettled(
    uris.map((uri) => extractGPSFromImage(uri))
  );

  return results.map((result, index) => ({
    uri: uris[index],
    data: result.status === "fulfilled" ? result.value : {},
  }));
};
```

## 권장사항

1. **개발 단계**: 현재 구현 사용 (시뮬레이션 데이터 포함)
2. **테스트 단계**: react-native-exif 또는 expo-media-library 도입
3. **프로덕션**: 안정적인 패키지 사용 + 폴백 구현

## 참고 자료

- [EXIF 표준](https://exif.org/Exif2-2.PDF)
- [JPEG 파일 구조](https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format)
- [TIFF/EP 표준](https://www.loc.gov/preservation/digital/formats/fdd/fdd000022.shtml)
