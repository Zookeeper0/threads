import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 초대 코드 생성 (임시, 실제로는 서버에서 생성)
const generateInviteCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function AuthInvite() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const userName = (params.userName as string) || "닉네임";
  const [inviteCode] = useState<string>(generateInviteCode());

  const handleCopyCode = async () => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(inviteCode);
      } else {
        // TODO: expo-clipboard 설치 후 교체
        // 임시로 알림만 표시
        Alert.alert(
          "초대 코드",
          inviteCode,
          [
            { text: "확인", style: "default" },
          ]
        );
        return;
      }
      Alert.alert("복사 완료", "초대 코드가 클립보드에 복사되었습니다.");
    } catch (error) {
      Alert.alert("오류", "초대 코드 복사에 실패했습니다.");
    }
  };

  const handleAlreadyHaveCode = () => {
    // 초대 코드 입력 화면으로 이동
    router.push("/auth/invite-code");
  };

  const handleSave = () => {
    // 저장 후 홈으로 이동 (임시)
    router.replace("/(tabs)/home");
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
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#31170F" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.homeButton}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{userName} 님의 연인을 초대해주세요.</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>둘만의 지도를 함께 채워가봐요 :)</Text>

        {/* Invite Code Box */}
        <View style={styles.inviteCodeBox}>
          <Text style={styles.inviteCodeLabel}>나의 초대코드</Text>
          <View style={styles.inviteCodeRow}>
            <Text style={styles.inviteCode}>{inviteCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={20} color="#6F5B52" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Already Have Code Link */}
        <TouchableOpacity
          style={styles.alreadyHaveCodeLink}
          onPress={handleAlreadyHaveCode}
          activeOpacity={0.7}
        >
          <Text style={styles.alreadyHaveCodeText}>
            이미 초대코드를 받았어요!
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
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
    backgroundColor: "#FAF8F7",
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
  headerRight: {
    width: 80,
    alignItems: "flex-end",
  },
  homeButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6638",
    letterSpacing: -0.32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.48,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.32,
    textAlign: "center",
    marginBottom: 48,
  },
  inviteCodeBox: {
    width: "100%",
    backgroundColor: "#FFF5F2",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FFE5DC",
  },
  inviteCodeLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
    marginBottom: 12,
  },
  inviteCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6638",
    letterSpacing: -0.48,
    textDecorationLine: "underline",
    flex: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E3E0",
  },
  alreadyHaveCodeLink: {
    paddingVertical: 12,
  },
  alreadyHaveCodeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF6638",
    letterSpacing: -0.32,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#FAF8F7",
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
});

