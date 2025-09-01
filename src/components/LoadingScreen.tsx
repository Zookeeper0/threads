import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface LoadingScreenProps {
  visible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible }) => {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (visible) {
      console.log("LoadingScreen visible");
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          colorScheme === "dark" ? styles.containerDark : styles.containerLight,
        ]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.imagePlaceholder,
              colorScheme === "dark"
                ? styles.imagePlaceholderDark
                : styles.imagePlaceholderLight,
            ]}
          />
          <Text
            style={[
              styles.loadingText,
              colorScheme === "dark"
                ? styles.loadingTextDark
                : styles.loadingTextLight,
            ]}
          >
            사진에서 날짜와 장소를 추출하고 있어요...
          </Text>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#FF8FB1" : "#FF6B9D"}
            style={styles.spinner}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 24,
  },
  imagePlaceholderLight: {
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholderDark: {
    backgroundColor: "#333",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  loadingTextLight: {
    color: "#333",
  },
  loadingTextDark: {
    color: "#fff",
  },
  spinner: {
    marginTop: 16,
  },
});

export default LoadingScreen;
