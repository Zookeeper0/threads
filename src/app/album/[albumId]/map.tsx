import { NaverMapView } from "@mj-studio/react-native-naver-map";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlbumMap() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { albumId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <NaverMapView
        style={StyleSheet.absoluteFillObject}
        initialCamera={{
          latitude: 37.5665,
          longitude: 126.978,
          zoom: 15,
        }}
        isShowLocationButton={false}
        isShowCompass={false}
        isShowScaleBar={false}
        isShowZoomControls={false}
      />
      {/* TODO: 앨범에 관련된 장소 마커 표시 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
});

