import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { firebaseConfig } from '../../firebaseConfig'; // Ensure this file exists
import { icons } from '../../constants'; // Ensure icons are correctly defined

// Initialize Firebase App if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const auth = getAuth();

const Home = () => {
  const [user, setUser] = useState(null);
  const [hasNotification, setHasNotification] = useState(true);
  const [days, setDays] = useState([
    { day: 'Mon', timeIn: '', timeOut: '', activity: '', date: '' },
    { day: 'Tue', timeIn: '', timeOut: '', activity: '', date: '' },
    { day: 'Wed', timeIn: '', timeOut: '', activity: '', date: '' },
    { day: 'Thurs', timeIn: '', timeOut: '', activity: '', date: '' },
    { day: 'Fri', timeIn: '', timeOut: '', activity: '', date: '' },
  ]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  // Get today's day and date
  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'short' });
  const todayDate = today.toLocaleDateString('en-US');

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Cleanup listener on unmount
  }, []);

  // Guest Sign-In
  const handleGuestSignIn = async () => {
    try {
      await signInAnonymously(auth);
      Alert.alert('Signed in as Guest');
    } catch (error) {
      Alert.alert('Error signing in', error.message);
    }
  };

  const handleActivityChange = (index, text) => {
    const newDays = [...days];
    newDays[index].activity = text;
    setDays(newDays);
  };

  const handleSignIn = () => {
    const updatedDays = days.map((day) => {
      if (day.day === todayDay) {
        return {
          ...day,
          timeIn: new Date().toLocaleTimeString(),
          date: todayDate,
        };
      }
      return day;
    });
    setDays(updatedDays);
  };

  const handleSignOut = () => {
    const updatedDays = days.map((day) => {
      if (day.day === todayDay) {
        return {
          ...day,
          timeOut: new Date().toLocaleTimeString(),
          date: todayDate,
        };
      }
      return day;
    });
    setDays(updatedDays);
  };

  const openActivityModal = (index) => {
    if (days[index].timeOut) {
      Alert.alert('This day has already passed and cannot be edited.');
    } else {
      setSelectedDayIndex(index);
      setIsModalVisible(true);
    }
  };

  const saveActivity = () => {
    if (selectedDayIndex !== null) {
      const newDays = [...days];
      newDays[selectedDayIndex].activity = newDays[selectedDayIndex].activity || '';
      setDays(newDays);
      setIsModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Show Guest Sign-In Button if User is Not Signed In */}
      {!user && (
        <TouchableOpacity onPress={handleGuestSignIn} style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign In as Guest</Text>
        </TouchableOpacity>
      )}

      {/* Main UI for Authenticated Users */}
      {user && (
        <>
          {/* Profile and Notification Section */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <TouchableOpacity onPress={() => setHasNotification(!hasNotification)}>
              <Image
                source={
                  hasNotification
                    ? icons.notificationActive
                    : icons.notificationInactive
                }
                style={styles.notificationIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Week Title */}
          <View style={styles.weekTitle}>
            <Text style={styles.weekText}>Week {currentWeek}</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreText}>See more</Text>
            </TouchableOpacity>
          </View>

          {/* Attendance Table */}
          <ScrollView>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Day</Text>
              <Text style={styles.tableHeaderText}>Time In</Text>
              <Text style={styles.tableHeaderText}>Activity</Text>
              <Text style={styles.tableHeaderText}>Time Out</Text>
            </View>

            {days.map((day, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.dayText}>{day.day}</Text>
                <Text style={styles.timeText}>{day.timeIn || '--:--'}</Text>
                <TouchableOpacity
                  onPress={() => openActivityModal(index)}
                  disabled={day.timeOut !== ''}
                  style={styles.activityButton}
                >
                  <Text style={styles.activityText}>{day.activity || 'Enter Activity'}</Text>
                </TouchableOpacity>
                <Text style={styles.timeText}>{day.timeOut || '--:--'}</Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Modal for Activity */}
      {isModalVisible && (
        <Modal
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter activity"
                value={days[selectedDayIndex]?.activity || ''}
                onChangeText={(text) => handleActivityChange(selectedDayIndex, text)}
              />
              <TouchableOpacity onPress={saveActivity} style={styles.modalSaveButton}>
                <Text style={styles.modalSaveButtonText}>Save Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  signInButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginTop: 16 },
  signInButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  profileSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  profileImage: { width: 48, height: 48, borderRadius: 24 },
  notificationIcon: { width: 24, height: 24 },
  weekTitle: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  weekText: { fontSize: 20, fontWeight: 'bold' },
  seeMoreText: { color: '#007bff', fontSize: 14 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 8 },
  tableHeaderText: { flex: 1, textAlign: 'center', fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dayText: { flex: 1, textAlign: 'center' },
  timeText: { flex: 1, textAlign: 'center' },
  activityButton: { flex: 2, padding: 8, borderWidth: 1, borderRadius: 4, borderColor: '#ccc' },
  activityText: { textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', backgroundColor: 'white', padding: 16, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginBottom: 16 },
  modalSaveButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8 },
  modalSaveButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});

export default Home;
