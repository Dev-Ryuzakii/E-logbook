import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

const HiddenLayout = () => {
  return (
    <>
    <Stack>
      <Stack.Screen 
        name="notification" 
        options={{
          headerShown: false,
          title: "Notification",
        }}
      />
      <Stack.Screen 
        name="profile" 
        options={{
          headerShown: false,
          title: ""
        }}
      />
       <Stack.Screen 
        name="account" 
        options={{
          headerShown: false,
          title: ""
        }}
      />
       <Stack.Screen 
        name="terms-and-conditions" 
        options={{
          headerShown: false,
          title: ""
        }}
      />
       <Stack.Screen 
        name="language" 
        options={{
          headerShown: false,
          title: ""
        }}
      />
       <Stack.Screen 
        name="elogbook" 
        options={{
          headerShown: false,
          title: ""
        }}
      />
      <Stack.Screen 
        name="appearance" 
        options={{
          headerShown: false,
          title: ""
        }}
      />
    </Stack>
    </>
  );
}

export default HiddenLayout