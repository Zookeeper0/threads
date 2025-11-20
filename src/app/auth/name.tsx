import { router } from "expo-router";
import { useState } from "react";
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

export default function AuthName() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim().length > 0) {
      // 이름 저장 후 초대 화면으로 이동
      router.push({
        pathname: "/auth/invite",
        params: {
          userName: name.trim(),
        },
      });
    }
  };

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
          <Text style={styles.title}>
            연인과 함께 쌓는 맵모리, 시작해볼게요!
          </Text>

          {/* Question */}
          <Text style={styles.question}>어떤 이름을 사용하시겠어요?</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력해주세요."
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              maxLength={20}
            />
          </View>

          {/* Hint */}
          <Text style={styles.hint}>언제든 바꿀 수 있어요!</Text>
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
              name.trim().length === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={name.trim().length === 0}
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
  question: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6F5B52",
    letterSpacing: -0.32,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E3E0",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.32,
    textAlign: "center",
    padding: 0,
  },
  hint: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6F5B52",
    letterSpacing: -0.28,
    textAlign: "center",
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

