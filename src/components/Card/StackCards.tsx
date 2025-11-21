import data from "@/components/Card/data";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
const { width } = Dimensions.get("window");

const duration = 300;
const _size = 150;
const layout = {
  borderRadius: 12,
  width: 142,
  height: 78, // 카드 높이 비율 조정 (거의 정사각형)
  spacing: 4,
  cardsGap: 12,
};

//? 스택 뒤로 보여줄 갯수
const maxVisibleItems = 6;

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
    const maxIndex = totalLength;
    const currentIndex = activeIndex.value;

    // 무한 루프를 위한 상대적 거리 계산
    let relativeIndex = index - currentIndex;

    // 무한 루프 처리: 거리가 너무 멀면 반대 방향으로 계산
    if (relativeIndex > maxIndex / 2) {
      relativeIndex = relativeIndex - (maxIndex + 1);
    } else if (relativeIndex < -maxIndex / 2) {
      relativeIndex = relativeIndex + (maxIndex + 1);
    }

    // 현재 보이고 있는 스택 페이지만 보이게 (relativeIndex === 0인 경우만)
    const isVisible = relativeIndex === 0;

    return {
      position: "absolute",
      zIndex: isVisible
        ? Math.round(totalLength - Math.abs(relativeIndex))
        : -999, // 보이지 않는 카드는 zIndex를 매우 낮게 설정
      opacity: isVisible ? 1 : 0, // 보이지 않는 카드는 완전히 투명하게
      pointerEvents: isVisible ? "auto" : "none", // 보이지 않는 카드는 터치 이벤트 차단
      width: isVisible ? layout.width : 0, // 보이지 않는 카드는 너비 0
      height: isVisible ? layout.height : 0, // 보이지 않는 카드는 높이 0
      overflow: "hidden", // 넘치는 부분 숨김
      transform: [
        {
          translateY: isVisible
            ? 0 // 보이는 카드는 원래 위치
            : layout.height + 1000, // 보이지 않는 카드는 화면 밖으로
        },
        {
          scale: isVisible ? 1 : 0, // 보이지 않는 카드는 크기 0
        },
      ],
    };
  });

  // D-day 계산 (예: index를 기반으로 일수 계산)
  const days = index * 123 + 36; // 임시 계산식, 실제로는 데이터에서 가져와야 함

  return (
    <Animated.View style={[styles.card, stylez]}>
      <View style={styles.cardContent}>
        <Text style={styles.dDayText}>D+{days}</Text>
        <Text style={styles.subtitle}>우리가 함께한 시간</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.borderRadius,
    width: 142,
    height: 78,
    backgroundColor: "rgba(255,255,255,0.32)", // 하얀색 투명 배경
  },
  title: { fontSize: 10, fontWeight: "600" },
  subtitle: {
    fontFamily: "Pretendard Variable",
    fontSize: 12,
    letterSpacing: -0.2,
    lineHeight: 16,
    fontWeight: "500",
    color: "#31170F",
  },
  dDayText: {
    fontFamily: "Pretendard",
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 32,
    fontWeight: "700",
    color: "#31170F",
    textAlign: "center",
    marginTop: 4,
  },
  cardContent: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
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
  cardStackContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  cardStackWrapper: {
    position: "relative",
  },
  paginationDots: {
    flexDirection: "column",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 36,
    paddingVertical: 8,
    left: 115,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#737373", // 기본 비활성 색상
  },
});

// 페이지네이션 Dots 컴포넌트
function PaginationDots({
  activeIndex,
  totalItems,
}: {
  activeIndex: SharedValue<number>;
  totalItems: number;
}) {
  return (
    <View style={styles.paginationDots}>
      {Array.from({ length: totalItems }).map((_, index) => {
        const dotStyle = useAnimatedStyle(() => {
          const currentIndex = Math.round(activeIndex.value);
          const isActive = currentIndex === index;
          // 위아래 2개씩만 표시 (worklet 내에서 직접 계산)
          const distance = Math.abs(index - currentIndex);
          const isVisible = distance <= 2;

          return {
            opacity: isVisible ? 1 : 0,
            width: isActive ? 6 : 4,
            height: isActive ? 6 : 4,
            borderRadius: isActive ? 3 : 2,
            backgroundColor: isActive
              ? "#FFFFFF" // 활성: 흰색
              : "#737373", // 비활성: 회색
            // 숨겨진 점은 높이를 0으로 하여 공간 차지 안 함
            marginVertical: isVisible ? 0 : -2,
          };
        });

        return <Animated.View key={index} style={[styles.dot, dotStyle]} />;
      })}
    </View>
  );
}

// 카드 스택과 페이지네이션을 함께 묶는 컴포넌트
export function CardStack({
  data: cardData,
  activeIndex,
  cardsGap = layout.cardsGap,
  totalItems,
}: {
  data: Array<(typeof data)[number]>;
  activeIndex: SharedValue<number>;
  cardsGap?: number;
  totalItems: number;
}) {
  return (
    <View style={styles.cardStackContainer}>
      {/* 카드 스택 */}
      <View style={styles.cardStackWrapper}>
        {cardData.slice(0, totalItems).map((c, index) => {
          return (
            <Card
              info={c}
              key={c.id}
              index={index}
              totalLength={Math.min(totalItems - 1, cardData.length - 1)}
              activeIndex={activeIndex}
              cardsGap={cardsGap}
            />
          );
        })}
      </View>

      {/* 세로 점 페이지네이션 */}
      <PaginationDots activeIndex={activeIndex} totalItems={totalItems} />
    </View>
  );
}
