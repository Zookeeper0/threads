import data from "@/components/Card/data";
import Constants from "expo-constants";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
const { width } = Dimensions.get("window");

const duration = 300;
const _size = 150;
const layout = {
  borderRadius: 16,
  width: _size,
  height: _size * 0.5,
  spacing: 4,
  cardsGap: 12,
};

//? 스택 뒤로 보여줄 갯수
const maxVisibleItems = 6;

const colors = {
  primary: "#6667AB",
  light: "#fff",
  dark: "#111",
};

export default function Card({
  info,
  index,
  totalLength,
  activeIndex,
  cardsGap = layout.cardsGap,
}: {
  totalLength: number;
  index: number;
  info: (typeof data)[0];
  activeIndex: SharedValue<number>;
  cardsGap?: number;
}) {
  const stylez = useAnimatedStyle(() => {
    return {
      position: "absolute",
      zIndex: totalLength - index,
      opacity: interpolate(
        activeIndex.value,
        [index - 1, index, index + 1],
        [1 - 1 / maxVisibleItems, 1, 1]
      ),
      transform: [
        {
          translateY: interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [-layout.cardsGap, 0, layout.height + layout.cardsGap]
          ),
        },
        {
          scale: interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [0.96, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.card, stylez]}>
      <Text
        style={[
          styles.title,
          {
            position: "absolute",
            fontSize: 58,
            color: colors.primary,
            opacity: 0.05,
          },
        ]}
      >
        {index}
      </Text>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{info.type}</Text>
        <Text style={styles.subtitle}>
          {info.from} - {info.to}
        </Text>
      </View>
    </Animated.View>
  );
}

// export default function App() {
//   return (
//     <GestureHandlerRootView style={styles.container}>
//       <StatusBar hidden />
//       <View
//         style={{
//           alignItems: "center",
//           flex: 1,
//           justifyContent: "flex-end",
//           marginBottom: layout.cardsGap * 2,
//         }}
//         pointerEvents="box-none"
//       >
//         {data.slice(0, 1).map((c, index) => {
//           return (
//             <Card
//               info={c}
//               key={c.id}
//               index={index}
//               totalLength={data.length - 1}
//             />
//           );
//         })}
//       </View>
//     </GestureHandlerRootView>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: colors.primary,
    padding: layout.spacing,
  },
  card: {
    borderRadius: layout.borderRadius,
    width: layout.width,
    height: layout.height,
    backgroundColor: colors.light,
  },
  title: { fontSize: 20, fontWeight: "600" },
  subtitle: {},
  cardContent: {
    gap: layout.spacing,
    margin: 10,
  },
  locationImage: {
    flex: 1,
    borderRadius: layout.borderRadius - layout.spacing / 2,
  },
  row: {
    flexDirection: "row",
    columnGap: layout.spacing / 2,
    alignItems: "center",
  },
  icon: {},
});
