import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const EnterOTP = () => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const submit = async () => {
    if (!otp || otp.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter a valid 4-digit verification code');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get stored email from SecureStore
      const email = await SecureStore.getItemAsync('resetEmail');
      if (!email) {
        Alert.alert('Error', 'Please restart the password recovery process');
        router.replace('/recover');
        return;
      }

      // Here you would verify the OTP with your backend/Firebase
      // For now, we'll simulate verification
      // await verifyOTP(email, otp);
      
      // Store the OTP for the next screen
      await SecureStore.setItemAsync('resetOTP', otp);
      
      // Navigate to new password screen
      router.push('/newpassword');
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const email = await SecureStore.getItemAsync('resetEmail');
      if (!email) {
        router.replace('/recover');
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setTimer(60);
      setCanResend(false);
      Alert.alert('Success', 'A new verification code has been sent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="w-full px-6 my-6">
          <Text className="text-3xl font-semibold text-black mt-10 text-center">
            Enter Verification Code
          </Text>
          
          <Text className="text-gray-500 text-center mt-4">
            We have sent a verification code to your email
          </Text>

          <FormField
            title="Enter Code"
            isOTP={true}
            handleChangeText={setOtp}
            otherStyles="mt-8"
          />

          <CustomButton
            title="Verify"
            handlePress={submit}
            containerStyles="mt-8 w-[100%] h-[40px] rounded-xl"
            isLoading={isSubmitting}
          />

          <View className="mt-4 items-center">
            <Text className="text-gray-500">
              {canResend ? "Didn't receive the code?" : `Resend code in ${timer}s`}
            </Text>
            {canResend && (
              <TouchableOpacity onPress={handleResendCode}>
                <Text className="text-blue-500 mt-2 font-semibold">
                  Resend Code
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EnterOTP;