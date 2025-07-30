import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = false;

  console.log("pathname", pathname);

  const { width, height } = Dimensions.get("window");
  console.log(`화면 너비 : ${width}dp , 화면 높이 : ${height}dp`);

  console.log(
    ` 화면 너비 :  ${width * PixelRatio.get()}dp , 높이 : ${
      height * PixelRatio.get()
    }dp`
  );

  return (
    <SafeAreaView style={styles.container}>
      <BlurView style={styles.header} intensity={70}>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.headerLogo}
        />
        {!isLoggedIn && (
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
        )}
      </BlurView>
      {isLoggedIn && (
        <View style={styles.tabContainer}>
          <View style={styles.tab}>
            <TouchableOpacity onPress={() => router.push(`/`)}>
              <Text style={{ color: pathname === "/" ? "red" : "black" }}>
                For you
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tab}>
            <TouchableOpacity onPress={() => router.push(`/following`)}>
              <Text style={{ color: pathname === "/" ? "black" : "red" }}>
                Following
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View>
        <TouchableOpacity onPress={() => router.push(`/@eastzoo/post/1`)}>
          <Text>게시글1</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/@eastzoo/post/2`)}>
          <Text>게시글2</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/@eastzoo/post/3`)}>
          <Text>게시글3</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * 인라인 으로 css를 넣으면 리액트가 렌더링할때마다 성능의 영향이 가는데
 * 아래와 같이 StyleSheet를 사용하면 성능 영향이 적음 알아서 최적화 해줌
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
  headerLogo: {
    width: 42, // DP, DIP 단위 디바이스 픽셀 단위
    height: 42,
  },
  loginButton: {
    position: "absolute",
    right: 10,
    top: 0,
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "white",
  },
});
