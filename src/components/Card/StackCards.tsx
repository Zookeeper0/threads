import data from "@/components/Card/data";
import { useEffect, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  isEditMode = false,
  savedPosition,
  onSavePosition,
  onRegisterPosition,
}: {
  totalLength: number;
  index: number;
  info: (typeof data)[0];
  activeIndex: SharedValue<number>;
  cardsGap?: number;
  isEditMode?: boolean;
  savedPosition?: { top: number; left: number } | null;
  onSavePosition?: (position: { top: number; left: number }) => void;
  onRegisterPosition?: (
    translateX: SharedValue<number>,
    translateY: SharedValue<number>
  ) => void;
}) {
  const translateX = useSharedValue(savedPosition?.left ?? 0);
  const translateY = useSharedValue(savedPosition?.top ?? 0);

  // 위치 SharedValue 등록 (편집 모드이고 현재 활성 카드일 때만)
  useAnimatedReaction(
    () => activeIndex.value,
    (currentActiveIndex) => {
      if (onRegisterPosition && isEditMode) {
        const activeIdx = Math.round(currentActiveIndex);
        if (activeIdx === index) {
          runOnJS(onRegisterPosition)(translateX, translateY);
        }
      }
    },
    [isEditMode, index]
  );

  // 편집 모드일 때 Pan gesture
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(isEditMode)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  const stylez = useAnimatedStyle(() => {
    const currentIndex = activeIndex.value;

    // 상대적 거리 계산 (무한 루프 없음)
    const relativeIndex = index - currentIndex;

    // 현재 보이고 있는 스택 페이지만 보이게 (relativeIndex가 0에 가까운 경우)
    // 애니메이션 중 깜빡임을 방지하기 위해 작은 범위(0.5) 내의 카드는 보이도록 처리
    const isVisible = Math.abs(relativeIndex) < 0.5;

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
          translateX: isVisible
            ? translateX.value // 저장된 위치 또는 편집 중인 위치 사용
            : 0,
        },
        {
          translateY: isVisible
            ? translateY.value // 저장된 위치 또는 편집 중인 위치 사용
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

  // 초기 마운트 시 저장된 위치 적용
  useEffect(() => {
    if (savedPosition) {
      translateX.value = savedPosition.left;
      translateY.value = savedPosition.top;
    }
  }, []); // 초기 마운트 시에만 실행

  // 편집 모드가 종료될 때만 저장된 위치 적용
  // 저장 버튼을 눌렀을 때는 현재 위치(translateX.value, translateY.value)를 그대로 유지
  useEffect(() => {
    if (!isEditMode) {
      if (savedPosition) {
        // 저장된 위치가 있으면 그 위치로 이동
        // 하지만 현재 위치와 저장된 위치가 거의 같으면 유지 (저장 직후에는 위치가 같음)
        const diffX = Math.abs(translateX.value - savedPosition.left);
        const diffY = Math.abs(translateY.value - savedPosition.top);
        // 차이가 1픽셀 이상일 때만 이동 (저장 직후에는 차이가 거의 없음)
        if (diffX > 1 || diffY > 1) {
          translateX.value = withSpring(savedPosition.left);
          translateY.value = withSpring(savedPosition.top);
        }
        // 거의 같으면 현재 위치 유지 (애니메이션 없이)
      } else {
        // 저장된 위치가 없으면 원래 위치로
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    }
    // 편집 모드일 때는 현재 위치를 유지 (드래그한 위치 그대로)
  }, [isEditMode]);

  const cardContent = (
    <Animated.View style={[styles.card, stylez]}>
      <View style={styles.cardContent}>
        <Text style={styles.dDayText}>D+{days}</Text>
        <Text style={styles.subtitle}>우리가 함께한 시간</Text>
      </View>
    </Animated.View>
  );

  if (isEditMode) {
    return (
      <GestureDetector gesture={panGesture}>{cardContent}</GestureDetector>
    );
  }

  return cardContent;
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
  editModeButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginLeft: 16,
  },
  saveButton: {
    backgroundColor: "#FF6638",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F5F1EF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#31170F",
    fontSize: 14,
    fontWeight: "600",
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
  isEditMode = false,
  savedPosition,
  onSavePosition,
  onCancelEdit,
}: {
  data: Array<(typeof data)[number]>;
  activeIndex: SharedValue<number>;
  cardsGap?: number;
  totalItems: number;
  isEditMode?: boolean;
  savedPosition?: { top: number; left: number } | null;
  onSavePosition?: (position: { top: number; left: number }) => void;
  onCancelEdit?: () => void;
}) {
  // 현재 활성 카드의 위치 SharedValue
  const activeCardTranslateXRef = useRef<SharedValue<number> | null>(null);
  const activeCardTranslateYRef = useRef<SharedValue<number> | null>(null);

  const handleRegisterPosition = (
    translateX: SharedValue<number>,
    translateY: SharedValue<number>
  ) => {
    activeCardTranslateXRef.current = translateX;
    activeCardTranslateYRef.current = translateY;
  };
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
              isEditMode={isEditMode}
              savedPosition={savedPosition}
              onSavePosition={onSavePosition}
              onRegisterPosition={handleRegisterPosition}
            />
          );
        })}
      </View>

      {/* 세로 점 페이지네이션 */}
      {!isEditMode && (
        <PaginationDots activeIndex={activeIndex} totalItems={totalItems} />
      )}

      {/* 편집 모드일 때 저장/취소 버튼 */}
      {isEditMode && (
        <View style={styles.editModeButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              // 저장 버튼 클릭 시 현재 위치 저장
              if (
                activeCardTranslateXRef.current &&
                activeCardTranslateYRef.current &&
                onSavePosition
              ) {
                const position = {
                  top: activeCardTranslateYRef.current.value,
                  left: activeCardTranslateXRef.current.value,
                };
                onSavePosition(position);
              }
              if (onCancelEdit) onCancelEdit();
            }}
          >
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancelEdit}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
