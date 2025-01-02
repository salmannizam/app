import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';

// Import Screens
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SurveyScreen from "./screens/SurveyScreen";

// Import LogoutButton component
import LogoutButton from "./components/LogoutButton"; 

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator(); 

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

  // Function to handle logout
  const handleLogout = async (navigation: any) => {
    await AsyncStorage.removeItem("authToken");
    navigation.navigate("Login");  // Navigate directly to Login screen
  };

  // Drawer Navigator that wraps your authenticated screens
  const AuthenticatedDrawer = () => {
    const navigation = useNavigation(); 

    return (
      <Drawer.Navigator
        screenOptions={{
          drawerStyle: {
            width: 200, // Change drawer width here
            backgroundColor: '#f4f4f4', // You can also customize the background color
          },
          drawerPosition: 'left', // You can change this to 'right' for a right-side drawer
        }}
        drawerContent={(props) => (
          <View style={{ flex: 1 }}>
            {/* Render the default Drawer content */}
            <DrawerContentScrollView {...props}>
              <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Add the LogoutButton to the Drawer */}
            <LogoutButton onLogout={() => handleLogout(navigation)} />
          </View>
        )}
      >
        <Drawer.Screen name="Dashboard" component={DashboardScreen} />
        <Drawer.Screen name="Survey" component={SurveyScreen} />
      </Drawer.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "DrawerScreen" : "Login"}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="DrawerScreen"
          component={AuthenticatedDrawer}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
