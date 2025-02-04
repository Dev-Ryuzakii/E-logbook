import React, { useEffect } from "react";
import { Image, View, Text } from "react-native";
import { useRouter } from "expo-router";
import "../global.css";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-primary">
      {/* Centered Content */}
      <View className="flex-1 justify-center items-center">
        {/* App Title */}
        <Image
          source={require("../assets/images/logo.png")} // Update to use 'require'
          style={{ width: 150, height: 150 }} // Add explicit width and height
          className="mb-4"
        />
        <Text className="text-3xl font-pextrabold text-white mb-4">E-Log Book</Text>

        {/* Logo */}
      </View>
    </View>
  );
}
