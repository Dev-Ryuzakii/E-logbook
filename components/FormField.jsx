import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Platform, Alert } from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { icons } from "../constants"; // Ensure icons are correctly imported
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
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  // Function to handle image selection from gallery
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

  // Function to handle photo capture using camera
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

  // Function to display options for picking or capturing image
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

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      {/* Title */}
      {title && (
        <Text
          className="text-black font-bold text-base mb-2"
          style={{ fontWeight: "600", fontSize: 16, color: "#333" }}
        >
          {title}
        </Text>
      )}

      {/* Gender Dropdown */}
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

      {/* Image Input */}
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

      {/* Text Input */}
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
            secureTextEntry={title === "Password" && !showPassword}
            keyboardType={keyboardType}
            {...props}
          />
          {/* Password Visibility Toggle */}
          {title === "Password" && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Image
                source={!showPassword ? icons.eye : icons.eyeHide}
                className="w-6 h-6"
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
