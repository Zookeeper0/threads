import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <TouchableOpacity onPress={() => router.push(`/`)}>
          <Text>For you</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/following`)}>
          <Text>Following</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
