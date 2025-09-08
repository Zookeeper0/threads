import MemoryCard from "@/components/MemoryCard";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { usePathname } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { Dimensions, StyleSheet, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { AnimationContext } from "./_layout";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 24) / 2; // 2열 그리드, 좌우 마진 8씩 + 카드 간격 8

interface MemoryItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
}

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList<MemoryItem>
);

export default function Index() {
  const colorScheme = useColorScheme();
  const path = usePathname();
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: "1",
      title: "슈퍼 잼민이",
      date: "2024.06.15.",
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      title: "우주 생일",
      date: "2024.06.06.",
      imageUrl:
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
    },
    {
      id: "3",
      title: "청도 글램핑",
      date: "2024.05.15.",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      id: "4",
      title: "한강 산책만 3번째",
      date: "2024.04.20.",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      id: "5",
      title: "카페 투어",
      date: "2024.03.10.",
      imageUrl:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
    },
    {
      id: "6",
      title: "영화관 데이트",
      date: "2024.02.14.",
      imageUrl:
        "https://images.unsplash.com/photo-1489599808427-2b4b4b4b4b4b?w=400&h=300&fit=crop",
    },
  ]);
  const scrollPosition = useSharedValue(0);
  const { pullDownPosition } = useContext(AnimationContext);

  const onEndReached = useCallback(() => {
    console.log("onEndReached", memories.at(-1)?.id);

    // 더 많은 샘플 데이터 추가 (실제로는 API 호출)
    const moreMemories: MemoryItem[] = [
      {
        id: `${memories.length + 1}`,
        title: `새로운 추억 ${memories.length + 1}`,
        date: "2024.01.15.",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      },
      {
        id: `${memories.length + 2}`,
        title: `특별한 순간 ${memories.length + 2}`,
        date: "2024.01.10.",
        imageUrl:
          "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
      },
      {
        id: `${memories.length + 3}`,
        title: `즐거운 하루 ${memories.length + 3}`,
        date: "2024.01.05.",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      },
      {
        id: `${memories.length + 4}`,
        title: `소중한 기억 ${memories.length + 4}`,
        date: "2024.01.01.",
        imageUrl:
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
      },
    ];

    setMemories((prev) => [...prev, ...moreMemories]);
  }, [memories, path]);

  const onRefresh = (done: () => void) => {
    setMemories([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetch("/memories")
      .then((res) => res.json())
      .then((data) => {
        setMemories(data.memories);
      })
      .finally(() => {
        done();
      });
  };

  // 풀 투 리프레시 기능 제거하여 더 자연스러운 스크롤 구현

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      console.log("onScroll", event.contentOffset.y);
      scrollPosition.value = event.contentOffset.y;
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      <AnimatedFlashList
        refreshControl={<View />}
        data={memories}
        numColumns={2}
        nestedScrollEnabled={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <MemoryCard
              id={item.id}
              title={item.title}
              date={item.date}
              imageUrl={item.imageUrl}
            />
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        estimatedItemSize={180}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#f8f8f8",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 20,
  },
  textLight: {
    color: "black",
  },
  textDark: {
    color: "white",
  },
});
