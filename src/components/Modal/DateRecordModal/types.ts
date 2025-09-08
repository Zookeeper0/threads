/**
 * DateRecordModal 관련 타입 정의
 */

// 이미지와 위치 정보를 포함한 인터페이스
export interface ImageWithLocation {
  uri: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  date?: string;
  filename?: string;
}

// 위치 기반으로 그룹화된 이미지 그룹
export interface LocationGroup {
  id: string;
  images: ImageWithLocation[];
  representativeLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  count: number;
  placeName?: string; // 장소명
  roadAddress?: string; // 도로명 주소
  rating?: number; // 평점 (1-5)
  memo?: string; // 메모
}

// 좌표와 날짜 정보
export type CoordsDate = {
  latitude?: number;
  longitude?: number;
  date?: string;
};

// 모달 공통 Props
export interface ModalCommonProps {
  visible: boolean;
  onClose: () => void;
}

// DateRecordModal 전용 Props
export interface DateRecordModalFigmaProps extends ModalCommonProps {
  onLoadingChange?: (loading: boolean) => void;
}

// API 응답 타입
export interface LocationSearchResponse {
  place_name: string;
  // 다른 필드들도 있을 수 있음
}

// API 요청 타입
export interface LocationSearchRequest {
  latitude: number;
  longitude: number;
}
