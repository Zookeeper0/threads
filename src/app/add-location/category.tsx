import { Ionicons } from "@expo/vector-icons";
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

interface Category {
  id: string;
  name: string;
  iconName: string;
}

const categories: Category[] = [
  { id: "restaurant", name: "식당", iconName: "restaurant" },
  { id: "cafe", name: "카페", iconName: "cafe" },
  { id: "bar", name: "술집", iconName: "wine" },
  { id: "shopping", name: "쇼핑", iconName: "bag" },
  { id: "culture", name: "문화생활", iconName: "film" },
  { id: "activity", name: "액티비티", iconName: "bicycle" },
  { id: "tourism", name: "관광", iconName: "camera" },
  { id: "other", name: "기타", iconName: "ellipsis-horizontal" },
];

export default function AddLocationCategory() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const placeName = (params.placeName as string) || "장소";
  const placeAddress = (params.placeAddress as string) || "";
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSave = () => {
    if (selectedCategory) {
      // 사진 선택 화면으로 이동
      router.push({
        pathname: "/add-location/photos",
        params: {
          placeName,
          placeAddress,
          category: selectedCategory,
        },
      });
    }
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
        <Text style={styles.headerTitle}>장소 추가</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <Text style={styles.progressText}>2/3</Text>

        {/* Place Name */}
        <Text style={styles.placeName}>{placeName}</Text>

        {/* Question */}
        <Text style={styles.questionText}>어떤 카테고리의 장소인가요?</Text>

        {/* Category Grid */}
        <View style={styles.categoryGrid}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonSelected,
                ]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIconContainer,
                    isSelected && styles.categoryIconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={category.iconName as any}
                    size={36}
                    color={isSelected ? "#FF6638" : "#6F5B52"}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
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
            !selectedCategory && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!selectedCategory}
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
  progressText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
    marginBottom: 8,
  },
  placeName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.48,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.32,
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
    justifyContent: "space-between",
  },
  categoryButton: {
    width: "21%",
    alignItems: "center",
    gap: 12,
  },
  categoryButtonSelected: {
    // 선택된 상태 스타일 (필요시 추가)
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#F5F1EF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E3E0",
  },
  categoryIconContainerSelected: {
    backgroundColor: "#FFF5F2",
    borderColor: "#FF6638",
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6F5B52",
    letterSpacing: -0.28,
    textAlign: "center",
  },
  categoryTextSelected: {
    color: "#FF6638",
    fontWeight: "600",
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

