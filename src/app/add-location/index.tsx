import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 아이콘 이미지
const imgSearch = require("../../assets/svg/search.svg");
const imgLocation = require("../../assets/svg/map-pin-fill.svg");

interface SearchResult {
  id: string;
  name: string;
  address: string;
  distance: string;
}

const dummySearchResults: SearchResult[] = [
  {
    id: "1",
    name: "모수 서울",
    address: "서울특별시 용산구 회나무로41길 4",
    distance: "3.6km",
  },
];

export default function AddLocationSearch() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // 검색 로직 (임시로 더미 데이터 표시)
    if (text.length > 0) {
      setSearchResults(dummySearchResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    // 카테고리 선택 화면으로 이동
    router.push({
      pathname: "/add-location/category",
      params: {
        placeName: result.name,
        placeAddress: result.address,
      },
    });
  };

  const handleMapPress = () => {
    // 지도에서 찾기 기능 (TODO)
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress */}
          <Text style={styles.progressText}>1/3</Text>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>장소 검색</Text>

          {/* Question */}
          <Text style={styles.questionText}>어디를 다녀오셨나요?</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Image
              source={imgSearch}
              style={styles.searchIcon}
              contentFit="contain"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="장소를 검색해주세요."
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
          </View>

          {/* Map Button */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleMapPress}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={20} color="#FFFFFF" />
            <Text style={styles.mapButtonText}>지도에서 찾기</Text>
          </TouchableOpacity>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultItem}
                  onPress={() => handleResultPress(result)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={imgLocation}
                    style={styles.locationIcon}
                    contentFit="contain"
                  />
                  <View style={styles.resultContent}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultAddress}>{result.address}</Text>
                  </View>
                  <Text style={styles.resultDistance}>{result.distance}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  sectionTitle: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F1EF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 12,
    height: 52,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.32,
    padding: 0,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6638",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 32,
    shadowColor: "#5A1B05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  resultsContainer: {
    gap: 12,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E3E0",
  },
  locationIcon: {
    width: 20,
    height: 20,
  },
  resultContent: {
    flex: 1,
    gap: 4,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  resultAddress: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
  },
  resultDistance: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
  },
});
