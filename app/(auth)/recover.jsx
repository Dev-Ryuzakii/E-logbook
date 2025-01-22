import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Make sure this path matches your Firebase config file

import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const Recover = () => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
  });

  const submit = async () => {
    try {
      setSubmitting(true);
      
      // Basic email validation
      if (!form.email || !form.email.includes('@')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, form.email);
      
      // Show success message
      Alert.alert(
        'Success',
        'Password reset email sent. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/enterotp') // Navigate to OTP screen
          }
        ]
      );
    } catch (error) {
      // Handle specific Firebase errors
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account exists with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="w-full px-6 my-6">
          <Text className="text-3xl font-semibold text-black mt-10 text-center">
            Recover account
          </Text>
          
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-8"
            keyboardType="email-address"
            placeholder="Enter your email"
          />

          <CustomButton
            title="Send Code"
            handlePress={submit}
            containerStyles="mt-8 w-[100%] h-[40px] rounded-xl"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Recover;