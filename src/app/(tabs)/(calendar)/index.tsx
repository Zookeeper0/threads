import { Image } from "expo-image";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
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

export default function CalendarView() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(7);
  const [currentMonth, setCurrentMonth] = useState("11월");
  const calendarDays = generateCalendarDays();
  const selectedEvent = events.find((event) => event.date === selectedDate);

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
            <View style={styles.eventCard}>
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
            </View>
          )}
        </View>
      </ScrollView>
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
});
