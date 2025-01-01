import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { icons } from "../../constants";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Setting = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user document from Firestore
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ ...userDoc.data(), email: currentUser.email });
          } else {
            console.error("No user document found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const copyToClipboard = async () => {
    if (user?.regNo) {
      await Clipboard.setStringAsync(user.regNo);
      Alert.alert("Copied", "Registration number copied to clipboard!");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/");
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row items-center mt-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={icons.back} resizeMode="contain" className="w-5 h-5" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4">Settings</Text>
      </View>

      {/* Profile Section */}
      <TouchableOpacity
        className="flex-row items-center mt-8"
        onPress={() => router.push("/profile")} // Navigate to "Chat" page
      >
        <Image
          source={{
            uri: user.profileImage || "https://via.placeholder.com/150", // Fallback image
          }}
          resizeMode="cover"
          className="w-16 h-16 rounded-full"
        />
        <View className="ml-4">
          <Text className="text-lg font-semibold">{user.name || "N/A"}</Text>
          <Text className="text-sm text-gray-500">{user.email}</Text>
        </View>
      </TouchableOpacity>

      {/* Registration Number */}
      <View className="mt-6">
        <Text className="text-base font-medium text-gray-700">Registration Number:</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-lg font-semibold mr-4">{user.regNo || "N/A"}</Text>
          <TouchableOpacity onPress={copyToClipboard}>
            <Image source={icons.copy} className="w-5 h-5" resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View className="border-b border-gray-200 my-6" />

      {/* Navigation Options */}
      <TouchableOpacity
        onPress={() => router.push("/account")}
        className="py-4 border-b border-gray-200"
      >
        <Text className="text-base font-medium">Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/logbook")}
        className="py-4 border-b border-gray-200"
      >
        <Text className="text-base font-medium">Logbook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/language")}
        className="py-4 border-b border-gray-200"
      >
        <Text className="text-base font-medium">Language</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/terms-and-conditions")}
        className="py-4 border-b border-gray-200"
      >
        <Text className="text-base font-medium">Terms and Conditions</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <View className="mt-8">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-primary my-28 py-3 px-4 rounded-full items-center"
        >
          <Text className="text-white text-base font-medium">Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Setting;
