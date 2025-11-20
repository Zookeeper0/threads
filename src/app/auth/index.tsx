import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 로고 이미지 (필요시 실제 로고로 교체)
const imgKakaoLogo = require("../../assets/svg/message-square.svg");
const imgNaverLogo = require("../../assets/svg/Vector.svg");

export default function AuthLogin() {
  const insets = useSafeAreaInsets();

  const handleKakaoLogin = () => {
    // 카카오 로그인 후 이름 입력 화면으로 이동
    router.push("/auth/name");
  };

  const handleNaverLogin = () => {
    // 네이버 로그인 후 이름 입력 화면으로 이동
    router.push("/auth/name");
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
      {/* Main Content */}
      <View style={styles.content}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>흩어진 추억을 하나로, 둘만의 특별한 지도</Text>

        {/* App Name */}
        <Text style={styles.appName}>MapMory</Text>

        {/* Login Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Kakao Login Button */}
          <TouchableOpacity
            style={styles.kakaoButton}
            onPress={handleKakaoLogin}
            activeOpacity={0.8}
          >
            <Image
              source={imgKakaoLogo}
              style={styles.kakaoIcon}
              contentFit="contain"
            />
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          </TouchableOpacity>

          {/* Naver Login Button */}
          <TouchableOpacity
            style={styles.naverButton}
            onPress={handleNaverLogin}
            activeOpacity={0.8}
          >
            <View style={styles.naverLogoContainer}>
              <Text style={styles.naverLogo}>N</Text>
            </View>
            <Text style={styles.naverButtonText}>네이버로 시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F7",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6F5B52",
    letterSpacing: -0.32,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FF6638",
    letterSpacing: -0.96,
    marginBottom: 120,
    lineHeight: 58,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    maxWidth: 360,
  },
  kakaoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE500",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
    minHeight: 56,
  },
  kakaoIcon: {
    width: 24,
    height: 24,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.32,
  },
  naverButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#03C75A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
    minHeight: 56,
  },
  naverLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  naverLogo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#03C75A",
  },
  naverButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
});

