import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { icons } from '../../constants';

const Setting = () => {
  const router = useRouter();

  // Mock user data (for now, assume this user is logged in)
  const user = {
    profileImage: 'https://via.placeholder.com/150', // Placeholder image
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  // Logout function
  const handleLogout = () => {
    // Clear user session logic (e.g., AsyncStorage or Redux state)
    // Here, you might clear the user's token or session details
    // For now, just redirect the user to the home page
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row items-center mt-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={icons.back}
            resizeMode="contain"
            className="w-5 h-5"
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4">Settings</Text>
      </View>

      {/* Profile Section */}
      <TouchableOpacity className="flex-row items-center mt-8">
        <Image
          source={{ uri: user.profileImage }}
          resizeMode="cover"
          className="w-16 h-16 rounded-full"
        />
        <View className="ml-4">
          <Text className="text-lg font-semibold">{user.name}</Text>
          <Text className="text-sm text-gray-500">{user.email}</Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View className="border-b border-gray-200 my-6" />

      {/* Navigation Options */}
      <TouchableOpacity
        onPress={() => router.push('/account')}
        className="py-4 border-b border-gray-200"
      >
        <Text className="text-base font-medium">Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/logbook')}
        className="py-4 border-b border-gray-200"
      >
        <Text className="text-base font-medium">Logbook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/language')}
        className="py-4 border-b border-gray-200"
      >
        <Text className="text-base font-medium">Language</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/terms-and-conditions')}
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
