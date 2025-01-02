// LogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the Icon component

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
        justifyContent: "flex-start",
      }}
      onPress={onLogout}
    >
      {/* Icon Component */}
      <Icon name="exit-to-app" size={24} color="red" />
      
      {/* Text Component should wrap the text */}
      <Text style={{ marginLeft: 8, color: "red", fontSize: 16 }}>
        Logout
      </Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;
