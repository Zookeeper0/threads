import NotFound from "@/app/+not-found";
import { AuthContext } from "@/app/_layout";
import ActivityItem from "@/components/Activity";
import SideMenu from "@/components/SideMenu";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const isLoggedIn = !!user;
  const pathname = usePathname();
  const colorScheme = useColorScheme();

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
    <SafeAreaView style={styles.container}>
      <View style={[styles.header]}>
        {isLoggedIn && (
          <Pressable
            style={styles.menuButton}
            onPress={() => {
              setIsSideMenuOpen(true);
            }}
          >
            <Ionicons name="menu" size={24} color={"black"} />
          </Pressable>
        )}
        <Image
          source={require("../../../assets/images/react-logo.png")}
          style={styles.logo}
        />
        <SideMenu
          isVisible={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />
      </View>
      <ScrollView
        horizontal
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContainer}
      >
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === "dark"
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === "/activity" &&
                (colorScheme === "dark"
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === "dark"
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === "dark"
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === "/activity/follows" &&
                (colorScheme === "dark"
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/follows`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === "dark"
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Follows
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === "dark"
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === "/activity/replies" &&
                (colorScheme === "dark"
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/replies`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === "dark"
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Replies
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === "dark"
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === "/activity/mentions" &&
                (colorScheme === "dark"
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/mentions`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === "dark"
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Mentions
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === "dark"
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === "/activity/quotes" &&
                (colorScheme === "dark"
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/quotes`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === "dark"
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Quotes
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === "dark"
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === "/activity/reposts" &&
                (colorScheme === "dark"
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/reposts`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === "dark"
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Reposts
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[
              styles.tabButton,
              colorScheme === "dark"
                ? styles.tabButtonDark
                : styles.tabButtonLight,
              pathname === "/activity/verified" &&
                (colorScheme === "dark"
                  ? styles.tabButtonActiveDark
                  : styles.tabButtonActiveLight),
            ]}
            onPress={() => router.replace(`/activity/verified`)}
          >
            <Text
              style={[
                styles.tabButtonText,
                colorScheme === "dark"
                  ? styles.tabButtonTextDark
                  : styles.tabButtonTextLight,
              ]}
            >
              Verified
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ScrollView>
        <ActivityItem
          id="1"
          username="John Doe"
          timeAgo="1h"
          content="팔로우"
          type="followed"
          avatar="https://randomuser.me/api/portraits/men/1.jpg"
        />
        <ActivityItem
          id="2"
          username="John Doe"
          timeAgo="1h"
          postId="1"
          content="Hello, comment!"
          type="reply"
          avatar="https://randomuser.me/api/portraits/men/1.jpg"
        />
        <ActivityItem
          id="2"
          username="John Doe"
          timeAgo="1h"
          postId="1"
          content="liked your post"
          type="like"
          avatar="https://randomuser.me/api/portraits/men/1.jpg"
        />
        <ActivityItem
          id="3"
          username="John Doe"
          timeAgo="1h"
          postId="1"
          content="reposted your post"
          type="repost"
          avatar="https://randomuser.me/api/portraits/men/1.jpg"
        />
        <ActivityItem
          id="5"
          username="John Doe"
          timeAgo="1h"
          postId="1"
          content="mentioned you"
          type="mention"
          avatar="https://randomuser.me/api/portraits/men/1.jpg"
        />
        <ActivityItem
          id="4"
          username="John Doe"
          timeAgo="1h"
          postId="1"
          content="quoted your post"
          type="quote"
          avatar="https://randomuser.me/api/portraits/men/1.jpg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#aaa",
    backgroundColor: "#101010",
  },
  tabButtonLight: {
    backgroundColor: "white",
  },
  tabButtonDark: {
    backgroundColor: "#101010",
  },
  tabButtonActiveLight: {
    backgroundColor: "#eee",
  },
  tabButtonActiveDark: {
    backgroundColor: "#202020",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "900",
  },
  tabButtonTextLight: {
    color: "black",
  },
  tabButtonTextDark: {
    color: "white",
  },
  tabBar: {
    padding: 0,
    margin: 0,
    flexGrow: 0,
  },
  tabBarContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
});
