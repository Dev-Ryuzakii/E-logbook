import React, { useRef, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import Swiper from "react-native-swiper";

export default function Onboarding() {
  const swiperRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 3;

  // Auto-slide timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex < totalSlides - 1) {
        swiperRef.current?.scrollBy(1);
      } else {
        // Reset to first slide when reaching the end
        swiperRef.current?.scrollTo(0);
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer); // Cleanup timer
  }, [currentIndex]);

  // Handle index change
  const handleIndexChanged = (index) => {
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 bg-[#60B2FF]">
      <Swiper 
        ref={swiperRef}
        loop={false}
        showsPagination={false}
        onIndexChanged={handleIndexChanged}
      >
        {/* Slide 1 */}
        <View className="flex-1">
          <View className="flex-2 justify-center items-center mt-28">
            <Image
              source={require("../../assets/images/slide1.png")}
              className="w-[306px] h-[324px]"
              resizeMode="contain"
            />
          </View>

          <View className="absolute bottom-0 w-full bg-black pt-4 pb-8 px-5 rounded-t-[30px]">
            <View className="flex-row justify-center mb-4">
              <View className="w-[20px] h-[8px] bg-primary mx-1 rounded-full" />
              <View className="w-[20px] h-[8px] bg-gray-400 mx-1 rounded-full" />
              <View className="w-[20px] h-[8px] bg-gray-400 mx-1 rounded-full" />
            </View>

            <Text className="text-center text-white text-2xl font-pbold mb-2">
              Hello Student
            </Text>
            <Text className="text-center text-white text-sm font-pregular">
              Welcome to E-Log Book
            </Text>

            <View className="mt-5">
              <Link href="/sign-in" className="bg-[#60B2FF] rounded-full py-3 mb-3">
                <Text className="text-center text-white text-lg font-semibold">
                  Continue
                </Text>
              </Link>
              <Link href="/sign-in" className="bg-gray-600 rounded-full py-3">
                <Text className="text-center text-white text-lg font-semibold">
                  Skip
                </Text>
              </Link>
            </View>
          </View>
        </View>

        {/* Slide 2 */}
        <View className="flex-1">
          <View className="flex-2 justify-center items-center mt-28">
            <Image
              source={require("../../assets/images/slide2.png")}
              className="w-[306px] h-[324px]"
              resizeMode="contain"
            />
          </View>
          <View className="absolute bottom-0 w-full bg-black pt-4 pb-8 px-5 rounded-t-[30px]">
            <View className="flex-row justify-center mb-4">
              <View className="w-[20px] h-[8px] bg-gray-400 mx-1 rounded-full" />
              <View className="w-[20px] h-[8px] bg-primary mx-1 rounded-full" />
              <View className="w-[20px] h-[8px] bg-gray-400 mx-1 rounded-full" />
            </View>

            <Text className="text-center text-white text-2xl font-pbold mb-2">
              Doing Siwes?
            </Text>
            <Text className="text-center text-white text-sm font-pregular">
              Do your Siwes Remotely
            </Text>
            <View className="mt-5">
              <Link href="/sign-in" className="bg-[#60B2FF] rounded-full py-3 mb-3">
                <Text className="text-center text-white text-lg font-semibold">
                  Continue
                </Text>
              </Link>
              <Link href="/sign-in" className="bg-gray-600 rounded-full py-3">
                <Text className="text-center text-white text-lg font-semibold">
                  Skip
                </Text>
              </Link>
            </View>
          </View>
        </View>

        {/* Slide 3 */}
        <View className="flex-1">
          <View className="flex-2 justify-center items-center mt-28">
            <Image
              source={require("../../assets/images/slide3.png")}
              className="w-[306px] h-[324px]"
              resizeMode="contain"
            />
          </View>
          <View className="absolute bottom-0 w-full bg-black pt-4 pb-8 px-5 rounded-t-[30px]">
            <View className="flex-row justify-center mb-4">
              <View className="w-[20px] h-[8px] bg-gray-400 mx-1 rounded-full" />
              <View className="w-[20px] h-[8px] bg-gray-400 mx-1 rounded-full" />
              <View className="w-[20px] h-[8px] bg-primary mx-1 rounded-full" />
            </View>

            <Text className="text-center text-white text-2xl font-pbold mb-2">
              Get Started
            </Text>
            <Text className="text-center text-white text-sm font-pregular">
              Create account
            </Text>
            <View className="mt-5">
              <Link href="/sign-in" className="bg-[#60B2FF] rounded-full py-3 mb-3">
                <Text className="text-center text-white text-lg font-semibold">
                  Continue
                </Text>
              </Link>
              <Link href="/sign-in" className="bg-gray-600 rounded-full py-3">
                <Text className="text-center text-white text-lg font-semibold">
                  Skip
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </Swiper>
    </View>
  );
}