import { Redirect, router } from "expo-router";
import { useContext } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "./_layout";

export default function Login() {
  /** ============================= state 영역 ============================= */
  const { user, login } = useContext(AuthContext);
  const isLoggedIn = !!user;

  /** ============================= API 영역 ============================= */

  /** ============================= 비즈니스 로직 영역 ============================= */
  const onAppleLogin = async () => {
    try {
    } catch (error) {
      console.log(error);
    }
  };

  const onKakaoLogin = async () => {
    try {
    } catch (error) {
      console.log(error);
    }
  };

  /** ============================= 컴포넌트 영역 ============================= */

  /** ============================= useEffect 영역 ============================= */

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }
  return (
    <SafeAreaView>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
      <Pressable style={styles.loginButton} onPress={login}>
        <Text style={styles.loginButtonText}>Login</Text>
      </Pressable>
      <Pressable
        style={[styles.loginButton, styles.kakaoLoginButton]}
        onPress={onKakaoLogin}
      >
        <Text style={[styles.loginButtonText, styles.kakaoLoginButtonText]}>
          Kakao Login
        </Text>
      </Pressable>
      <Pressable
        style={[styles.loginButton, styles.appleLoginButton]}
        onPress={onAppleLogin}
      >
        <Text style={styles.loginButtonText}>Apple Login</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
  },
  kakaoLoginButton: {
    backgroundColor: "#FEE500",
  },
  kakaoLoginButtonText: {
    color: "black",
  },
  appleLoginButton: {
    backgroundColor: "black",
  },
});
