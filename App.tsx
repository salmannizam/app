import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native'; // Import Lottie for animation
import HomeScreen from './screens/HomeScreen';
import SurveyDetailsScreen from './screens/SurveyDetailsScreen';
import QuestionnaireScreen from './screens/QuestionnaireScreen';

// Create the Stack Navigator
const Stack = createStackNavigator();

const Footer = () => {
  return (
    <View style={styles.footer}>
      {/* Lottie Animation for a smooth footer interaction */}
      <TouchableOpacity style={styles.arrowContainer}>
      {/* <Text style={styles.arrowAnimation}>↑</Text> */}
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
    color:"#FF6F61",
    width: 40, // Width of the animated arrow
    height: 40, // Height of the animated arrow
  },
});

export default App;
