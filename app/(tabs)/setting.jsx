import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { icons } from "../../constants";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Setting = () => {
  const [user, setUser] = useState({
    name: "N/A",
    email: "",
    regNo: "",
    profileImage: null
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 pb-10 border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={icons.back} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-2">Settings</Text>
      </View>

      {/* Profile Section */}
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        className="flex-row items-center p-4 border-b border-gray-200"
      >
        <View className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
          <Image
            source={user.profileImage ? { uri: user.profileImage } : icons.defaultProfile}
            className="w-full h-full"
            defaultSource={icons.defaultProfile}
          />
        </View>
        <View className="ml-4">
          <Text className="text-lg font-semibold">{user.name}</Text>
          <Text className="text-gray-600">{user.email}</Text>
        </View>
      </TouchableOpacity>

      {/* Registration Number */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-gray-600">Registration Number:</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-lg">{user.regNo || "N/A"}</Text>
          <TouchableOpacity onPress={copyToClipboard} className="ml-2">
            <Image source={icons.copy} className="w-5 h-5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Options */}
      <TouchableOpacity
        onPress={() => router.push("/account")}
        className="py-4 px-4 border-b border-gray-200"
      >
        <Text className="text-lg">Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/elogbook")}
        className="py-4 px-4 border-b border-gray-200"
      >
        <Text className="text-lg">Logbook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/language")}
        className="py-4 px-4 border-b border-gray-200"
      >
        <Text className="text-lg">Language</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/terms-and-conditions")}
        className="py-4 px-4 border-b border-gray-200"
      >
        <Text className="text-lg">Terms and Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/appearance")}
        className="py-4 px-4 border-b border-gray-200"
      >
        <Text className="text-lg">Appearance</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="mx-4 mt-8 p-4 bg-red-500 rounded-lg"
      >
        <Text className="text-white text-center text-lg font-semibold">
          Log Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Setting;