import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CODE_LENGTH = 6;

export default function AuthInviteCode() {
  const insets = useSafeAreaInsets();
  const [codes, setCodes] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    // 숫자와 영문자만 허용
    const filteredText = text.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    if (filteredText.length > 1) {
      // 여러 글자가 입력된 경우 (붙여넣기 등)
      const newCodes = [...codes];
      for (let i = 0; i < CODE_LENGTH && i < filteredText.length; i++) {
        if (index + i < CODE_LENGTH) {
          newCodes[index + i] = filteredText[i];
        }
      }
      setCodes(newCodes);

      // 다음 빈 입력 필드로 포커스 이동
      const nextEmptyIndex = newCodes.findIndex((code, idx) => idx >= index && !code);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < CODE_LENGTH) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else if (newCodes.every((code) => code)) {
        // 모든 코드가 입력된 경우
        inputRefs.current[CODE_LENGTH - 1]?.blur();
      }
    } else {
      // 단일 글자 입력
      const newCodes = [...codes];
      newCodes[index] = filteredText;
      setCodes(newCodes);

      // 다음 입력 필드로 포커스 이동
      if (filteredText && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !codes[index] && index > 0) {
      // 백스페이스 시 이전 필드로 이동
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSave = () => {
    const fullCode = codes.join("");
    if (fullCode.length === CODE_LENGTH) {
      // 초대 코드 검증 및 저장 (TODO: API 호출)
      // 성공 시 홈으로 이동
      router.replace("/(tabs)/home");
    }
  };

  const isCodeComplete = codes.every((code) => code.length > 0);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#31170F" />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={styles.title}>초대코드를 입력해주세요.</Text>

          {/* Description */}
          <Text style={styles.description}>
            연인과의 추억 장소를 함께 기록할 수 있어요!
          </Text>

          {/* Code Input Fields */}
          <View style={styles.codeContainer}>
            {codes.map((code, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  code && styles.codeInputFilled,
                ]}
                value={code}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="default"
                autoCapitalize="characters"
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isCodeComplete && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isCodeComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    height: 51,
  },
  headerButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 24,
    height: 24,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.48,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6F5B52",
    letterSpacing: -0.32,
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F5F1EF",
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: "#FF6638",
    fontSize: 24,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.48,
  },
  codeInputFilled: {
    backgroundColor: "#FFFFFF",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#FAF8F7",
    borderTopWidth: 1,
    borderTopColor: "#E8E3E0",
  },
  saveButton: {
    backgroundColor: "#FF6638",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5A1B05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#E8E3E0",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
});

