import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";


const AuthLayout =  () => {
    return(
        <>
            <Stack>
                <Stack.Screen
                    name="sign-in"
                    options={{
                        headerShown:false,
                    }}
                />

                <Stack.Screen
                    name="sign-up"
                    options={{
                        headerShown:false,
                    }}
                />

                <Stack.Screen
                    name="onboarding"
                    options={{
                        headerShown:false,
                    }}
                />

<Stack.Screen
                    name="capture"
                    options={{
                        headerShown:false,
                    }}
                />

<Stack.Screen
                    name="recover"
                    options={{
                        headerShown:false,
                    }}
                />

<Stack.Screen
                    name="enterotp"
                    options={{
                        headerShown:false,
                    }}
                />
            </Stack>
        </>
    )
}

export default AuthLayout