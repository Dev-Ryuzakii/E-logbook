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
} from "react-native";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseConfig } from "../../firebaseConfig"; // Ensure this file exists
import { icons } from "../../constants"; // Ensure icons are correctly defined
import { Link } from "expo-router"; // Using Link for routing

import Profile from "../../screen/profile"; // Import Profile
import Notification from "../../screen/notification"; // Import Notification

// Initialize Firebase App if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const auth = getAuth();
const database = getDatabase();

const Home = () => {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // Store the profile image URL
  const [days, setDays] = useState([
    { day: "Mon", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Tue", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Wed", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Thurs", timeIn: "", timeOut: "", activity: "", date: "" },
    { day: "Fri", timeIn: "", timeOut: "", activity: "", date: "" },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [editedActivity, setEditedActivity] = useState(""); // Store the edited activity

  // Function to calculate the current week of SIWES or practicum based on registration date
  const getCurrentWeek = (registrationDate, practicumDuration) => {
    const startDate = new Date(registrationDate);
    const currentDate = new Date();
    const weekDiff = Math.floor(
      (currentDate - startDate) / (1000 * 60 * 60 * 24 * 7)
    );
    if (weekDiff <= practicumDuration) {
      return weekDiff + 1; // Return the current week number (1-based)
    }
    return practicumDuration; // If the practicum is over, return the max duration
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile image from Firebase Database
        const userRef = ref(database, "users/" + currentUser.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.profileImage) {
            setProfileImage(data.profileImage);
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // Extract Initials for Placeholder Profile
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    const firstInitial = names[0]?.charAt(0).toUpperCase() || "U";
    const lastInitial = names[1]?.charAt(0).toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  // Sign-In
  const handleSignIn = () => {
    const updatedDays = days.map((day) => {
      const today = new Date();
      const todayDay = today.toLocaleDateString("en-US", { weekday: "short" });
      if (day.day === todayDay) {
        return {
          ...day,
          timeIn: new Date().toLocaleTimeString(),
          date: today.toLocaleDateString("en-US"),
        };
      }
      return day;
    });
    setDays(updatedDays);
  };

  // Sign-Out
  const handleSignOut = () => {
    const updatedDays = days.map((day) => {
      const today = new Date();
      const todayDay = today.toLocaleDateString("en-US", { weekday: "short" });
      if (day.day === todayDay) {
        return {
          ...day,
          timeOut: new Date().toLocaleTimeString(),
          date: today.toLocaleDateString("en-US"),
        };
      }
      return day;
    });
    setDays(updatedDays);
  };

  // Handle Activity Click to Open Modal
  const handleActivityClick = (index) => {
    setSelectedDayIndex(index);
    setEditedActivity(days[index].activity);
    setIsModalVisible(true);
  };

  // Save Edited Activity
  const handleSaveActivity = () => {
    if (selectedDayIndex !== null) {
      const updatedDays = [...days];
      updatedDays[selectedDayIndex].activity = editedActivity;
      setDays(updatedDays);
      setIsModalVisible(false);
    }
  };

  // Cancel Activity Edit
  const handleCancelEdit = () => {
    setIsModalVisible(false);
    setEditedActivity(""); // Reset edited activity
  };

  return (
    <View style={styles.container}>
      {/* Profile and Notification Icons with See More Link */}
      <View style={styles.row}>
        <View style={styles.profileContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                {getInitials(user?.displayName || "User")}
              </Text>
            </View>
          )}
        </View>
        <Link href="/notification" style={styles.icon}>
          <Image source={icons.notificationActive} style={styles.image} />
        </Link>
      </View>

      {/* Week View, See More Button on Right Side */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.weekButton}>
          <Text style={styles.weekButtonText}>
            Week {getCurrentWeek("2024-09-01", 12)} {/* Example registration date */}
          </Text>
        </TouchableOpacity>
        <Link href="/seeMore" style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See More</Text>
        </Link>
      </View>

      {/* Attendance Table */}
      <ScrollView style={styles.tableContainer}>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Day</Text>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCell}>Time In</Text>
            <Text style={styles.tableCell}>Activity</Text>
            <Text style={styles.tableCell}>Time Out</Text>
          </View>

          {days.map((day, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.lightGrayBg : styles.whiteBg,
              ]}
            >
              <Text style={styles.tableCell}>{day.day}</Text>
              <Text style={styles.tableCell}>{day.date || "--/--/----"}</Text>
              <Text style={styles.tableCell}>{day.timeIn || "--:--"}</Text>
              <TouchableOpacity
                style={styles.tableCell}
                onPress={() => handleActivityClick(index)}
              >
                <Text style={styles.activityText}>
                  {day.activity || "Enter Activity"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.tableCell}>{day.timeOut || "--:--"}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sign In and Out Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Editing Activity */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Activity</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={editedActivity}
              onChangeText={setEditedActivity}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveActivity}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profileContainer: { flexDirection: "row", alignItems: "center" },
  profileImage: { width: 50, height: 50, borderRadius: 25 },
  placeholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 20, color: "#fff" },
  icon: { padding: 10 },
  image: { width: 30, height: 30 },
  weekButton: { padding: 10, backgroundColor: "#F3F3F3", borderRadius: 5 },
  weekButtonText: { fontSize: 16 },
  seeMoreButton: { padding: 10 },
  seeMoreText: { fontSize: 16, color: "#007BFF" },
  tableContainer: { marginTop: 20 },
  table: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10 },
  tableRow: { flexDirection: "row", padding: 10 },
  tableHeader: { backgroundColor: "#f4f4f4" },
  tableCell: { flex: 1, textAlign: "center" },
  activityText: { color: "#007BFF" },
  lightGrayBg: { backgroundColor: "#f9f9f9" },
  whiteBg: { backgroundColor: "#fff" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  signInButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5 },
  signInButtonText: { color: "#fff" },
  signOutButton: { backgroundColor: "#F44336", padding: 10, borderRadius: 5 },
  signOutButtonText: { color: "#fff" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: { width: "80%", padding: 20, backgroundColor: "#fff", borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  textarea: { height: 100, borderColor: "#ddd", borderWidth: 1, borderRadius: 5, padding: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelButton: { color: "#F44336", fontSize: 16 },
  saveButton: { color: "#4CAF50", fontSize: 16 },
});

export default Home;
