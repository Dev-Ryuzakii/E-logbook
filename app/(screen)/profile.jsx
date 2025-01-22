import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { icons } from '../../constants';
import { useRouter } from "expo-router";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    regNo: '',
    schoolName: '',
    department: '',
    password: '',
    supervisor: '',
    profileImage: 'https://via.placeholder.com/150'
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const router = useRouter();

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to update your profile picture.');
      }
    })();
  }, []);

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data.name || '',
            email: data.email || '',
            regNo: data.regNo || '',
            schoolName: data.schoolName || '',
            department: data.department || '',
            password: data.password || '',
            supervisor: data.supervisor || 'Mr John',
            profileImage: data.profileImage || 'https://via.placeholder.com/150'
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // [Previous imports remain the same...]

const handleImagePick = async () => {
  if (!user) {
    Alert.alert('Error', 'Please log in to update your profile image');
    return;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7, // Reduced quality for better upload performance
      base64: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profile-image.jpg'
      });

      try {
        // First convert the image to a blob
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        // Create a unique filename using timestamp
        const filename = `profile_${user.uid}_${Date.now()}.jpg`;
        const imageRef = ref(storage, `profile_images/${filename}`);

        // Upload the blob
        await uploadBytes(imageRef, blob);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(imageRef);

        // Update Firestore with new image URL
        await updateDoc(doc(db, 'users', user.uid), {
          profileImage: downloadURL
        });

        // Update local state
        setUserData(prev => ({
          ...prev,
          profileImage: downloadURL
        }));

        Alert.alert('Success', 'Profile picture updated successfully');
      } catch (uploadError) {
        console.error('Specific upload error:', uploadError);
        
        // More specific error messages based on the error type
        if (uploadError.code === 'storage/unauthorized') {
          Alert.alert('Error', 'Not authorized to upload images. Please check your permissions.');
        } else if (uploadError.code === 'storage/canceled') {
          Alert.alert('Error', 'Upload was cancelled');
        } else if (uploadError.code === 'storage/quota-exceeded') {
          Alert.alert('Error', 'Storage quota exceeded');
        } else {
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        }
      }
    }
  } catch (error) {
    console.error('Image picker error:', error);
    Alert.alert('Error', 'Failed to select image. Please try again.');
  } finally {
    setImageLoading(false);
  }
};

  const handleProfileUpdate = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to update your profile');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        email: userData.email
      });

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const copyRegNo = async () => {
    try {
      await Clipboard.setStringAsync(userData.regNo);
      Alert.alert('Success', 'Registration number copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy registration number');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Please log in to view your profile</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/login')}
          className="mt-4 bg-blue-500 px-6 py-2 rounded-full"
        >
          <Text className="text-white font-medium">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4  border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="pr-4">
          <Image source={icons.back} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Profile</Text>
      </View>

      <View className="px-4 py-24">
        {/* Profile Image Section */}
        <View className="items-center mb-8">
          {imageLoading ? (
            <View className="w-24 h-24 rounded-full bg-gray-200 justify-center items-center">
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          ) : (
            <View className="relative">
              <Image
                source={{ uri: userData.profileImage }}
                className="w-48 h-48 rounded-full"
              />
              <TouchableOpacity 
                onPress={handleImagePick}
                className="absolute bottom-0 right-0 bg-[#60B2FF] p-2 rounded-full"
                disabled={imageLoading}
              >
                <Image source={icons.camera} className="w-5 h-5 tint-white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Details */}
        <View className="space-y-6">
          {/* Name Section */}
          <View className="border-b border-gray-200 pb-4">
            <Text className="text-gray-500 mb-1">Name</Text>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold">{userData.name}</Text>
                <Text className="text-gray-500">{userData.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Image source={icons.pen} className="w-5 h-5" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Supervisor Section */}
          <View className="border-b border-gray-200 pb-4">
            <Text className="text-gray-500 mb-1">Supervisor</Text>
            <Text className="text-lg font-semibold">{userData.supervisor}</Text>
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-gray-500">Reg: {userData.regNo}</Text>
              <TouchableOpacity onPress={copyRegNo}>
                <Image source={icons.copy} className="w-5 h-5" />
              </TouchableOpacity>
            </View>
          </View>

          {/* School Section */}
          <View className="border-b border-gray-200 pb-4">
            <Text className="text-gray-500 mb-1">{userData.schoolName}</Text>
            <Text className="text-lg font-semibold">{userData.email}</Text>
            <Text className="text-gray-500 mt-1">{userData.department}</Text>
          </View>

          {/* Password Section */}
          <View className="border-b border-gray-200 pb-4">
            <Text className="text-gray-500 mb-1">Password</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold">
                {'•'.repeat(8)}
              </Text>
              <View className="flex-row space-x-4">
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Image source={isPasswordVisible ? icons.eye : icons.eyeHide} className="w-5 h-5" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image source={icons.pen} className="w-5 h-5" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Edit Profile Modal */}
      {isEditing && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white p-6 rounded-lg w-5/6">
            <Text className="text-xl font-semibold mb-4">Edit Profile</Text>
            <TextInput
              value={userData.name}
              onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
              className="border border-gray-200 p-2 rounded-lg mb-4"
              placeholder="Name"
            />
            <TextInput
              value={userData.email}
              onChangeText={(text) => setUserData(prev => ({ ...prev, email: text }))}
              className="border border-gray-200 p-2 rounded-lg mb-4"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity 
                onPress={() => setIsEditing(false)}
                className="px-4 py-2"
              >
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleProfileUpdate}
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default Profile;