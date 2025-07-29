import NotFound from "@/app/+not-found";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const pathname = usePathname();

  // 탭에 보이지 않는 페이지에 접근하려고 할 때 404 페이지로 리다이렉트
  // ![tabs] 다이나믹 라우터를 쓰면 모든 페이지가 통과하기 때문에 아래와 같이 검증 코드를 넣어주어야한다.
  if (
    ![
      "/activity",
      "/activity/follows",
      "/activity/replies",
      "/activity/mentions",
      "/activity/quotes",
      "/activity/reposts",
      "/activity/verified",
    ].includes(pathname)
  ) {
    return <NotFound />;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <View>
          <TouchableOpacity onPress={() => router.push(`/activity`)}>
            <Text>All</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.push(`/activity/follows`)}>
            <Text>Follows</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.push(`/activity/replies`)}>
            <Text>Replies</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.push(`/activity/mentions`)}>
            <Text>Mentions</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.push(`/activity/quotes`)}>
            <Text>Quotes</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.push(`/activity/reposts`)}>
            <Text>Reposts</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.push(`/activity/verified`)}>
            <Text>Verified</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
