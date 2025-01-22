import { Tabs } from 'expo-router';
import { View, Text, Image } from 'react-native';

import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-1">
      {/* Icon */}
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color }}
        className="w-6 h-6"
      />

      {/* Label */}
      <Text
        className={`${
          focused ? 'font-semibold' : 'font-regular'
        } text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#60B2FF', // Blue color for active tabs
          tabBarInactiveTintColor: '#A0A0A0', // Grey for inactive tabs
          tabBarStyle: {
            backgroundColor: '#fff', // White background
            borderRadius: 20, // Rounded edges
            borderTopWidth: 0, // No border at the top
            height: 70, // Adjust height to match the design
            marginHorizontal: 20, // Spacing on the sides
            marginBottom: 10, // Spacing above the safe area
            shadowColor: '#000', // Shadow for better UI
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4, // Elevation for Android shadow
          },
          tabBarItemStyle: {
            paddingVertical: 10, // Padding for individual items
          },
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                name="Home"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        
        {/* chat Tab */}
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.chat}
                name="Chat"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        {/* Search Tab */}
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.search}
                name="Search"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        {/* Settings Tab */}
        <Tabs.Screen
          name="setting"
          options={{
            title: "Setting",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.setting}
                name="Setting"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
