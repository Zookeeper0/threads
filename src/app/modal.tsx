import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Modal as RNModal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 스레드 데이터 구조 정의
interface Thread {
  id: string;
  text: string;
  hashtag?: string;
  location?: [number, number];
  imageUrls: string[];
}

// 스레드 목록 하단에 새로운 스레드를 추가할 수 있는 컴포넌트
export function ListFooter({
  canAddThread,
  addThread,
}: {
  canAddThread: boolean;
  addThread: () => void;
}) {
  return (
    <View style={styles.listFooter}>
      <View style={styles.listFooterAvatar}>
        <Image
          source={require("@/assets/images/avatar.png")}
          style={styles.avatarSmall}
        />
      </View>
      <View>
        <Pressable onPress={addThread} style={styles.input}>
          <Text style={{ color: canAddThread ? "#999" : "#aaa" }}>
            Add to thread
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function Modal() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  // 스레드 목록 상태 관리 (초기값: 빈 스레드 1개)
  const [threads, setThreads] = useState<Thread[]>([
    { id: Date.now().toString(), text: "", imageUrls: [] },
  ]);
  const insets = useSafeAreaInsets();
  // 답글 허용 범위 설정 (기본값: 누구나)
  const [replyOption, setReplyOption] = useState("Anyone");
  // 드롭다운 표시 여부
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // 포스팅 진행 중 여부 (중복 제출 방지)
  const [isPosting, setIsPosting] = useState(false);

  // 답글 허용 범위 옵션들
  const replyOptions = ["Anyone", "Profiles you follow", "Mentioned only"];

  // 모달 취소 처리 (포스팅 중에는 비활성화)
  const handleCancel = () => {
    if (isPosting) return;
    router.back();
  };

  // 스레드 포스팅 처리 (구현 예정)
  const handlePost = () => {};

  // 특정 스레드의 텍스트 내용 업데이트
  const updateThreadText = (id: string, text: string) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id ? { ...thread, text } : thread
      )
    );
  };

  // 새 스레드 추가 가능 여부 (마지막 스레드에 텍스트가 있을 때만)
  const canAddThread =
    (threads.at(-1)?.text.trim().length ?? 0) > 0 ||
    (threads.at(-1)?.imageUrls.length ?? 0) > 0;
  // 포스팅 가능 여부 (모든 스레드에 텍스트가 있을 때만)
  const canPost = threads.every(
    (thread) => thread.text.trim().length > 0 || thread.imageUrls.length > 0
  );

  // 스레드에 이미지 추가 (구현 예정)
  const addImageToThread = (id: string, uri: string) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              imageUrls: [...(thread.imageUrls || []), uri],
            }
          : thread
      )
    );
  };

  // 스레드에 위치 정보 추가 (구현 예정)
  const addLocationToThread = (id: string, location: [number, number]) => {};

  // 특정 스레드 제거 (첫 번째 스레드는 제거 불가)
  const removeThread = (id: string) => {
    setThreads((prevThreads) =>
      prevThreads.filter((thread) => thread.id !== id)
    );
  };

  // 갤러리에서 이미지 선택 (구현 예정)
  const pickImage = async (id: string) => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Photos permission not granted",
        "Please grant photos permission to use this feature",
        [
          { text: "Open settings", onPress: () => Linking.openSettings() },
          {
            text: "Cancel",
          },
        ]
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "livePhotos", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    console.log("image result", result);
    if (!result.canceled) {
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === id
            ? {
                ...thread,
                imageUrls: [
                  ...(thread.imageUrls || []),
                  ...(result.assets?.map((asset) => asset.uri) ?? []),
                ],
              }
            : thread
        )
      );
    }
  };

  // 카메라로 사진 촬영 (구현 예정)
  const takePhoto = async (id: string) => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission not granted",
        "Please grant permission to use this feature",
        [
          {
            text: "Open settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
          {
            text: "Cancel",
          },
        ]
      );
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "livePhotos", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    console.log("camera result", result);
    // * MediaLibrary 를 추가함으로써 촬영한 사진을 휴대폰 로컬갤러리에도 저장 할 수 있게 손쉽게 접근 ( 갤러리에 저장 해주는 부분 )
    status = (await MediaLibrary.requestPermissionsAsync()).status;
    if (status === "granted" && result.assets?.[0].uri) {
      MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }

    if (!result.canceled) {
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === id
            ? {
                ...thread,
                imageUrls: thread.imageUrls.concat(
                  result.assets?.map((asset) => asset.uri) ?? []
                ),
              }
            : thread
        )
      );
    }
  };

  // 스레드에서 특정 이미지 제거 (구현 예정)
  const removeImageFromThread = (id: string, uriToRemove: string) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              imageUrls: thread.imageUrls.filter((uri) => uri !== uriToRemove),
            }
          : thread
      )
    );
  };

  // 현재 위치 정보를 가져와서 스레드에 추가
  const getMyLocation = async (id: string) => {
    // 위치 권한 요청
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("getMyLocation", status);

    // 권한이 거부된 경우 설정으로 이동하는 옵션 제공
    if (status !== "granted") {
      Alert.alert(
        "Location permission not granted",
        "Please grant location permission to use this feature",
        [
          {
            text: "Open settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
          {
            text: "Cancel",
          },
        ]
      );
      return;
    }

    // 현재 위치 정보 가져오기
    const location = await Location.getCurrentPositionAsync({});

    // 해당 스레드에 위치 정보 추가
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              location: [location.coords.latitude, location.coords.longitude],
            }
          : thread
      )
    );
  };

  // 개별 스레드 아이템 렌더링
  const renderThreadItem = ({
    item,
    index,
  }: {
    item: Thread;
    index: number;
  }) => (
    <View style={styles.threadContainer}>
      {/* 사용자 아바타와 스레드 연결선 */}
      <View style={styles.avatarContainer}>
        <Image
          source={require("../assets/images/avatar.png")}
          style={styles.avatar}
        />
        <View style={styles.threadLine} />
      </View>

      {/* 스레드 내용 영역 */}
      <View style={styles.contentContainer}>
        {/* 사용자 정보와 스레드 제거 버튼 */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.username}>zerohch0</Text>
          {/* 첫 번째 스레드가 아닌 경우에만 제거 버튼 표시 */}
          {index > 0 && (
            <TouchableOpacity
              onPress={() => removeThread(item.id)}
              style={styles.removeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-outline" size={20} color="#8e8e93" />
            </TouchableOpacity>
          )}
        </View>

        {/* 스레드 텍스트 입력 영역 */}
        <TextInput
          style={styles.input}
          placeholder={"What's new?"}
          placeholderTextColor="#999"
          value={item.text}
          onChangeText={(text) => updateThreadText(item.id, text)}
          multiline
        />

        {/* 이미지 미리보기 영역 (이미지가 있을 때만 표시) */}
        {item?.imageUrls && item?.imageUrls.length > 0 && (
          <FlatList
            data={item.imageUrls}
            renderItem={({ item: uri, index: imgIndex }) => (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                {/* 이미지 제거 버튼 */}
                <TouchableOpacity
                  onPress={() =>
                    !isPosting && removeImageFromThread(item.id, uri)
                  }
                  style={styles.removeImageButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="rgba(0,0,0,0.7)"
                  />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(uri, imgIndex) =>
              `${item.id}-img-${imgIndex}-${uri}`
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageFlatList}
          />
        )}

        {/* 위치 정보 표시 (위치가 있을 때만 표시) */}
        {item.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {item.location[0]}, {item.location[1]}
            </Text>
          </View>
        )}

        {/* 액션 버튼들 (이미지, 카메라, 위치) */}
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => !isPosting && pickImage(item.id)}
          >
            <Ionicons name="image-outline" size={24} color="#777" />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => !isPosting && takePhoto(item.id)}
          >
            <Ionicons name="camera-outline" size={24} color="#777" />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              getMyLocation(item.id);
            }}
          >
            <FontAwesome name="map-marker" size={24} color="#777" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} disabled={isPosting}>
          <Text style={[styles.cancel, isPosting && styles.disabledText]}>
            Cancel
          </Text>
        </Pressable>
        <Text style={styles.title}>New thread</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* 스레드 목록 */}
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThreadItem}
        ListFooterComponent={
          <ListFooter
            canAddThread={canAddThread}
            addThread={() => {
              // 새 스레드 추가 (마지막 스레드에 텍스트가 있을 때만)
              if (canAddThread) {
                setThreads((prevThreads) => [
                  ...prevThreads,
                  { id: Date.now().toString(), text: "", imageUrls: [] },
                ]);
              }
            }}
          />
        }
        style={styles.list}
        contentContainerStyle={{ backgroundColor: "#ddd" }}
        keyboardShouldPersistTaps="handled"
      />

      <RNModal
        transparent={true}
        visible={isDropdownVisible}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdownContainer,
              { bottom: insets.bottom + 30 },
              colorScheme === "dark"
                ? styles.dropdownContainerDark
                : styles.dropdownContainerLight,
            ]}
          >
            {replyOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.dropdownOption,
                  option === replyOption && styles.selectedOption,
                ]}
                onPress={() => {
                  setReplyOption(option);
                  setIsDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    colorScheme === "dark"
                      ? styles.dropdownOptionTextDark
                      : styles.dropdownOptionTextLight,
                    option === replyOption && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </RNModal>

      {/* 하단 푸터 영역 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        {/* 답글 허용 범위 설정 */}
        <Pressable onPress={() => setIsDropdownVisible(true)}>
          <Text style={styles.footerText}>{replyOption} can reply & quote</Text>
        </Pressable>
        {/* 포스팅 버튼 */}
        <Pressable
          style={[
            styles.postButton,
            !canPost &&
              (colorScheme === "dark"
                ? styles.postButtonDisabledDark
                : styles.postButtonDisabledLight),
          ]}
          disabled={!canPost}
          onPress={handlePost}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerLight: {
    backgroundColor: "#fff",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLight: {
    backgroundColor: "#fff",
  },
  headerDark: {
    backgroundColor: "#101010",
  },
  headerRightPlaceholder: {
    width: 60,
  },
  cancel: {
    fontSize: 16,
  },
  cancelLight: {
    color: "#000",
  },
  cancelDark: {
    color: "#fff",
  },
  disabledText: {
    color: "#ccc",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  titleLight: {
    color: "#000",
  },
  titleDark: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  listLight: {
    backgroundColor: "white",
  },
  listDark: {
    backgroundColor: "#101010",
  },
  threadContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  avatarContainer: {
    alignItems: "center",
    marginRight: 12,
    paddingTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#555",
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#555",
  },
  threadLine: {
    width: 1.5,
    flexGrow: 1,
    backgroundColor: "#aaa",
    marginTop: 8,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 6,
  },
  userInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  username: {
    fontWeight: "600",
    fontSize: 15,
  },
  usernameLight: {
    color: "#000",
  },
  usernameDark: {
    color: "#fff",
  },
  input: {
    fontSize: 15,
    paddingTop: 4,
    paddingBottom: 8,
    minHeight: 24,
    lineHeight: 20,
  },
  inputLight: {
    color: "#000",
  },
  inputDark: {
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: 15,
  },
  imageFlatList: {
    marginTop: 12,
    marginBottom: 4,
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: 8,
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerLight: {
    backgroundColor: "white",
  },
  footerDark: {
    backgroundColor: "#101010",
  },
  footerText: {
    fontSize: 14,
  },
  footerTextLight: {
    color: "#8e8e93",
  },
  footerTextDark: {
    color: "#555",
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  postButtonLight: {
    backgroundColor: "black",
  },
  postButtonDark: {
    backgroundColor: "white",
  },
  postButtonDisabledLight: {
    backgroundColor: "#ccc",
  },
  postButtonDisabledDark: {
    backgroundColor: "#555",
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  postButtonTextLight: {
    color: "white",
  },
  postButtonTextDark: {
    color: "black",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  dropdownContainer: {
    width: 200,
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  dropdownContainerLight: {
    backgroundColor: "white",
  },
  dropdownContainerDark: {
    backgroundColor: "#101010",
  },
  dropdownOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  selectedOption: {},
  dropdownOptionText: {
    fontSize: 16,
  },
  dropdownOptionTextLight: {
    color: "#000",
  },
  dropdownOptionTextDark: {
    color: "#fff",
  },
  selectedOptionText: {
    fontWeight: "600",
    color: "#007AFF",
  },
  removeButton: {
    padding: 4,
    marginRight: -4,
    marginLeft: 8,
  },
  listFooter: {
    paddingLeft: 26,
    paddingTop: 10,
    flexDirection: "row",
  },
  listFooterAvatar: {
    marginRight: 20,
    paddingTop: 2,
  },
  locationContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#8e8e93",
  },
});
