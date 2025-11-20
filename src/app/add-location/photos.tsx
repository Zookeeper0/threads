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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 더미 이미지 URL (실제로는 사용자의 사진 라이브러리에서 가져옴)
const dummyImages = [
  "http://localhost:3845/assets/9b8974a5e686ef8741ef4f404e037c71632b80a3.png",
  "http://localhost:3845/assets/82db08c3a962ddb03457b9f6dcc8c17bb49699fe.png",
  "http://localhost:3845/assets/e4b7d81d22483211645f93f117300e35f95858ce.png",
  "http://localhost:3845/assets/73b38b2f9233fe14405af7d470c20bf9e76485a6.png",
  "http://localhost:3845/assets/cb226369901149124ebb988c25a4422d5d93b044.png",
  "http://localhost:3845/assets/411e9c47c545866a29d7efcc67e3dc2c6a8feb8a.png",
  "http://localhost:3845/assets/00051e64329ace8471c939de1329245401091783.png",
  "http://localhost:3845/assets/b79c59f2a8cbf73c05fe0ea2456139a54f151091.png",
  "http://localhost:3845/assets/9b8974a5e686ef8741ef4f404e037c71632b80a3.png",
];

const MAX_SELECTED = 5;

export default function AddLocationPhotos() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const placeName = (params.placeName as string) || "장소";
  const placeAddress = (params.placeAddress as string) || "";
  const category = (params.category as string) || "";

  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());

  const handlePhotoPress = (index: number) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      if (newSelected.size < MAX_SELECTED) {
        newSelected.add(index);
      }
    }
    setSelectedPhotos(newSelected);
  };

  const handleSave = () => {
    if (selectedPhotos.size === MAX_SELECTED) {
      // 저장 로직 (TODO)
      // 저장 후 앨범 상세 페이지로 이동
      router.back();
      router.back();
      router.back(); // 3단계 뒤로가기
    }
  };

  const getSelectedOrder = (index: number): number | null => {
    if (!selectedPhotos.has(index)) return null;
    return Array.from(selectedPhotos).sort().indexOf(index) + 1;
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#31170F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{placeName}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>3/3</Text>
          <Text style={styles.selectCountText}>
            사진 5장을 골라주세요.{" "}
            <Text style={styles.selectCountBold}>
              {selectedPhotos.size}/{MAX_SELECTED}
            </Text>
          </Text>
        </View>

        {/* Hint */}
        <View style={styles.hintContainer}>
          <Ionicons name="bulb-outline" size={16} color="#6F5B52" />
          <Text style={styles.hintText}>선택한 5장만 앨범에 기록돼요.</Text>
        </View>

        {/* View All Dropdown */}
        <TouchableOpacity style={styles.viewAllContainer} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>전체보기</Text>
          <Ionicons name="chevron-down" size={16} color="#6F5B52" />
        </TouchableOpacity>

        {/* Photo Grid */}
        <View style={styles.photoGrid}>
          {dummyImages.map((imageUri, index) => {
            const isSelected = selectedPhotos.has(index);
            const selectedOrder = getSelectedOrder(index);
            const isMaxReached = selectedPhotos.size >= MAX_SELECTED && !isSelected;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.photoContainer,
                  isSelected && styles.photoContainerSelected,
                  isMaxReached && styles.photoContainerDisabled,
                ]}
                onPress={() => handlePhotoPress(index)}
                disabled={isMaxReached}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.photo}
                  contentFit="cover"
                />
                {isSelected && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>
                        {selectedOrder}
                      </Text>
                    </View>
                  </View>
                )}
                {isMaxReached && (
                  <View style={styles.disabledOverlay}>
                    <View style={styles.disabledBadge}>
                      <Text style={styles.disabledBadgeText}>img</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedPhotos.size !== MAX_SELECTED && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={selectedPhotos.size !== MAX_SELECTED}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    height: 51,
  },
  headerButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#31170F",
    letterSpacing: -0.36,
  },
  headerRight: {
    width: 24,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
  },
  selectCountText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  selectCountBold: {
    fontWeight: "600",
    color: "#FF6638",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6F5B52",
    letterSpacing: -0.28,
  },
  viewAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E3E0",
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoContainer: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E8E3E0",
  },
  photoContainerSelected: {
    borderWidth: 2,
    borderColor: "#FF6638",
  },
  photoContainerDisabled: {
    opacity: 0.5,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6638",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledBadge: {
    backgroundColor: "#F5F1EF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  disabledBadgeText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#A0A0A0",
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E3E0",
  },
  saveButton: {
    backgroundColor: "#FF6638",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5A1B05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#E8E3E0",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
});

