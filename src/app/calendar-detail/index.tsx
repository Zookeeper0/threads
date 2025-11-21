import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 더미 이미지 (실제로는 props나 params에서 받아올 것)
const img9 =
  "http://localhost:3845/assets/5cea9e5ae6702af048907c09ead05336bb2dcec3.png";

export default function CalendarDetail() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [title, setTitle] = useState("중학교 친구들");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState("2025년 11월 7일");
  const [endDate, setEndDate] = useState("2025년 11월 7일");
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:00");
  const [repeatOption, setRepeatOption] = useState("반복 없음");
  const [reminderOption, setReminderOption] = useState("알림 없음");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    setIsModalVisible(false);
    router.back();
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <Pressable
            style={styles.overlay}
            onPress={handleClose}
          />
          <View
            style={[
              styles.bottomSheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            {/* Header with drag indicator */}
            <View style={styles.header}>
              <View style={styles.dragIndicator} />
              <View style={styles.headerTop}>
                <Text style={styles.monthText}>11월</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="chevron-down" size={24} color="#31170F" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title */}
              <View style={styles.section}>
                <Text style={styles.label}>제목</Text>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="제목을 입력하세요"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              {/* Participants */}
              <View style={styles.section}>
                <View style={styles.participantsContainer}>
                  <View style={styles.profileGroup}>
                    <View style={[styles.profile, styles.profileFirst]}>
                      <Image
                        source={{ uri: img9 }}
                        style={styles.profileImage}
                        contentFit="cover"
                      />
                    </View>
                    <View style={[styles.profile, styles.profileSecond]}>
                      <Image
                        source={{ uri: img9 }}
                        style={styles.profileImage}
                        contentFit="cover"
                      />
                    </View>
                    <View style={[styles.profile, styles.profileThird]}>
                      <View style={styles.profileStacked}>
                        <Image
                          source={{ uri: img9 }}
                          style={styles.profileImageSmall}
                          contentFit="cover"
                        />
                        <Image
                          source={{ uri: img9 }}
                          style={styles.profileImageSmall}
                          contentFit="cover"
                        />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.participantsText}>우리</Text>
                </View>
              </View>

              {/* Date and Time */}
              <View style={styles.section}>
                <View style={styles.dateTimeRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#31170F"
                  />
                  <View style={styles.dateTimeContent}>
                    <View style={styles.dateRow}>
                      <Text style={styles.dateText}>{startDate}</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#6F5B52"
                        style={styles.arrowIcon}
                      />
                      <Text style={styles.dateText}>{endDate}</Text>
                    </View>
                    {!isAllDay && (
                      <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{startTime}</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color="#6F5B52"
                          style={styles.arrowIcon}
                        />
                        <Text style={styles.timeText}>{endTime}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.allDayButton,
                        isAllDay && styles.allDayButtonActive,
                      ]}
                      onPress={() => setIsAllDay(!isAllDay)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.allDayButtonText,
                          isAllDay && styles.allDayButtonTextActive,
                        ]}
                      >
                        하루종일
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Repeat Schedule */}
              <TouchableOpacity
                style={styles.optionRow}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color="#31170F"
                />
                <Text style={styles.optionLabel}>일정반복</Text>
                <View style={styles.optionRight}>
                  <Text style={styles.optionValue}>{repeatOption}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color="#A0A0A0"
                  />
                </View>
              </TouchableOpacity>

              {/* Reminder */}
              <TouchableOpacity
                style={styles.optionRow}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={20} color="#31170F" />
                <Text style={styles.optionLabel}>미리알림</Text>
                <View style={styles.optionRight}>
                  <Text style={styles.optionValue}>{reminderOption}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color="#A0A0A0"
                  />
                </View>
              </TouchableOpacity>

              {/* Location */}
              <View style={styles.optionRow}>
                <Ionicons name="location-outline" size={20} color="#31170F" />
                <TextInput
                  style={styles.optionInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="위치"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              {/* Notes */}
              <View style={styles.optionRow}>
                <Ionicons name="document-text-outline" size={20} color="#31170F" />
                <TextInput
                  style={styles.optionInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="메모"
                  placeholderTextColor="#A0A0A0"
                  multiline
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dragIndicator: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E8E3E0",
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#A0A0A0",
    letterSpacing: -0.28,
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.36,
    padding: 0,
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  profile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#E8E3E0",
  },
  profileFirst: {
    zIndex: 3,
  },
  profileSecond: {
    marginLeft: -12,
    zIndex: 2,
  },
  profileThird: {
    marginLeft: -12,
    zIndex: 1,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileStacked: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
  },
  profileImageSmall: {
    width: "50%",
    height: "100%",
  },
  participantsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dateTimeContent: {
    flex: 1,
    gap: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  allDayButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F0EB",
    marginTop: 4,
  },
  allDayButtonActive: {
    backgroundColor: "#FF6638",
  },
  allDayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6F5B52",
    letterSpacing: -0.28,
  },
  allDayButtonTextActive: {
    color: "#FFFFFF",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F0EB",
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionValue: {
    fontSize: 16,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.32,
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.32,
    padding: 0,
  },
});

