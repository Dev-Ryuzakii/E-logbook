import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../firebaseConfig";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";


const SignIn = () => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const submit = async () => {
    setSubmitting(true);
    try {
      // Firebase Authentication
      await signInWithEmailAndPassword(auth, form.email, form.password);
      setSubmitting(false);
      router.push("/home");
    } catch (error) {
      setSubmitting(false);
      Alert.alert(
        "Error",
        error.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="w-full px-6 my-6">
          {/* Title */}
          <Text className="text-3xl font-semibold text-black mt-10 text-center">
            Welcome Back
          </Text>

          {/* Form Fields */}
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-8"
            keyboardType="email-address"
            placeholder="Enter your email"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-6"
            placeholder="Enter your password"
            
          />

          {/* Remember Me and Forgot Password */}
          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() =>
                  setForm({ ...form, rememberMe: !form.rememberMe })
                }
                className="w-5 h-5 border-2 border-gray-400 rounded-full justify-center items-center"
              >
                {form.rememberMe && <View className="w-3 h-3 bg-blue-500 rounded-full" />}
              </TouchableOpacity>
              <Text className="ml-2 text-base text-gray-600">Remember me</Text>
            </View>
            <Link href="/recover" className="text-blue-500 text-base">
              Forgot your password?
            </Link>
          </View>

          {/* Custom Button */}
          <CustomButton
            title="Log In"
            handlePress={submit}
            containerStyles="mt-8 w-[100%] h-[40px] rounded-xl"
            isLoading={isSubmitting}
          />

          {/* Sign-Up Link */}
          <View className="mt-5 text-center px-24">
            <Text className="text-base text-gray-500">
              Don't have an account?{" "}
              <Link href="/sign-up">
                <Text className="text-blue-500 font-semibold">Sign Up</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
