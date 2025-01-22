import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { firebaseConfig } from "../../firebaseConfig";
import { icons } from "../../constants";
import { Link } from "expo-router";

// Firebase initialization
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const auth = getAuth();
const database = getDatabase();

const Home = () => {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(24); // Default to 24 weeks, can be changed to 12
  const [startDate, setStartDate] = useState(null);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [editedActivity, setEditedActivity] = useState("");
  const [todayIndex, setTodayIndex] = useState(null);
  const [days, setDays] = useState([
    { day: "Mon", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Tue", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Wed", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Thurs", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Fri", timeIn: "", timeOut: "", activity: "", date: "" },
  ]);

  // Initialize start date and current week
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user settings
        const userSettingsRef = ref(database, `users/${currentUser.uid}/settings`);
        onValue(userSettingsRef, (snapshot) => {
          const settings = snapshot.val();
          if (settings) {
            setTotalWeeks(settings.totalWeeks || 24);
            if (settings.startDate) {
              setStartDate(new Date(settings.startDate));
              calculateCurrentWeek(new Date(settings.startDate));
            } else {
              initializeStartDate(currentUser.uid);
            }
          } else {
            initializeStartDate(currentUser.uid);
          }
        });

        // Load profile image
        const userRef = ref(database, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data?.profileImage) {
            setProfileImage(data.profileImage);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const initializeStartDate = async (userId) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    setStartDate(monday);
    
    try {
      await set(ref(database, `users/${userId}/settings`), {
        startDate: monday.toISOString(),
        totalWeeks: 24
      });
    } catch (error) {
      Alert.alert("Error", "Failed to initialize start date");
    }
  };

  const calculateCurrentWeek = (start) => {
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.min(Math.ceil(diffDays / 7), totalWeeks);
    setCurrentWeek(weekNumber);
  };

  // Update days array based on selected week
  useEffect(() => {
    if (startDate) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7);
      updateDaysForWeek(weekStart);
    }
  }, [currentWeek, startDate]);

  const updateDaysForWeek = (weekStart) => {
    const updatedDays = days.map((day, index) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + index);
      const dateString = currentDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit"
      });
      
      // Check if this is today
      const today = new Date();
      if (
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      ) {
        setTodayIndex(index);
      } else if (index === 0 && currentDate > today) {
        setTodayIndex(null); // Future week
      }
      
      return {
        ...day,
        date: dateString,
      };
    });
    
    setDays(updatedDays);
    loadWeekData(weekStart);
  };

  const loadWeekData = async (weekStart) => {
    if (!user) return;

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

    const attendanceRef = ref(database, `users/${user.uid}/attendance`);
    onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedDays = days.map(day => {
          const existingRecord = data[day.date];
          return existingRecord ? { ...day, ...existingRecord } : day;
        });
        setDays(updatedDays);
      }
    });
  };

  const handleSignIn = async () => {
    if (!user || todayIndex === null) return;
    
    const currentTime = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    
    const updatedDays = [...days];
    if (!updatedDays[todayIndex].timeIn) {
      updatedDays[todayIndex] = {
        ...updatedDays[todayIndex],
        timeIn: currentTime
      };
      setDays(updatedDays);
      await saveAttendanceToFirebase(updatedDays);
      Alert.alert("Success", "Signed in successfully!");
    }
  };

  const handleSignOut = async () => {
    if (!user || todayIndex === null) return;
    
    const currentTime = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    
    const updatedDays = [...days];
    if (updatedDays[todayIndex].timeIn && !updatedDays[todayIndex].timeOut) {
      updatedDays[todayIndex] = {
        ...updatedDays[todayIndex],
        timeOut: currentTime
      };
      setDays(updatedDays);
      await saveAttendanceToFirebase(updatedDays);
      Alert.alert("Success", "Signed out successfully!");
    }
  };

  const saveAttendanceToFirebase = async (updatedDays) => {
    if (!user) return;
    try {
      const attendanceRef = ref(database, `users/${user.uid}/attendance`);
      const attendanceData = {};
      updatedDays.forEach(day => {
        if (day.date) {
          attendanceData[day.date] = {
            timeIn: day.timeIn,
            timeOut: day.timeOut,
            activity: day.activity
          };
        }
      });
      await set(attendanceRef, attendanceData);
    } catch (error) {
      Alert.alert("Error", "Failed to save attendance");
    }
  };

  const isSignInDisabled = () => {
    if (todayIndex === null) return true;
    return !!days[todayIndex].timeIn;
  };

  const isSignOutDisabled = () => {
    if (todayIndex === null) return true;
    return !days[todayIndex].timeIn || !!days[todayIndex].timeOut;
  };

  const WeekDropdown = () => {
    const weeks = Array.from({ length: currentWeek }, (_, i) => i + 1);
    
    return (
      <Modal
        transparent={true}
        visible={showWeekDropdown}
        onRequestClose={() => setShowWeekDropdown(false)}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowWeekDropdown(false)}
        >
          <View style={styles.dropdownContent}>
            <ScrollView>
              {weeks.reverse().map((week) => (
                <TouchableOpacity
                  key={week}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCurrentWeek(week);
                    setShowWeekDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownText,
                    week === currentWeek && styles.selectedWeek
                  ]}>
                    Week {week}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const ActivityModal = () => (
    <Modal
      transparent={true}
      visible={isModalVisible}
      animationType="fade"
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Activity</Text>
          <TextInput
            style={styles.modalInput}
            multiline
            value={editedActivity}
            onChangeText={setEditedActivity}
            placeholder="Enter your activity..."
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={async () => {
                if (selectedDayIndex !== null) {
                  const updatedDays = [...days];
                  updatedDays[selectedDayIndex] = {
                    ...updatedDays[selectedDayIndex],
                    activity: editedActivity.trim()
                  };
                  setDays(updatedDays);
                  await saveAttendanceToFirebase(updatedDays);
                  setIsModalVisible(false);
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                {user?.displayName?.charAt(0) || "U"}
              </Text>
            </View>
          )}
        </View>
        <Link href="/notification" style={styles.icon}>
          <Image source={icons.notificationActive} style={styles.icon} />
        </Link>
      </View>

      <TouchableOpacity 
        style={styles.weekSelector}
        onPress={() => setShowWeekDropdown(true)}
      >
        <Text style={styles.weekText}>Week {currentWeek} of {totalWeeks}</Text>
        {startDate && (
          <Text style={styles.dateRangeText}>
            {new Date(startDate.getTime() + (currentWeek - 1) * 7 * 24 * 60 * 60 * 1000)
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - {new Date(startDate.getTime() + (currentWeek - 1) * 7 * 24 * 60 * 60 * 1000 + 4 * 24 * 60 * 60 * 1000)
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
          </Text>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.tableContainer}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>Day</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Time in</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Activities</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Time out</Text>
          </View>

          {days.map((day, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow,
                index === todayIndex && styles.todayRow
              ]}
            >
              <View style={[styles.cell, { flex: 0.8 }]}>
                <Text style={styles.dayText}>{day.day}</Text>
                <Text style={styles.dateText}>{day.date}</Text>
              </View>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text style={styles.timeText}>
                  {day.timeIn || "--:--"}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.cell, { flex: 1.5 }]}
                onPress={() => {
                  setSelectedDayIndex(index);
                  setEditedActivity(day.activity);
                  setIsModalVisible(true);
                }}
              >
                <Text 
                  style={styles.activityText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {day.activity || "Enter activity..."}
                </Text>
              </TouchableOpacity>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text style={styles.timeText}>
                  {day.timeOut || "--:--"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.signInButton,
            isSignInDisabled() && styles.disabledButton
          ]} 
          onPress={handleSignIn}
          disabled={isSignInDisabled()}
        >
          <Text style={[
            styles.buttonText,
            styles.signInText,
            isSignInDisabled() && styles.disabledText
          ]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.signOutButton,
            isSignOutDisabled() && styles.disabledButton
          ]} 
          onPress={handleSignOut}
          disabled={isSignOutDisabled()}
        >
          <Text style={[
            styles.buttonText,
            styles.signOutText,
            isSignOutDisabled() && styles.disabledText
          ]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={showWeekDropdown}
        onRequestClose={() => setShowWeekDropdown(false)}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowWeekDropdown(false)}
        >
          <View style={styles.dropdownContent}>
            <ScrollView>
              {Array.from({ length: currentWeek }, (_, i) => i + 1)
                .reverse()
                .map((week) => (
                  <TouchableOpacity
                    key={week}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCurrentWeek(week);
                      setShowWeekDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      week === currentWeek && styles.selectedWeek
                    ]}>
                      Week {week}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Activity</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              value={editedActivity}
              onChangeText={setEditedActivity}
              placeholder="Enter your activity..."
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={async () => {
                  if (selectedDayIndex !== null) {
                    const updatedDays = [...days];
                    updatedDays[selectedDayIndex] = {
                      ...updatedDays[selectedDayIndex],
                      activity: editedActivity.trim()
                    };
                    setDays(updatedDays);
                    await saveAttendanceToFirebase(updatedDays);
                    setIsModalVisible(false);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    profileContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      width: '100%',
      height: '100%',
      backgroundColor: '#ddd',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 18,
      color: '#666',
    },
    icon: {
      width: 24,
      height: 24,
    },
    weekSelector: {
      backgroundColor: '#F5F5F5',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    weekText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    dateRangeText: {
      fontSize: 14,
      color: '#666',
    },
    tableContainer: {
      flex: 1,
      marginBottom: 16,
    },
    table: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F5F5F5',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    headerCell: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      color: '#333',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      paddingVertical: 8,
      backgroundColor: '#fff',
    },
    todayRow: {
      backgroundColor: '#F0F8FF',
    },
    cell: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    dateText: {
      fontSize: 12,
      color: '#666',
      marginTop: 2,
    },
    timeText: {
      fontSize: 14,
      color: '#333',
    },
    activityText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      paddingHorizontal: 4,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    signInButton: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#60B2FF',
    },
    signOutButton: {
      backgroundColor: '#60B2FF',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    signInText: {
      color: '#60B2FF',
    },
    signOutText: {
      color: '#fff',
    },
    disabledButton: {
      opacity: 0.5,
    },
    disabledText: {
      opacity: 0.5,
    },
    dropdownOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      width: '80%',
      maxHeight: '60%',
      maxWidth: 400,
    },
    dropdownItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    dropdownText: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
    },
    selectedWeek: {
      color: '#60B2FF',
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      padding: 12,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    modalButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      marginLeft: 12,
    },
    cancelButton: {
      backgroundColor: '#f5f5f5',
    },
    saveButton: {
      backgroundColor: '#60B2FF',
    },
    cancelButtonText: {
      color: '#666',
      fontSize: 16,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });

export default Home;