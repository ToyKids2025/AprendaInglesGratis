/**
 * APP NAVIGATOR
 * Main navigation setup for mobile app
 */

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'

// Screens
import HomeScreen from '../screens/HomeScreen'
import LearnScreen from '../screens/LearnScreen'
import ProgressScreen from '../screens/ProgressScreen'
import SocialScreen from '../screens/SocialScreen'
import ProfileScreen from '../screens/ProfileScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import PhraseDetailScreen from '../screens/PhraseDetailScreen'
import ChallengesScreen from '../screens/ChallengesScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

/**
 * Bottom Tab Navigator
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home'

          if (route.name === 'Home') iconName = 'home'
          else if (route.name === 'Learn') iconName = 'school'
          else if (route.name === 'Progress') iconName = 'trending-up'
          else if (route.name === 'Social') iconName = 'people'
          else if (route.name === 'Profile') iconName = 'person'

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Learn" component={LearnScreen} options={{ title: 'Aprender' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progresso' }} />
      <Tab.Screen name="Social" component={SocialScreen} options={{ title: 'Social' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  )
}

/**
 * Main App Navigator
 */
export default function AppNavigator() {
  // TODO: Add authentication state check
  const isAuthenticated = true

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="PhraseDetail" component={PhraseDetailScreen} />
            <Stack.Screen name="Challenges" component={ChallengesScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
