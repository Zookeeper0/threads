import Toast from "@/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Figma에서 가져온 이미지 URL (album.tsx와 동일한 데이터 사용)
const imgAlbumCover = require("../../../assets/images/imgAlbumCover.png");
const img9 = require("../../../assets/images/subImage1.png");
const img10 = require("../../../assets/images/subImage1.png");

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

interface TimelineItem {
  id: string;
  date: string;
  images: string[];
  location: string;
  comments: {
    id: string;
    profileImage: string;
    text: string;
    emoji?: string;
  }[];
}

// 타임라인 아이템 더미 데이터
const timelineItems: TimelineItem[] = [
  {
    id: "1",
    date: "2025. 11. 3.",
    images: [imgAlbumCover, img9, img10],
    location: "모수 서울",
    comments: [
      {
        id: "1",
        profileImage: img9,
        text: "생일 축하해",
        emoji: "❤️",
      },
      {
        id: "2",
        profileImage: img10,
        text: "고마웡",
        emoji: "❤️",
      },
    ],
  },
  {
    id: "2",
    date: "2025. 11. 3.",
    images: [imgAlbumCover, img9, img10],
    location: "모수 서울",
    comments: [
      {
        id: "1",
        profileImage: img9,
        text: "생일 축하해",
        emoji: "❤️",
      },
      {
        id: "2",
        profileImage: img10,
        text: "고마웡",
        emoji: "❤️",
      },
    ],
  },
];

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
  const { width: screenWidth } = useWindowDimensions();
  const { albumId } = useLocalSearchParams();
  const album = albums[albumId as string];
  const [activeTab, setActiveTab] = useState<"timeline" | "map">("timeline");

  // 화면 크기에 따른 동적 크기 계산
  const paddingHorizontal = screenWidth * 0.04; // 화면 너비의 4%
  const fontSize = {
    small: screenWidth * 0.035, // 14px 기준
    medium: screenWidth * 0.04, // 16px 기준
    large: screenWidth * 0.045, // 18px 기준
  };
  const iconSize = screenWidth * 0.05; // 화면 너비의 5%

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
        {activeTab === "timeline" ? (
          <ScrollView
            style={styles.timelineContainer}
            contentContainerStyle={[
              styles.timelineContent,
              { paddingHorizontal, paddingBottom: paddingHorizontal * 1.5 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {timelineItems.length > 0 ? (
              timelineItems.map((item) => (
                <TimelineItemComponent key={item.id} item={item} />
              ))
            ) : (
              <View
                style={[
                  styles.emptyState,
                  { paddingHorizontal: paddingHorizontal * 1.25 },
                ]}
              >
                <Text
                  style={[
                    styles.emptyStateTitle,
                    {
                      fontSize: fontSize.large,
                      marginBottom: paddingHorizontal * 2,
                    },
                  ]}
                >
                  오늘의 추억을 사진과 장소로 기록해보세요!
                </Text>

                {/* 장소 추가하기 버튼 */}
                <TouchableOpacity
                  style={[
                    styles.addPlaceButton,
                    {
                      paddingVertical: paddingHorizontal * 0.875,
                      paddingHorizontal: paddingHorizontal * 1.5,
                      gap: paddingHorizontal * 0.5,
                      marginBottom: paddingHorizontal * 1.25,
                    },
                  ]}
                  onPress={() => {
                    router.push("/add-location");
                  }}
                >
                  <Ionicons name="add" size={iconSize} color="#FFFFFF" />
                  <Text
                    style={[styles.addPlaceText, { fontSize: fontSize.medium }]}
                  >
                    장소 추가하기
                  </Text>
                </TouchableOpacity>

                {/* 사진부터 고를게요 링크 */}
                <TouchableOpacity
                  style={[
                    styles.selectPhotosLink,
                    {
                      gap: paddingHorizontal * 0.375,
                      paddingVertical: paddingHorizontal * 0.5,
                    },
                  ]}
                  onPress={() => {
                    // TODO: 사진 선택 기능 구현
                  }}
                >
                  <Ionicons
                    name="camera-outline"
                    size={iconSize * 0.8}
                    color="#6F5B52"
                  />
                  <Text
                    style={[
                      styles.selectPhotosText,
                      { fontSize: fontSize.small },
                    ]}
                  >
                    사진부터 고를게요.
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.mapContainer}>
            <Text
              style={[styles.mapPlaceholder, { fontSize: fontSize.medium }]}
            >
              지도 뷰
            </Text>
          </View>
        )}

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

// 타임라인 아이템 컴포넌트
function TimelineItemComponent({ item }: { item: TimelineItem }) {
  const [showAllImages, setShowAllImages] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const totalImages = item.images.length;
  const displayImages = showAllImages ? item.images : item.images.slice(0, 3);
  const remainingCount = totalImages - 3;

  // 화면 크기에 따른 동적 크기 계산
  const paddingHorizontal = screenWidth * 0.04; // 화면 너비의 4%
  const imageGridHeight = screenWidth * 0.5; // 화면 너비의 40%

  const gap = screenWidth * 0.02; // 화면 너비의 2%
  const iconSize = screenWidth * 0.04; // 화면 너비의 4%
  const avatarSize = screenWidth * 0.06; // 화면 너비의 6%
  const fontSize = {
    small: screenWidth * 0.035, // 14px 기준
    medium: screenWidth * 0.04, // 16px 기준
    large: screenWidth * 0.045, // 18px 기준
  };

  const marginBottom = screenWidth * 0.08; // 화면 너비의 8%
  const smallPadding = screenWidth * 0.015; // 화면 너비의 1.5%

  return (
    <View style={[styles.timelineItem, { marginBottom }]}>
      {/* 날짜 */}
      <View
        style={[
          styles.dateContainer,
          {
            paddingHorizontal: paddingHorizontal * 0.625,
            paddingVertical: smallPadding,
            gap,
            marginBottom: paddingHorizontal,
          },
        ]}
      >
        <Text style={[styles.dateText, { fontSize: fontSize.small }]}>
          {item.date}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={iconSize * 0.875}
          color="#737373"
        />
      </View>

      {/* 이미지 그리드 */}
      <View
        style={[
          styles.imageGrid,
          { height: imageGridHeight, gap, marginBottom: paddingHorizontal },
        ]}
      >
        {/* 왼쪽 큰 이미지 */}
        <View style={styles.largeImageContainer}>
          <Image
            source={displayImages[0]}
            style={styles.largeImage}
            contentFit="cover"
          />
        </View>

        {/* 오른쪽 작은 이미지들 */}
        <View style={[styles.smallImagesContainer, { gap }]}>
          {displayImages.slice(1, 3).map((image, index) => (
            <View key={index} style={styles.smallImageWrapper}>
              <Image
                source={image}
                style={styles.smallImage}
                contentFit="cover"
              />
              {/* 마지막 이미지에 +2 오버레이 */}
              {index === 1 && remainingCount > 0 && (
                <View style={styles.imageOverlay}>
                  <Text
                    style={[
                      styles.imageOverlayText,
                      { fontSize: fontSize.large },
                    ]}
                  >
                    +{remainingCount}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 위치 */}
      <View
        style={[
          styles.locationContainer,
          { gap, marginBottom: paddingHorizontal },
        ]}
      >
        <Ionicons name="location" size={iconSize} color="#FF6638" />
        <Text style={[styles.locationText, { fontSize: fontSize.small }]}>
          {item.location}
        </Text>
        <TouchableOpacity style={styles.editLocationButton}>
          <Ionicons
            name="pencil-outline"
            size={iconSize * 0.875}
            color="#737373"
          />
        </TouchableOpacity>
      </View>

      {/* 댓글 */}
      <View style={[styles.commentsContainer, { gap: gap * 1.25 }]}>
        {item.comments.map((comment) => (
          <View key={comment.id} style={[styles.comment, { gap }]}>
            <Image
              source={comment.profileImage}
              style={[
                styles.commentAvatar,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
              contentFit="cover"
            />
            <Text style={[styles.commentText, { fontSize: fontSize.small }]}>
              {comment.text} {comment.emoji}
            </Text>
          </View>
        ))}
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
  tabHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F5F1EF",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#31170F",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#737373",
    letterSpacing: -0.28,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  timelineContainer: {
    flex: 1,
  },
  timelineContent: {
    // paddingHorizontal과 paddingBottom은 동적으로 계산됨
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    fontSize: 16,
    color: "#737373",
  },
  timelineItem: {
    // marginBottom은 동적으로 계산됨
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F1EF",
    borderRadius: 8,
    alignSelf: "flex-start",
    // gap, paddingHorizontal, paddingVertical, marginBottom은 동적으로 계산됨
  },
  dateText: {
    fontWeight: "500",
    color: "#737373",
    letterSpacing: -0.28,
    fontFamily: "Pretendard Variable",
    // fontSize는 동적으로 계산됨
  },
  imageGrid: {
    flexDirection: "row",
    // gap, height, marginBottom은 동적으로 계산됨
  },
  largeImageContainer: {
    flex: 1.3,
    height: "100%",
  },
  largeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  smallImagesContainer: {
    flex: 1,
    height: "100%",
    // gap은 동적으로 계산됨
  },
  smallImageWrapper: {
    flex: 1,
    position: "relative",
  },
  smallImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlayText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Pretendard",
    // fontSize는 동적으로 계산됨
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    // gap, marginBottom은 동적으로 계산됨
  },
  locationText: {
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.28,
    flex: 1,
    fontFamily: "Pretendard Variable",
    // fontSize는 동적으로 계산됨
  },
  editLocationButton: {
    padding: 4,
  },
  commentsContainer: {
    // gap은 동적으로 계산됨
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    // gap은 동적으로 계산됨
  },
  commentAvatar: {
    // width, height, borderRadius는 동적으로 계산됨
  },
  commentText: {
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.28,
    fontFamily: "Pretendard Variable",
    // fontSize는 동적으로 계산됨
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal은 동적으로 계산됨
  },
  emptyStateTitle: {
    fontWeight: "600",
    color: "#31170F",
    textAlign: "center",
    letterSpacing: -0.36,
    lineHeight: 28,
    // fontSize, marginBottom은 동적으로 계산됨
  },
  addPlaceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6638",
    borderRadius: 12,
    shadowColor: "#5A1B05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    // paddingVertical, paddingHorizontal, gap, marginBottom은 동적으로 계산됨
  },
  addPlaceText: {
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.32,
    // fontSize는 동적으로 계산됨
  },
  selectPhotosLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // gap, paddingVertical은 동적으로 계산됨
  },
  selectPhotosText: {
    fontWeight: "500",
    color: "#6F5B52",
    letterSpacing: -0.28,
    textDecorationLine: "underline",
    // fontSize는 동적으로 계산됨
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
