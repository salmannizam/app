import React, { useState, useEffect } from "react";
import { View, Animated, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import close icon

const RightSidebar = ({ isVisible, onClose }) => {
  const [slideAnim] = useState(new Animated.Value(250)); // Sidebar starts off-screen

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : 250, // Slide in if visible, slide out otherwise
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        styles.sidebar,
        { transform: [{ translateX: slideAnim }] }, // Apply animation
      ]}
    >
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 250,
    height: "100%",
    backgroundColor: "white",
    elevation: 10,
    padding: 20,
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
});

export default RightSidebar;
