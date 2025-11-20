import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const imgCheck = require("../assets/svg/check.svg");

export interface ToastProps {
  /**
   * 토스트 메시지 텍스트
   * 예: "앨범을 만들었어요!"
   */
  message: string;
  /**
   * 강조할 텍스트 (볼드 처리)
   * 예: "앨범" -> "앨범을 만들었어요!"에서 "앨범" 부분이 볼드
   */
  highlightText?: string;
  /**
   * 아이콘 소스 (기본값: 체크 아이콘)
   */
  icon?: any;
  /**
   * 하단 여백 (기본값: 20)
   */
  bottomPadding?: number;
  /**
   * 토스트가 표시되는 시간 (밀리초)
   * 기본값: 3000ms (3초)
   * 0으로 설정하면 자동으로 사라지지 않음
   */
  duration?: number;
  /**
   * 토스트가 사라질 때 호출되는 콜백
   */
  onDismiss?: () => void;
  /**
   * 토스트를 수동으로 제어할지 여부
   * true로 설정하면 duration과 관계없이 표시됨
   */
  visible?: boolean;
}

/**
 * Toast 컴포넌트
 *
 * 앱 전체에서 사용할 수 있는 토스트 메시지 컴포넌트
 * 자동으로 사라지는 기능과 페이드 애니메이션을 지원합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용 (3초 후 자동 사라짐)
 * <Toast message="앨범을 만들었어요!" highlightText="앨범" />
 *
 * // 커스텀 duration 설정 (5초)
 * <Toast message="저장되었습니다." duration={5000} />
 *
 * // 수동 제어 (자동으로 사라지지 않음)
 * const [visible, setVisible] = useState(true);
 * <Toast message="앨범을 만들었어요!" visible={visible} />
 *
 * // 사라질 때 콜백 처리
 * <Toast
 *   message="앨범을 만들었어요!"
 *   duration={2000}
 *   onDismiss={() => console.log("Toast dismissed")}
 * />
 * ```
 */
export default function Toast({
  message,
  highlightText,
  icon = imgCheck,
  bottomPadding = 20,
  duration = 3000,
  onDismiss,
  visible: controlledVisible,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const [internalVisible, setInternalVisible] = useState(true);

  // Reanimated shared values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);

  // visible이 prop으로 전달되면 그것을 사용하고, 아니면 내부 상태 사용
  const isControlled = controlledVisible !== undefined;
  const visible = isControlled ? controlledVisible : internalVisible;

  useEffect(() => {
    if (visible) {
      // 재밌는 등장 애니메이션: 바운스 + 스케일 + 회전
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(
        0,
        {
          damping: 10,
          stiffness: 100,
          mass: 0.8,
        },
        (finished) => {
          if (finished) {
            // 등장 후 살짝 위로 올라갔다가 제자리로 (호버 효과)
            translateY.value = withSequence(
              withTiming(-5, { duration: 150 }),
              withSpring(0, { damping: 12, stiffness: 150 })
            );
          }
        }
      );
      scale.value = withSpring(1, {
        damping: 8,
        stiffness: 120,
        mass: 0.6,
      });
      // 살짝 회전 후 제자리로
      rotation.value = withSequence(
        withTiming(-3, { duration: 150 }),
        withSpring(0, { damping: 15, stiffness: 200 })
      );
    } else {
      // 사라질 때 애니메이션
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(100, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible, opacity, translateY, scale, rotation]);

  // JS 스레드에서 실행될 함수들
  const handleDismiss = () => {
    if (isControlled) {
      onDismiss?.();
    } else {
      setInternalVisible(false);
      onDismiss?.();
    }
  };

  useEffect(() => {
    // duration이 0이거나 controlled mode이고 visible이 false이면 자동 사라지지 않음
    if (duration === 0 || (isControlled && visible === false)) {
      return;
    }

    if (visible) {
      const timer = setTimeout(() => {
        // 사라지기 전 살짝 흔들리는 효과
        translateY.value = withSequence(
          withTiming(-3, { duration: 50 }),
          withTiming(3, { duration: 50 }),
          withTiming(0, { duration: 50 }),
          // 그 후 사라지는 애니메이션
          withDelay(
            100,
            withTiming(100, { duration: 300 }, (finished) => {
              if (finished) {
                opacity.value = 0;
                scale.value = 0.8;
                // runOnJS를 사용하여 JS 스레드에서 실행
                runOnJS(handleDismiss)();
              }
            })
          )
        );
        opacity.value = withDelay(200, withTiming(0, { duration: 300 }));
        scale.value = withDelay(200, withTiming(0.8, { duration: 300 }));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [
    duration,
    visible,
    isControlled,
    opacity,
    translateY,
    scale,
    onDismiss,
    handleDismiss,
  ]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  // highlightText가 있으면 메시지를 분리
  const getTextParts = () => {
    if (!highlightText) {
      return { before: message, highlight: "", after: "" };
    }

    const highlightIndex = message.indexOf(highlightText);
    if (highlightIndex === -1) {
      return { before: message, highlight: "", after: "" };
    }

    return {
      before: message.substring(0, highlightIndex),
      highlight: highlightText,
      after: message.substring(highlightIndex + highlightText.length),
    };
  };

  const { before, highlight, after } = getTextParts();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom + bottomPadding, bottomPadding),
        },
        animatedStyle,
      ]}
    >
      <View style={styles.toast}>
        <View style={styles.iconContainer}>
          <Image source={icon} contentFit="contain" style={styles.icon} />
        </View>
        <Text style={styles.text}>
          {before && <Text style={styles.textRegular}>{before}</Text>}
          {highlight && <Text style={styles.textBold}>{highlight}</Text>}
          {after && <Text style={styles.textRegular}>{after}</Text>}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999, // Android
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 8,
    shadowColor: "0px 2px 9.1px rgba(116, 34, 34, 0.11)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 9.1,
    elevation: 9,
  },
  iconContainer: {
    height: 24,
    width: 24,
    padding: 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: "100%",
    height: "100%",
    borderRadius: 99,
    maxWidth: "100%",
    maxHeight: "100%",
    overflow: "hidden",
  },
  text: {
    fontSize: 14,
    letterSpacing: -0.3,
    lineHeight: 20,
    color: "#432014",
    textAlign: "left",
    flex: 1,
  },
  textBold: {
    fontWeight: "700",
    fontFamily: "Pretendard Variable",
  },
  textRegular: {
    fontWeight: "500",
    fontFamily: "Pretendard Variable",
  },
});
