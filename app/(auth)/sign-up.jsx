import { View, Text, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const SignUp = () => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    institution: "",
    course: "",
    password: "",
  });

  const submit = async () => {
    // Basic Validation
    if (!form.name || !form.email || !form.institution || !form.course || !form.password) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);

      // Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      if (!user) {
        Alert.alert("Error", "Failed to create user account. Please try again.");
        return;
      }

      Alert.alert("Success", "User created successfully! Proceed to capture.");

      // Redirect to Capture Page
      router.push({
        pathname: "/capture",
        params: {
          uid: user.uid,
          name: form.name,
          email: form.email,
          institution: form.institution,
          course: form.course,
        },
      });
    } catch (error) {
      Alert.alert("Sign-Up Error", error.message || "An unexpected error occurred.");
      console.error("Sign-Up Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="w-full px-6 my-6">
          {/* Title */}
          <Text className="text-3xl font-semibold text-black mt-10 text-center">
            Create your account
          </Text>

          {/* Form Fields */}
          <FormField
            title="Full Name"
            value={form.name}
            handleChangeText={(e) => setForm({ ...form, name: e })}
            otherStyles="mt-8"
            keyboardType="default"
            placeholder="Enter your full name"
          />

          <FormField
            title="Email Address"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-8"
            keyboardType="email-address"
            placeholder="example20@gmail.com"
          />

          <FormField
            title="Institution Name"
            value={form.institution}
            handleChangeText={(e) => setForm({ ...form, institution: e })}
            otherStyles="mt-8"
            keyboardType="default"
            placeholder="Enter your institution name"
          />

          <FormField
            title="Course of Study"
            value={form.course}
            handleChangeText={(e) => setForm({ ...form, course: e })}
            otherStyles="mt-8"
            keyboardType="default"
            placeholder="Enter your course"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-6"
            placeholder="Enter your password"
            containerStyles="w-[100%] h-[40px]"
            secureTextEntry={true}
          />

          {/* Submit Button */}
          <View className="mt-5">
            <CustomButton
              title="Continue"
              handlePress={submit}
              isLoading={isSubmitting}
              containerStyles="w-[100%] h-[40px] rounded-xl"
            />
          </View>

          {/* Log In Link */}
          <View className="mt-5 text-center px-24">
            <Text className="text-base text-gray-500">
              Have an account?{' '}
              <Text
                onPress={() => router.push('/sign-in')}
                className="text-blue-500 font-semibold"
              >
                Log In
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
