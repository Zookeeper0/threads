import { Image } from "expo-image";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Figma에서 가져온 이미지 URL
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
const imgChevronDown =
  "http://localhost:3845/assets/f6be0256a2e32d04a042365428f853cd752022e7.svg";
const imgCalendar =
  "http://localhost:3845/assets/eb918f77a07558ddba35b11a9823509d3d59b4fb.svg";
const imgPlus =
  "http://localhost:3845/assets/48f85a95a20f763a8bb4bf64c589686832ffec89.svg";

interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  profiles: string[];
  position: "top-right" | "bottom-left";
}

const albums: Album[] = [
  {
    id: "1",
    title: "슈퍼 잼민이",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover,
    profiles: [img9, img10],
    position: "bottom-left",
  },
  {
    id: "2",
    title: "해달 생일 🎂",
    description: "수달 님이 앨범을 생성했어요.",
    coverImage: imgAlbumCover1,
    profiles: [img10],
    position: "top-right",
  },
  {
    id: "3",
    title: "청도 글램핑",
    description: "해달 님이 장소를 추가했어요.",
    coverImage: imgAlbumCover2,
    profiles: [img9, img10],
    position: "top-right",
  },
  {
    id: "4",
    title: "한강 산책만 3번째",
    description: "해달 님이 장소를 추가했어요.",
    coverImage: imgAlbumCover3,
    profiles: [img9, img10],
    position: "top-right",
  },
  {
    id: "5",
    title: "슈퍼 잼민이",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover4,
    profiles: [img9, img10],
    position: "top-right",
  },
  {
    id: "6",
    title: "타코야끼 원정대!",
    description: "수달 님이 앨범에 캡션을 남겼어요.",
    coverImage: imgAlbumCover5,
    profiles: [img9, img10],
    position: "top-right",
  },
];

export default function AlbumView() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [sortOrder, setSortOrder] = useState("최신순");

  return (
    <View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 필터 바 */}
        <View style={styles.filterBar}>
          <View style={styles.filters}>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>{sortOrder}</Text>
              <Image
                source={{ uri: imgChevronDown }}
                style={styles.chevronIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
            <View style={styles.calendarButton}>
              <Image
                source={{ uri: imgCalendar }}
                style={styles.calendarIcon}
                contentFit="contain"
              />
            </View>
          </View>
        </View>

        {/* 앨범 그리드 */}
        <View style={styles.albumGrid}>
          {albums.map((album) => (
            <View key={album.id} style={styles.albumCard}>
              <Image
                source={{ uri: album.coverImage }}
                style={styles.albumCover}
                contentFit="cover"
              />
              {/* 프로필 그룹 */}
              {album.position === "bottom-left" ? (
                <View style={styles.profileGroupBottomLeft}>
                  {album.profiles.map((profile, index) => (
                    <View
                      key={index}
                      style={[
                        styles.profile,
                        index > 0 && styles.profileOverlap,
                      ]}
                    >
                      <Image
                        source={{ uri: profile }}
                        style={styles.profileImage}
                        contentFit="cover"
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.profileGroupTopRight}>
                  {album.profiles.map((profile, index) => (
                    <View
                      key={index}
                      style={[
                        styles.profile,
                        index > 0 && styles.profileOverlap,
                      ]}
                    >
                      <Image
                        source={{ uri: profile }}
                        style={styles.profileImage}
                        contentFit="cover"
                      />
                    </View>
                  ))}
                </View>
              )}
              {/* 앨범 정보 */}
              <View style={styles.albumInfo}>
                <Text style={styles.albumTitle}>{album.title}</Text>
                <Text style={styles.albumDescription}>{album.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 플로팅 추가 버튼 */}
      <TouchableOpacity style={styles.addButton}>
        <Image
          source={{ uri: imgPlus }}
          style={styles.addIcon}
          contentFit="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FFFCF8",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "flex-end",
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dropdown: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#877A74",
    letterSpacing: -0.28,
  },
  chevronIcon: {
    width: 14,
    height: 14,
  },
  calendarButton: {
    backgroundColor: "#F3E5D1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 10,
    alignItems: "center",
  },
  calendarIcon: {
    width: 16,
    height: 16,
  },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  albumCard: {
    width: 156,
    height: 156,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 41,
    elevation: 3,
    position: "relative",
  },
  albumCover: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  profileGroupTopRight: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
  },
  profileGroupBottomLeft: {
    position: "absolute",
    bottom: 52,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 18,
  },
  profile: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
    marginLeft: -6,
  },
  profileOverlap: {
    marginLeft: -6,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  albumInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FAEFDF",
    padding: 8,
    gap: 10,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  albumDescription: {
    fontSize: 10,
    fontWeight: "500",
    color: "#877A74",
    letterSpacing: -0.2,
    lineHeight: 16,
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF6638",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5A1B05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  addIcon: {
    width: 24,
    height: 24,
  },
});

