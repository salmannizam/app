import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer"; // Import Drawer
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import Screens
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SurveyScreen from "./screens/SurveyScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator(); // Create Drawer

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Error checking auth token:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthToken();
  }, []);

  if (isAuthenticated === null) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Drawer Navigator that wraps your authenticated screens
  const AuthenticatedDrawer = () => (
    <Drawer.Navigator>
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Survey" component={SurveyScreen} />
    </Drawer.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "DrawerScreen" : "Login"}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // Hide header for Login screen
        />
        <Stack.Screen
          name="DrawerScreen"
          component={AuthenticatedDrawer}
          options={{ headerShown: false }} // Hide header for Drawer screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
