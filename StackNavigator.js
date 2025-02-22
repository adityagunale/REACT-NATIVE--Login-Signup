import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MainScreen from './screens/MainScreen';
import ForgotPassword from './screens/ForgotPassword';

const StackNavigation = () => {

    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}}/>
                <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
                <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown:false}}/>
                <Stack.Screen name="Forgot Password" component={ForgotPassword}  />
                <Stack.Screen name="Main" component={MainScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default StackNavigation

const styles = StyleSheet.create({})