import Toast from "@/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Figma에서 가져온 이미지 URL (album.tsx와 동일한 데이터 사용)
const imgAlbumCover =
  "http://localhost:3845/assets/9b8974a5e686ef8741ef4f404e037c71632b80a3.png";
const img9 =
  "http://localhost:3845/assets/00051e64329ace8471c939de1329245401091783.png";
const img10 =
  "http://localhost:3845/assets/b79c59f2a8cbf73c05fe0ea2456139a54f151091.png";
const imgAlbumCover1 =
  "http://localhost:3845/assets/82db08c3a962ddb03457b9f6dcc8c17bb49699fe.png";
const imgAlbumCover2 =
  "http://localhost:3845/assets/e4b7d81d22483211645f93f117300e35f95858ce.png";
const imgAlbumCover3 =
  "http://localhost:3845/assets/73b38b2f9233fe14405af7d470c20bf9e76485a6.png";
const imgAlbumCover4 =
  "http://localhost:3845/assets/cb226369901149124ebb988c25a4422d5d93b044.png";
const imgAlbumCover5 =
  "http://localhost:3845/assets/411e9c47c545866a29d7efcc67e3dc2c6a8feb8a.png";

// 더미 데이터 (실제로는 API에서 가져와야 함)
interface Album {
  id: string;
  title: string;
  description: string;
  coveeImage: string;
  profiles: string[];
  position: "top-right" | "bottom-left";
}

const albums: Record<string, Album> = {
  "1": {
    id: "1",
    title: "슈퍼 잼민이",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coveeImage: imgAlbumCover,
    profiles: [img9, img10],
    position: "bottom-left",
  },
  "2": {
    id: "2",
    title: "해달 생일 🎂",
    description: "수달 님이 앨범을 생성했어요.",
    coveeImage: imgAlbumCover1,
    profiles: [img10],
    position: "top-right",
  },
  "3": {
    id: "3",
    title: "청도 글램핑",
    description: "해달 님이 장소를 추가했어요.",
    coveeImage: imgAlbumCover2,
    profiles: [img9, img10],
    position: "top-right",
  },
  "4": {
    id: "4",
    title: "한강 산책만 3번째",
    description: "해달 님이 장소를 추가했어요.",
    coveeImage: imgAlbumCover3,
    profiles: [img9, img10],
    position: "top-right",
  },
  "5": {
    id: "5",
    title: "슈퍼 잼민이",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coveeImage: imgAlbumCover4,
    profiles: [img9, img10],
    position: "top-right",
  },
  "6": {
    id: "6",
    title: "타코야끼 원정대!",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coveeImage: imgAlbumCover5,
    profiles: [img9, img10],
    position: "top-right",
  },
  "7": {
    id: "7",
    title: "여름 바다",
    description: "수달 님이 앨범을 생성했어요.",
    coveeImage: imgAlbumCover,
    profiles: [img9, img10],
    position: "bottom-left",
  },
  "8": {
    id: "8",
    title: "강릉 여행",
    description: "해달 님이 장소를 추가했어요.",
    coveeImage: imgAlbumCover1,
    profiles: [img10],
    position: "top-right",
  },
  "9": {
    id: "9",
    title: "산 정상 정복",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coveeImage: imgAlbumCover2,
    profiles: [img9, img10],
    position: "top-right",
  },
  "10": {
    id: "10",
    title: "카페 투어",
    description: "해달 님이 장소를 추가했어요.",
    coveeImage: imgAlbumCover3,
    profiles: [img9, img10],
    position: "top-right",
  },
  "11": {
    id: "11",
    title: "야경 산책",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coveeImage: imgAlbumCover4,
    profiles: [img9, img10],
    position: "top-right",
  },
  "12": {
    id: "12",
    title: "디저트 맛집 탐방",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coveeImage: imgAlbumCover5,
    profiles: [img9, img10],
    position: "top-right",
  },
};

export default function AlbumTimeline() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { albumId } = useLocalSearchParams();
  const album = albums[albumId as string];

  if (!album) {
    return (
      <View style={styles.container}>
        <Text>앨범을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 타임라인 컨텐츠 */}
        <View style={styles.timelineContainer}>
          {/* 빈 상태 UI */}
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              오늘의 추억을 사진과 장소로 기록해보세요!
            </Text>

            {/* 장소 추가하기 버튼 */}
            <TouchableOpacity
              style={styles.addPlaceButton}
              onPress={() => {
                // TODO: 장소 추가 기능 구현
              }}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addPlaceText}>장소 추가하기</Text>
            </TouchableOpacity>

            {/* 사진부터 고를게요 링크 */}
            <TouchableOpacity
              style={styles.selectPhotosLink}
              onPress={() => {
                // TODO: 사진 선택 기능 구현
              }}
            >
              <Ionicons name="camera-outline" size={16} color="#6F5B52" />
              <Text style={styles.selectPhotosText}>사진부터 고를게요.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 토스트 메시지 */}
        <Toast
          message="앨범을 만들었어요!"
          highlightText="앨범"
          duration={2000}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9FA",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  timelineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#31170F",
    textAlign: "center",
    letterSpacing: -0.36,
    lineHeight: 28,
    marginBottom: 32,
  },
  addPlaceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6638",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
    shadowColor: "#5A1B05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  addPlaceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  selectPhotosLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  selectPhotosText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6F5B52",
    letterSpacing: -0.28,
    textDecorationLine: "underline",
  },
  bottomBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6638",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    marginTop: "auto",
    marginBottom: 20,
  },
});
