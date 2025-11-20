import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AuthPage {
  id: string;
  title: string;
  path: string;
  description: string;
}

const authPages: AuthPage[] = [
  {
    id: "1",
    title: "로그인",
    path: "/auth",
    description: "소셜 로그인 화면",
  },
  {
    id: "2",
    title: "이름 입력",
    path: "/auth/name",
    description: "사용자 이름 입력 화면",
  },
  {
    id: "3",
    title: "초대 코드 생성",
    path: "/auth/invite",
    description: "연인 초대 코드 생성 화면",
  },
  {
    id: "4",
    title: "초대 코드 입력",
    path: "/auth/invite-code",
    description: "초대 코드 입력 화면",
  },
];

export default function Settings() {
  const insets = useSafeAreaInsets();

  const handleNavigate = (path: string) => {
    router.push(path as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#31170F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Auth Pages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인증 페이지</Text>
          <Text style={styles.sectionDescription}>
            개발 및 테스트를 위한 인증 관련 페이지로 이동합니다.
          </Text>

          {authPages.map((page) => (
            <TouchableOpacity
              key={page.id}
              style={styles.pageButton}
              onPress={() => handleNavigate(page.path)}
              activeOpacity={0.7}
            >
              <View style={styles.pageButtonContent}>
                <View style={styles.pageButtonLeft}>
                  <Text style={styles.pageButtonTitle}>{page.title}</Text>
                  <Text style={styles.pageButtonDescription}>
                    {page.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#A0A0A0"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 51,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E3E0",
  },
  backButton: {
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
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6F5B52",
    letterSpacing: -0.28,
    marginBottom: 16,
    lineHeight: 20,
  },
  pageButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E3E0",
  },
  pageButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageButtonLeft: {
    flex: 1,
  },
  pageButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#31170F",
    letterSpacing: -0.32,
    marginBottom: 4,
  },
  pageButtonDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.24,
  },
});

