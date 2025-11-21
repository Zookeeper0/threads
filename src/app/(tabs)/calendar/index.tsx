import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Dimensions,
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

// Figma에서 가져온 이미지 URL
const img9 =
  "http://localhost:3845/assets/5cea9e5ae6702af048907c09ead05336bb2dcec3.png";
const imgChevronDown =
  "http://localhost:3845/assets/939ef406cc0f06f43bb2bbb3270715be0b783aee.svg";
const imgPlus =
  "http://localhost:3845/assets/4c1375dc12556e5442fa8250b07726fe3018bdf1.svg";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  date: number;
  profileImage: string;
}

const events: CalendarEvent[] = [
  {
    id: "1",
    title: "중학교 친구들",
    time: "19:00-21:00",
    location: "@ 피자스쿨 광안점",
    date: 7,
    profileImage: img9,
  },
];

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

// 2025년 11월 캘린더 데이터 생성
const generateCalendarDays = () => {
  const year = 2025;
  const month = 10; // 11월 (0-based)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday?: boolean;
    hasEvent?: boolean;
  }> = [];

  // 이전 달의 마지막 날들
  for (let i = daysInPrevMonth - firstDay + 1; i <= daysInPrevMonth; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  // 현재 달의 날들
  for (let i = 1; i <= daysInMonth; i++) {
    const hasEvent = events.some((event) => event.date === i);
    days.push({
      day: i,
      isCurrentMonth: true,
      hasEvent,
    });
  }

  // 다음 달의 첫 날들 (6주를 채우기 위해)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  return days;
};

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MARGIN_BOTTOM = 18; // 기본 marginBottom

export default function CalendarView() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(7);
  const [currentMonth, setCurrentMonth] = useState("11월");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const calendarDays = generateCalendarDays();
  const selectedEvent = events.find((event) => event.date === selectedDate);

  const screenHeight = Dimensions.get("window").height;
  const tabBarTotalHeight =
    TAB_BAR_HEIGHT + TAB_BAR_MARGIN_BOTTOM + insets.bottom;
  const bottomSheetMaxHeight = screenHeight - tabBarTotalHeight;

  // Detail modal state
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

  const handleOpenDetail = () => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setIsDetailModalVisible(true);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailModalVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 - 월 선택 */}
        <View style={styles.header}>
          <View style={styles.monthSelector}>
            <Text style={styles.monthText}>{currentMonth}</Text>
            <Image
              source={{ uri: imgChevronDown }}
              style={styles.chevronIcon}
              contentFit="contain"
            />
          </View>
        </View>

        {/* 요일 표시 */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDay}>
              <Text
                style={[
                  styles.weekDayText,
                  index === 0 && styles.weekDayTextSunday,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* 캘린더 그리드 */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((dayData, index) => {
            const isSelected =
              dayData.day === selectedDate && dayData.isCurrentMonth;
            const isSunday = index % 7 === 0;
            const isSaturday = index % 7 === 6;
            const isHighlighted = dayData.day === 5 && dayData.isCurrentMonth; // 5일은 회색 배경

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !dayData.isCurrentMonth && styles.dayCellInactive,
                  isHighlighted && styles.dayCellHighlighted,
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => {
                  if (dayData.isCurrentMonth) {
                    setSelectedDate(dayData.day);
                  }
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    !dayData.isCurrentMonth && styles.dayTextInactive,
                    isSunday && dayData.isCurrentMonth && styles.dayTextSunday,
                    isSaturday &&
                      dayData.isCurrentMonth &&
                      styles.dayTextSaturday,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {dayData.day}
                </Text>
                {dayData.hasEvent && dayData.isCurrentMonth && (
                  <View style={styles.eventIndicator}>
                    <Text style={styles.eventText}>중학교친..</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 선택된 날짜의 이벤트 */}
        <View style={styles.eventSection}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventDateText}>
              2025년 11월 {selectedDate}일 (금)
            </Text>
            <TouchableOpacity style={styles.addEventButton}>
              <Image
                source={{ uri: imgPlus }}
                style={styles.addIcon}
                contentFit="contain"
              />
              <Text style={styles.addEventText}>일정</Text>
            </TouchableOpacity>
          </View>

          {selectedEvent && (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={handleOpenDetail}
              activeOpacity={0.7}
            >
              <View style={styles.eventTop}>
                <View style={styles.profileGroup}>
                  <View style={styles.profile}>
                    <Image
                      source={{ uri: selectedEvent.profileImage }}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                  </View>
                </View>
                <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
              </View>
              <View style={styles.eventBottom}>
                <Text style={styles.eventTime}>{selectedEvent.time}</Text>
                <Text style={styles.eventLocation}>
                  {selectedEvent.location}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* BottomSheet Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseDetail}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboardView}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalOverlay}
              onPress={handleCloseDetail}
            />
            <View
              style={[
                styles.bottomSheet,
                {
                  paddingBottom: Math.max(insets.bottom, 24),
                  maxHeight: bottomSheetMaxHeight,
                },
              ]}
            >
              {/* Header with drag indicator */}
              <View style={styles.bottomSheetHeader}>
                <View style={styles.dragIndicator} />
              </View>

              <ScrollView
                style={styles.bottomSheetScrollView}
                contentContainerStyle={styles.bottomSheetScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Title */}
                <View style={styles.bottomSheetSection}>
                  <Text style={styles.bottomSheetLabel}>제목</Text>
                  <TextInput
                    style={styles.bottomSheetTitleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="제목을 입력하세요"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>

                {/* Participants */}
                <View style={styles.bottomSheetSection}>
                  <View style={styles.bottomSheetParticipantsContainer}>
                    <View style={styles.bottomSheetProfileGroup}>
                      <View
                        style={[
                          styles.bottomSheetProfile,
                          styles.bottomSheetProfileFirst,
                        ]}
                      >
                        <Image
                          source={{ uri: img9 }}
                          style={styles.bottomSheetProfileImage}
                          contentFit="cover"
                        />
                      </View>
                      <View
                        style={[
                          styles.bottomSheetProfile,
                          styles.bottomSheetProfileSecond,
                        ]}
                      >
                        <Image
                          source={{ uri: img9 }}
                          style={styles.bottomSheetProfileImage}
                          contentFit="cover"
                        />
                      </View>
                      <View
                        style={[
                          styles.bottomSheetProfile,
                          styles.bottomSheetProfileThird,
                          styles.bottomSheetProfileHighlighted,
                        ]}
                      >
                        <View style={styles.bottomSheetProfileStacked}>
                          <Image
                            source={{ uri: img9 }}
                            style={styles.bottomSheetProfileImageSmall}
                            contentFit="cover"
                          />
                          <Image
                            source={{ uri: img9 }}
                            style={styles.bottomSheetProfileImageSmall}
                            contentFit="cover"
                          />
                        </View>
                      </View>
                    </View>
                    <Text style={styles.bottomSheetParticipantsText}>우리</Text>
                  </View>
                </View>

                {/* Date and Time */}
                <View style={styles.bottomSheetSection}>
                  <View style={styles.bottomSheetDateTimeRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#31170F"
                    />
                    <View style={styles.bottomSheetDateTimeContent}>
                      <View style={styles.bottomSheetDateRow}>
                        <Text style={styles.bottomSheetDateText}>
                          {startDate}
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color="#6F5B52"
                          style={styles.bottomSheetArrowIcon}
                        />
                        <Text style={styles.bottomSheetDateText}>
                          {endDate}
                        </Text>
                      </View>
                      {!isAllDay && (
                        <View style={styles.bottomSheetTimeRow}>
                          <Text style={styles.bottomSheetTimeText}>
                            {startTime}
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color="#6F5B52"
                            style={styles.bottomSheetArrowIcon}
                          />
                          <Text style={styles.bottomSheetTimeText}>
                            {endTime}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[
                          styles.bottomSheetAllDayButton,
                          isAllDay && styles.bottomSheetAllDayButtonActive,
                        ]}
                        onPress={() => setIsAllDay(!isAllDay)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.bottomSheetAllDayButtonText,
                            isAllDay &&
                              styles.bottomSheetAllDayButtonTextActive,
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
                  style={styles.bottomSheetOptionRow}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={20} color="#31170F" />
                  <Text style={styles.bottomSheetOptionLabel}>일정반복</Text>
                  <View style={styles.bottomSheetOptionRight}>
                    <Text style={styles.bottomSheetOptionValue}>
                      {repeatOption}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#A0A0A0" />
                  </View>
                </TouchableOpacity>

                {/* Reminder */}
                <TouchableOpacity
                  style={styles.bottomSheetOptionRow}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#31170F"
                  />
                  <Text style={styles.bottomSheetOptionLabel}>미리알림</Text>
                  <View style={styles.bottomSheetOptionRight}>
                    <Text style={styles.bottomSheetOptionValue}>
                      {reminderOption}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#A0A0A0" />
                  </View>
                </TouchableOpacity>

                {/* Location */}
                <View style={styles.bottomSheetOptionRow}>
                  <Ionicons name="location-outline" size={20} color="#31170F" />
                  <TextInput
                    style={styles.bottomSheetOptionInput}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="위치"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>

                {/* Notes */}
                <View style={styles.bottomSheetOptionRow}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#31170F"
                  />
                  <TextInput
                    style={styles.bottomSheetOptionInput}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthText: {
    fontSize: 28,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.56,
    lineHeight: 34,
  },
  chevronIcon: {
    width: 20,
    height: 20,
  },
  weekDaysContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 4,
    justifyContent: "space-between",
  },
  weekDay: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#404040",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  weekDayTextSunday: {
    color: "#FF383C",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 1,
    paddingTop: 8,
  },
  dayCell: {
    width: 46,
    height: 58,
    borderRadius: 8,
    padding: 2,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 1,
  },
  dayCellInactive: {
    opacity: 0.25,
  },
  dayCellHighlighted: {
    backgroundColor: "#E5E5E5",
  },
  dayCellSelected: {
    backgroundColor: "#1F0A05",
    paddingVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#404040",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  dayTextInactive: {
    color: "#040404",
  },
  dayTextSunday: {
    color: "#FF383C",
  },
  dayTextSaturday: {
    color: "#737373",
  },
  dayTextSelected: {
    color: "#FAF8F7",
  },
  eventIndicator: {
    backgroundColor: "#FF6638",
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 0,
    height: 12,
    width: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  eventText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#FAF8F7",
    letterSpacing: -0.2,
    lineHeight: 16,
  },
  eventSection: {
    padding: 16,
    gap: 8,
    marginTop: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventDateText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F0A05",
    letterSpacing: -0.32,
    lineHeight: 22,
  },
  addEventButton: {
    backgroundColor: "#FF6638",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 5.4,
    elevation: 3,
  },
  addIcon: {
    width: 16,
    height: 16,
  },
  addEventText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FAF8F7",
    letterSpacing: -0.7,
    lineHeight: 12,
  },
  eventCard: {
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    padding: 6,
    gap: 6,
  },
  eventTop: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  profileGroup: {
    flexDirection: "row",
    paddingRight: 6,
  },
  profile: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginLeft: -6,
    borderWidth: 0,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  eventBottom: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
  },
  eventTime: {
    fontSize: 12,
    fontWeight: "500",
    color: "#877A74",
    letterSpacing: -0.24,
    lineHeight: 16,
  },
  eventLocation: {
    fontSize: 12,
    fontWeight: "500",
    color: "#877A74",
    letterSpacing: -0.24,
    lineHeight: 16,
  },
  // BottomSheet Modal Styles
  modalKeyboardView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    height: "100%",
    zIndex: 9999,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    zIndex: 9999,
    elevation: 9999,
  },
  bottomSheetHeader: {
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: "center",
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E8E3E0",
  },
  bottomSheetScrollView: {
    flex: 1,
  },
  bottomSheetScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bottomSheetSection: {
    marginBottom: 24,
  },
  bottomSheetLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.28,
    marginBottom: 12,
  },
  bottomSheetTitleInput: {
    fontSize: 18,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.36,
    padding: 0,
    lineHeight: 24,
  },
  bottomSheetParticipantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  bottomSheetProfileGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomSheetProfile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#E8E3E0",
  },
  bottomSheetProfileFirst: {
    zIndex: 3,
  },
  bottomSheetProfileSecond: {
    marginLeft: -12,
    zIndex: 2,
  },
  bottomSheetProfileThird: {
    marginLeft: -12,
    zIndex: 1,
  },
  bottomSheetProfileHighlighted: {
    borderColor: "#FF6638",
    borderWidth: 2,
  },
  bottomSheetProfileImage: {
    width: "100%",
    height: "100%",
  },
  bottomSheetProfileStacked: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
  },
  bottomSheetProfileImageSmall: {
    width: "50%",
    height: "100%",
  },
  bottomSheetParticipantsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  bottomSheetDateTimeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 4,
  },
  bottomSheetDateTimeContent: {
    flex: 1,
    gap: 8,
  },
  bottomSheetDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bottomSheetDateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  bottomSheetTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bottomSheetTimeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  bottomSheetArrowIcon: {
    marginHorizontal: 4,
  },
  bottomSheetAllDayButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F0EB",
    marginTop: 4,
  },
  bottomSheetAllDayButtonActive: {
    backgroundColor: "#FF6638",
  },
  bottomSheetAllDayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6F5B52",
    letterSpacing: -0.28,
  },
  bottomSheetAllDayButtonTextActive: {
    color: "#FFFFFF",
  },
  bottomSheetOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F0EB",
    minHeight: 56,
  },
  bottomSheetOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#31170F",
    letterSpacing: -0.32,
  },
  bottomSheetOptionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bottomSheetOptionValue: {
    fontSize: 16,
    fontWeight: "400",
    color: "#A0A0A0",
    letterSpacing: -0.32,
  },
  bottomSheetOptionInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#31170F",
    letterSpacing: -0.32,
    padding: 0,
  },
});
