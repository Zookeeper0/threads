import { Redirect, router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  /** ============================= state 영역 ============================= */
  const isLoggedIn = false;

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

  const onLogin = () => {
    console.log("onLogin");

    fetch("/login", {
      method: "POST",
      body: JSON.stringify({
        username: "eastzoo",
        password: "1234",
      }),
    })
      .then((res) => {
        console.log(res);
        if (res.status >= 400) {
          throw Alert.alert("Error", "Invalid credentials");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
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
      <Pressable style={styles.loginButton} onPress={onLogin}>
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
