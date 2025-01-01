import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import * as ImagePicker from "expo-image-picker";

import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { icons } from "../../constants"; // Import your icons

const Capture = () => {
  const router = useRouter(); // Navigation
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    gender: "",
    yearsOfStudy: "",
    photoURL: null,
  });

  // Function to handle image selection from the gallery
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access the media library is required."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm({ ...form, photoURL: result.assets[0].uri });
    }
  };

  // Function to handle photo capture using the camera
  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Permission to access the camera is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm({ ...form, photoURL: result.assets[0].uri });
    }
  };

  // Function to display options for picking or capturing image
  const handleImageInput = () => {
    Alert.alert(
      "Select Option",
      "Choose a method to set your profile photo:",
      [
        { text: "Camera", onPress: handleCameraCapture },
        { text: "Gallery", onPress: handleImagePicker },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // New Function: Reset Profile Data
  const resetForm = () => {
    setForm({
      gender: "",
      yearsOfStudy: "",
      photoURL: null,
    });
    Alert.alert("Form Reset", "Profile form has been reset.");
  };

  // Function to submit profile data
  const submit = async () => {
    if (!form.gender || !form.photoURL) {
      Alert.alert("Validation Error", "Please fill in all fields and upload a photo.");
      return;
    }

    setSubmitting(true);
    try {
      if (auth.currentUser) {
        // Update Firebase User Profile
        await updateProfile(auth.currentUser, {
          photoURL: form.photoURL, // Save photo URL
        });

        Alert.alert("Success", "Profile completed!");
        console.log("Profile updated:", auth.currentUser);

        // Navigate to home or dashboard page
        router.replace("/home");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
      console.error("Profile Update Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to set gender in the form
  const setGender = (selectedGender) => {
    setForm((prevForm) => ({ ...prevForm, gender: selectedGender }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4">
        <Text className="text-3xl font-semibold text-black mt-20 text-center">
          Complete Your Profile
        </Text>

        {/* Image Upload Section */}
        <View className="mt-10 items-center">
          <View style={{ position: "relative", width: 120, height: 120 }}>
            {/* Profile Image */}
            {form.photoURL ? (
              <Image
                source={{ uri: form.photoURL }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: "#007BFF",
                }}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 60,
                  backgroundColor: "#EAEAEA",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-gray-400">No Image</Text>
              </View>
            )}
            {/* Camera Icon */}
            <TouchableOpacity
              onPress={handleImageInput}
              style={{
                position: "absolute",
                bottom: -5,
                right: -5,
                width: 40,
                height: 40,
                backgroundColor: "#007BFF",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#FFFFFF",
              }}
            >
              <Image
                source={icons.camera}
                style={{ width: 20, height: 20, tintColor: "white" }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gender and Years of Study Fields */}
        <FormField
          title="Gender"
          value={form.gender}
          setGender={setGender} // Pass the setGender function here
          handleChangeText={(e) => setForm({ ...form, gender: e })}
          otherStyles="mt-7"
          placeholder="Select your gender"
        />

        <CustomButton
          title="Complete Profile"
          handlePress={submit}
          isLoading={isSubmitting}
          containerStyles="mt-8 w-full h-14"
        />

        
      </ScrollView>
    </SafeAreaView>
  );
};

export default Capture;
