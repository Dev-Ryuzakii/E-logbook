import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Platform, Alert } from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { icons } from "../constants";
import { Picker } from "@react-native-picker/picker";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  keyboardType = "default",
  setImage,
  setGender,
  isOTP = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const otpInputs = useRef([]);

  // Handle OTP input change
  const handleOtpChange = (text, index) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = text;
    setOtpValues(newOtpValues);

    // Combine OTP values and call the parent's handleChangeText
    const combinedOtp = newOtpValues.join('');
    handleChangeText(combinedOtp);

    // Auto-focus next input
    if (text.length === 1 && index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  // Existing image handling functions...
  const handleImagePick = () => {
    const options = {
      mediaType: "photo",
      quality: 1,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("Image selection cancelled.");
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setImageUri(uri);
        setImage(uri);
      } else {
        console.log("Error in image selection.");
      }
    });
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: "photo",
      quality: 1,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("Camera use cancelled.");
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setImageUri(uri);
        setImage(uri);
      } else {
        console.log("Error in taking photo.");
      }
    });
  };

  const handleImageInput = () => {
    Alert.alert(
      "Select Option",
      "Choose a method to set your profile photo:",
      [
        { text: "Camera", onPress: handleTakePhoto },
        { text: "Gallery", onPress: handleImagePick },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const isPasswordField = title?.toLowerCase() === "password";

  if (isOTP) {
    return (
      <View className={`space-y-2 ${otherStyles}`}>
        {title && (
          <Text
            className="text-black font-bold text-base mb-2"
            style={{ fontWeight: "600", fontSize: 16, color: "#333" }}
          >
            {title}
          </Text>
        )}
        <View className="flex-row justify-between w-full">
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpInputs.current[index] = ref)}
              className="w-16 h-16 text-center text-black text-xl font-semibold"
              style={{
                borderWidth: 1,
                borderColor: "#B0ADAD",
                borderRadius: 12,
                backgroundColor: "white",
              }}
              maxLength={1}
              keyboardType="number-pad"
              value={otpValues[index]}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleOtpKeyPress(e, index)}
              selectTextOnFocus
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      {/* Rest of the existing component code... */}
      {title && (
        <Text
          className="text-black font-bold text-base mb-2"
          style={{ fontWeight: "600", fontSize: 16, color: "#333" }}
        >
          {title}
        </Text>
      )}

      {title === "Gender" && (
        <View
          className="w-full h-14 px-4 bg-white flex flex-row items-center"
          style={{
            borderWidth: 1,
            borderColor: "#B0ADAD",
            borderRadius: 12,
            paddingLeft: 10,
          }}
        >
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={{
              flex: 1,
              height: 40,
              color: "black",
              fontSize: 16,
            }}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      )}

      {title === "Profile Photo" && (
        <TouchableOpacity
          onPress={handleImageInput}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#E0E0E0",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#60b2ff",
          }}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%", borderRadius: 50 }}
            />
          ) : (
            <Image
              source={icons.camera}
              style={{ width: 30, height: 30, tintColor: "#A4A0A0" }}
            />
          )}
        </TouchableOpacity>
      )}

      {title !== "Gender" && title !== "Profile Photo" && (
        <View
          className="w-full h-14 px-4 bg-white flex flex-row items-center"
          style={{
            borderWidth: 1,
            borderColor: "#B0ADAD",
            borderRadius: 12,
          }}
        >
          <TextInput
            className="flex-1 text-black font-pregular text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#A9A9A9"
            onChangeText={handleChangeText}
            secureTextEntry={isPasswordField && !showPassword}
            keyboardType={keyboardType}
            style={{
              flex: 1,
              color: 'black',
              fontSize: 16,
              paddingRight: isPasswordField ? 40 : 10,
            }}
            {...props}
          />
          
          {isPasswordField && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                padding: 10,
                position: 'absolute',
                right: 10,
              }}
            >
              <Image
                source={showPassword ? icons.eye : icons.eyeHide}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: '#A9A9A9'
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default FormField;