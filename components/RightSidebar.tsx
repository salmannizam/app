import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Collapsible from 'react-native-collapsible';

interface Survey {
  answers: any[];
}

interface RightSidebarProps {
  surveys: Survey[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ surveys }) => {
  const [isVisible, setIsVisible] = useState(false); // Track visibility of the sidebar
  const [animation] = useState(new Animated.Value(-300)); // Start off-screen

  const toggleSidebar = () => {
    setIsVisible(!isVisible);
    Animated.timing(animation, {
      toValue: isVisible ? -300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Floating Icon */}
      <TouchableOpacity onPress={toggleSidebar} style={styles.floatingButton}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>

      {/* Sliding Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: animation }] }]}>
        <View style={styles.sidebarContent}>
          <Text style={styles.title}>Completed Surveys</Text>
          {surveys.length > 0 ? (
            surveys.map((survey, index) => (
              <Collapsible key={index} collapsed={false}>
                <View style={styles.surveyItem}>
                  <Text>Survey {index + 1}</Text>
                  {/* Render survey data here */}
                  <Text>Answers: {survey.answers.length}</Text>
                </View>
              </Collapsible>
            ))
          ) : (
            <Text>No surveys available</Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },
  floatingButton: {
    backgroundColor: '#5bc0de',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  buttonText: {
    fontSize: 30,
    color: '#fff',
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#fff',
    elevation: 5,
    padding: 20,
    zIndex: 10,
  },
  sidebarContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  surveyItem: {
    marginBottom: 15,
  },
});

export default RightSidebar;
