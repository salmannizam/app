import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native'; // Import Lottie for animation
import HomeScreen from './screens/HomeScreen';
import SurveyDetailsScreen from './screens/SurveyDetailsScreen';
import QuestionnaireScreen from './screens/QuestionnaireScreen';
import Toast from 'react-native-toast-message';

// Create the Stack Navigator
const Stack = createStackNavigator();

// Footer Component (Optional)
const Footer = () => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.arrowContainer}>
        <LottieView
          source={require('./assets/bg.json')} // Add your custom Lottie JSON file here
          autoPlay
          loop
          style={styles.arrowAnimation}
        />
      </TouchableOpacity>
    </View>
  );
};

// App Component
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1D3C6B', // Modern gradient header color
                shadowOpacity: 0, // Removes shadow for a clean look
                height: 100, // Set a specific height for the header if needed
              },
              headerTintColor: '#FFFFFF', // White text color
              headerTitle: 'Survey', // Set header title
              headerTitleStyle: {
                fontFamily: 'Arial', // Clean font for title
                fontWeight: 'bold',
                fontSize: 24, // Larger header font size
              },
              headerTransparent: true, // Semi-transparent header
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SurveyDetails" component={SurveyDetailsScreen} />
            <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
          </Stack.Navigator>

          {/* Footer added here */}
          <Footer />
        </View>

        {/* Configure Toast with custom styles */}
        <Toast
          config={{
            success: ({ text1, text2 }) => (
              <View style={[styles.toast, styles.toastSuccess]}>
                <Text style={styles.toastText}>{text1}</Text>
                <Text style={styles.toastSubText}>{text2}</Text>
              </View>
            ),
            error: ({ text1, text2 }) => (
              <View style={[styles.toast, styles.toastError]}>
                <Text style={styles.toastText}>{text1}</Text>
                <Text style={styles.toastSubText}>{text2}</Text>
              </View>
            ),
            info: ({ text1, text2 }) => (
              <View style={[styles.toast, styles.toastInfo]}>
                <Text style={styles.toastText}>{text1}</Text>
                <Text style={styles.toastSubText}>{text2}</Text>
              </View>
            ),
          }}
        />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

// Styles for the UI
const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1D3C6B', // Footer dark gradient
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  arrowContainer: {
    padding: 10,
    borderRadius: 50, // Rounded corners for button
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowAnimation: {
    width: 40, // Width of the animated arrow
    height: 40, // Height of the animated arrow
  },
  // Toast Styles
  toast: {
    padding: 16,
    borderRadius: 8,
    width: '95%', // Force full width
    maxWidth: '95%', // Max width is 100% of the screen
    alignSelf: 'center', // Center horizontally
    marginHorizontal: 0, // Remove any margins
    position: 'absolute', // Position it absolutely to the screen
    top: 50, // Adjust the vertical position if needed
  },
  toastText: {
    color: '#fff',  // Toast text color
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastSubText: {
    color: '#fff', // Toast subtext color
    fontSize: 14,
    marginTop: 4,
  },
  toastSuccess: {
    backgroundColor: '#4CAF50', // Green background for success
  },
  toastError: {
    backgroundColor: '#FF6F61', // Red background for error
  },
  toastInfo: {
    backgroundColor: '#1E90FF', // Blue background for info
  },
});

export default App;
