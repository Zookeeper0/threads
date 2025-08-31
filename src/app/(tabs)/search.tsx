import SideMenu from "@/components/SideMenu";
import { Ionicons } from "@expo/vector-icons";
import { NaverMapView, Region } from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthContext } from "../_layout";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const colorScheme = useColorScheme();

  const jejuRegion: Region = {
    latitude: 33.20530773,
    longitude: 126.14656715029,
    latitudeDelta: 0.38,
    longitudeDelta: 0.8,
  };

  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      try {
        // 위치 권한 상태 확인
        let { status } = await Location.getForegroundPermissionsAsync();

        if (status !== "granted") {
          // 권한이 없으면 요청
          const { status: newStatus } =
            await Location.requestForegroundPermissionsAsync();
          if (newStatus !== "granted") {
            Alert.alert(
              "위치 권한 필요",
              "네이버 맵을 사용하려면 위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.",
              [
                { text: "취소", style: "cancel" },
                { text: "설정으로 이동", onPress: () => {} },
              ]
            );
            return;
          }
          status = newStatus;
        }

        if (status === "granted") {
          setLocationPermission(true);

          // 현재 위치 가져오기
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const newRegion: Region = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setCurrentLocation(newRegion);
        }
      } catch (error) {
        console.error("위치 권한 요청 중 오류:", error);
        Alert.alert("오류", "위치 정보를 가져오는 중 오류가 발생했습니다.");
      }
    })();
  }, []);

  // 네이버 맵 초기 카메라 설정 (현재 위치가 있으면 사용, 없으면 제주도)
  const initialCamera = currentLocation || jejuRegion;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[
          styles.header,
          colorScheme === "dark" ? styles.headerDark : styles.headerLight,
        ]}
      >
        {isLoggedIn && (
          <Pressable
            style={styles.menuButton}
            onPress={() => {
              setIsSideMenuOpen(true);
            }}
          >
            <Ionicons
              name="menu"
              size={24}
              color={colorScheme === "dark" ? "gray" : "black"}
            />
          </Pressable>
        )}
        <Image
          source={require("../../assets/images/react-logo.png")}
          style={styles.logo}
        />
        <SideMenu
          isVisible={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />
      </View>

      {/* 위치 권한이 허용된 경우에만 네이버 맵 표시 */}
      {locationPermission ? (
        <NaverMapView
          style={{ flex: 1 }}
          initialCamera={initialCamera}
          isShowLocationButton={true}
        />
      ) : (
        <View style={styles.permissionContainer}>
          <Ionicons
            name="location-outline"
            size={64}
            color={colorScheme === "dark" ? "gray" : "black"}
          />
          <Text
            style={[
              styles.permissionText,
              colorScheme === "dark"
                ? styles.permissionTextDark
                : styles.permissionText,
            ]}
          >
            위치 권한이 필요합니다
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={() => {
              Location.requestForegroundPermissionsAsync();
            }}
          >
            <Text style={styles.permissionButtonText}>권한 요청</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },
  headerLight: {
    backgroundColor: "white",
  },
  headerDark: {
    backgroundColor: "#101010",
  },
  menuButton: {
    position: "absolute",
    left: 16,
  },
  searchBarArea: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  searchBarAreaLight: {
    backgroundColor: "white",
  },
  searchBarAreaDark: {
    backgroundColor: "#202020",
  },
  searchBar: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    paddingHorizontal: 30,
  },
  searchBarLight: {
    backgroundColor: "white",
  },
  searchBarDark: {
    backgroundColor: "black",
    color: "white",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#aaa",
  },
  searchInput: {
    marginLeft: 10,
  },
  searchInputLight: {
    color: "black",
  },
  searchInputDark: {
    color: "white",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white", // Default to light for permission screen
  },
  permissionText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
  },
  permissionTextDark: {
    color: "white",
  },
  permissionButton: {
    marginTop: 30,
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
