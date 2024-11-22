import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { icons } from '../constants'; // Importing custom icons

const Profile = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="flex-1 bg-white px-6 pt-6">
      {/* Back Button and Profile Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity>
          <Image source={icons.arrow} className="w-6 h-6" /> {/* Updated arrow icon */}
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-4 text-gray-800">Profile</Text>
      </View>

      {/* Profile Image */}
      <View className="items-center mb-6">
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }} // Replace with user's image URL
          className="w-28 h-28 rounded-full"
        />
        <TouchableOpacity className="absolute bottom-0 right-12 bg-white p-2 rounded-full border border-gray-300 shadow-md">
          <Image source={icons.camera} className="w-5 h-5" />
        </TouchableOpacity>
      </View>

      {/* Profile Fields */}
      <View className="space-y-6">
        {/* Name */}
        <View className="border-b border-gray-300 pb-2">
          <Text className="text-sm text-gray-500 mb-1">Name</Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-medium text-gray-800">Dorcas Esther</Text>
              <Text className="text-sm text-gray-500">dorcasesther@gmail.com</Text>
            </View>
            <TouchableOpacity>
              <Image source={icons.pen} className="w-5 h-5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Supervisor */}
        <View className="border-b border-gray-300 pb-2">
          <Text className="text-sm text-gray-500 mb-1">Supervisor</Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-medium text-gray-800">Mr John</Text>
              <Text className="text-sm text-gray-500">Reg: 215AB7E09</Text>
            </View>
            <TouchableOpacity>
              <Image source={icons.copy} className="w-5 h-5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* School */}
        <View className="border-b border-gray-300 pb-2">
          <Text className="text-sm text-gray-500 mb-1">Tai-Solarin University</Text>
          <View>
            <Text className="text-base font-medium text-gray-800">dorcasesther@gmail.com</Text>
            <Text className="text-sm text-gray-500">Computer Science Department</Text>
          </View>
        </View>

        {/* Password */}
        <View className="border-b border-gray-300 pb-2">
          <Text className="text-sm text-gray-500 mb-1">Password</Text>
          <View className="flex-row justify-between items-center">
            <TextInput
              value="12345678"
              editable={false}
              secureTextEntry={!isPasswordVisible}
              className="text-base font-medium text-gray-800"
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Image
                source={isPasswordVisible ? icons.eye : icons.eyeHide}
                className="w-5 h-5"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;
