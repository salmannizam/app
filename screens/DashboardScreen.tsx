// DashboardScreen.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DashboardScreen = ({ navigation }: any) => {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    navigation.navigate("Login"); // Navigate directly to Login screen
  };

  return (
    <View>
      <Text>Welcome to the Dashboard!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default DashboardScreen;
