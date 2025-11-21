import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const imgImage = require("../../assets/svg/image.svg");
const imgCamera = require("../../assets/svg/camera.svg");
const imgCloseX = require("../../assets/svg/close.svg");

// Figma에서 가져온 이미지 URL
const imgChevronLeft =
  "http://localhost:3845/assets/d5aa97f09bd8f8456af8e788ea43c9b3b7016009.svg";
const imgClose =
  "http://localhost:3845/assets/99c1561652cc77a322c17760e07ebd7719ecf8c5.svg";
const imgCheck1 =
  "http://localhost:3845/assets/3e4e187d8723f07c2ffbe1e27bdce29758a31909.svg";
const imgCheck2 =
  "http://localhost:3845/assets/a70f2d219e54f69baea262b7726a3e0bb552110e.svg";
const imgCheck3 =
  "http://localhost:3845/assets/85f7aafd89b7d7a6aead3ca5c938776272ba21c6.svg";
// 안쪽 사진 이미지
const imgInnerPhoto =
  "http://localhost:3845/assets/3e4e187d8723f07c2ffbe1e27bdce29758a31909.svg";
// BottomSheet 아이콘

const imgGallery =
  "http://localhost:3845/assets/040b8706f0b1fa0c0b434beda4325b5776be7a08.svg";

export default function AlbumAddScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const canSubmit = title.trim().length > 0;

  const handlePhotoButtonPress = () => {
    setIsBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetVisible(false);
  };

  const handleTakePhoto = () => {
    // TODO: 사진 촬영 로직 구현
    handleCloseBottomSheet();
  };

  const handleSelectFromAlbum = () => {
    // TODO: 앨범에서 선택 로직 구현
    handleCloseBottomSheet();
  };

  return (
    <View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* 헤더 */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: insets.top + 51,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Image
            source={{ uri: imgChevronLeft }}
            style={styles.headerIcon}
            contentFit="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Image
            source={{ uri: imgClose }}
            style={styles.headerIcon}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {/* 키보드 반응형 컨텐츠 */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Sheet Content */}
          <View style={styles.sheetContent}>
            {/* 커버 이미지 영역 */}
            <View style={styles.coverContainer}>
              <View style={styles.coverImage}>
                <View style={styles.coverImageInner} />
                {/* 안쪽 사진 영역 */}
                <View style={styles.innerPhotoContainer}>
                  <Image
                    source={{ uri: imgInnerPhoto }}
                    style={styles.innerPhoto}
                    contentFit="cover"
                  />
                </View>
              </View>
              {/* 테이프 (위 오른쪽) */}
              <View style={styles.tapeTopRight}>
                <Image
                  source={{ uri: imgCheck2 }}
                  style={styles.tapeIcon}
                  contentFit="contain"
                />
              </View>
              {/* 테이프 (아래 왼쪽) */}
              <View style={styles.tapeBottomLeft}>
                <Image
                  source={{ uri: imgCheck3 }}
                  style={styles.tapeIcon}
                  contentFit="contain"
                />
              </View>
              {/* 사진 버튼 */}
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePhotoButtonPress}
              >
                <View style={styles.photoButtonInner}>
                  <Image
                    source={imgCamera}
                    style={styles.cameraIcon}
                    contentFit="contain"
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* 앨범 이름 입력 */}
            <View style={styles.inputContainer}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="앨범 이름"
                style={styles.input}
                placeholderTextColor="#A39892"
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 버튼 */}
      <View
        style={[
          styles.bottomButton,
          { paddingBottom: Math.max(insets.bottom + 16, 16) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.createButton,
            !canSubmit && styles.createButtonDisabled,
          ]}
          disabled={!canSubmit}
          onPress={() => router.back()}
        >
          <Text style={styles.createButtonText}>앨범 만들기</Text>
        </TouchableOpacity>
      </View>

      {/* BottomSheet 모달 */}
      <Modal
        visible={isBottomSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseBottomSheet}
      >
        <Pressable
          style={styles.bottomSheetOverlay}
          onPress={handleCloseBottomSheet}
        >
          <Pressable
            style={[
              styles.bottomSheet,
              { paddingBottom: Math.max(insets.bottom + 24, 24) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>더보기</Text>
              <TouchableOpacity
                style={styles.bottomSheetCloseButton}
                onPress={() => {
                  // X 버튼 누를 때 할 추가 동작이 있다면 여기에 작성
                  setIsBottomSheetVisible(false);
                  // 예: toast 메시지 보여주기 등
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image
                  source={imgCloseX}
                  style={{
                    width: 12,
                    height: 12,
                  }}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.bottomSheetContent}>
              {/* 사진 촬영 */}
              <TouchableOpacity onPress={handleTakePhoto} activeOpacity={0.7}>
                <View style={styles.bottomSheetOptionIcon}>
                  <Image
                    source={imgCamera}
                    style={styles.bottomSheetOptionIconImage}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.bottomSheetOptionText}>사진 촬영</Text>
              </TouchableOpacity>

              {/* 사진 앨범 */}
              <TouchableOpacity
                onPress={handleSelectFromAlbum}
                activeOpacity={0.7}
              >
                <View style={styles.bottomSheetOptionIcon}>
                  <Image
                    source={imgImage}
                    style={styles.bottomSheetOptionIconImage}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.bottomSheetOptionText}>사진 앨범</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FAF9FA",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  headerButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
  },
  sheetContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  coverContainer: {
    width: 155,
    height: 155,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: {
    width: 155,
    height: 155,
    borderRadius: 16,
    backgroundColor: "#EEDFC7",
    overflow: "visible",
    position: "relative",
  },
  coverImageInner: {
    width: 155,
    height: 155,
    position: "absolute",
    left: 0,
    top: 0,
    borderLeftWidth: 8,
    borderLeftColor: "#FF6638",
    backgroundColor: "#FFCAB8",
    borderRadius: 16,
  },
  innerPhotoContainer: {
    position: "absolute",
    top: 32,
    left: 43,
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  innerPhoto: {
    width: 52,
    height: 41,
    borderRadius: 4,
  },
  tapeTopRight: {
    position: "absolute",
    top: 0,
    right: 55.71,
    width: 15.248,
    height: 4.5,
    transform: [{ rotate: "44.446deg" }],
  },
  tapeBottomLeft: {
    position: "absolute",
    bottom: 56.18,
    left: 0,
    width: 15.248,
    height: 4.5,
    transform: [{ rotate: "30deg" }],
  },
  tapeIcon: {
    width: "100%",
    height: "100%",
  },
  photoButton: {
    position: "absolute",
    bottom: -10,
    right: -9,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF4F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.11,
    shadowRadius: 2,
    elevation: 3,
  },
  photoButtonInner: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    width: 24,
    height: 24,
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#E8E3E0",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 20,
    fontWeight: "500",
    color: "#3A2B23",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#FAF8F7",
    gap: 10,
  },
  createButton: {
    backgroundColor: "#FFE5DC",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#F5E5DC",
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  // BottomSheet Styles
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.18,
    shadowRadius: 75,
    elevation: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 16,
    width: "100%",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#31170F",
    letterSpacing: -0.36,
    lineHeight: 24,
  },
  bottomSheetCloseButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  bottomSheetCloseIcon: {
    width: 16,
    height: 16,
  },
  bottomSheetContent: {
    flexDirection: "row",
    gap: 65,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  bottomSheetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F1EF",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#FF6638",
  },
  bottomSheetOptionIconImage: {
    width: 24,
    height: 24,
  },
  bottomSheetOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.28,
    textAlign: "center",
    lineHeight: 20,
  },
});
