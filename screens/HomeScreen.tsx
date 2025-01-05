import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import axios from 'axios';

// This type maps 'Home' and 'SurveyDetails' screens to their parameters
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SurveyDetails'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [productId, setProductId] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [productIdValid, setProductIdValid] = useState(true); // Track if product ID is valid
  const [surveyIdValid, setSurveyIdValid] = useState(true); // Track if survey ID is valid

  const handleNavigate = () => {
    if (productId && surveyId) {
      // Prepare request body
      const requestData = {
        surveyId: surveyId,
        productId: productId,
      };

      // API call using axios
      axios
        .post('http://192.168.1.4:3000/survey/validate-project', requestData)
        .then((response) => {
          // Assuming the response has a field `valid` to determine the validity
          if (response.data.status == "success") {
            // Navigate to SurveyDetails screen with productId and surveyId as params
            navigation.navigate('SurveyDetails', { productId, surveyId });
          } else {
            setProductIdValid(false);
            Alert.alert('Invalid Product ID', 'Please enter a valid Product ID.');
          }
        })
        .catch((err) => {
          console.error(err);
          Alert.alert('Error', 'Error validating Product ID');
        });
    } else {
      Alert.alert('Missing Fields', 'Please enter both Product ID and Survey ID');
    }
  };

  return (
    <ImageBackground
      // source={require('../assets/bg.png')} // Path to the image
      style={styles.container} // Style the container to ensure the image covers the full screen
    >
      {/* Product ID Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Product ID</Text>
        <TextInput
          style={[styles.input, !productIdValid && styles.inputError]} // Apply error styling if invalid
          placeholder="Enter Product ID"
          placeholderTextColor="#888"
          value={productId}
          onChangeText={text => {
            setProductId(text);
            setProductIdValid(true); // Reset error on text change
          }}
        />
      </View>

      {/* Survey ID Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Survey ID</Text>
        <TextInput
          style={[styles.input, !surveyIdValid && styles.inputError]} // Apply error styling if invalid
          placeholder="Enter Survey ID"
          placeholderTextColor="#888"
          value={surveyId}
          onChangeText={text => {
            setSurveyId(text);
            setSurveyIdValid(true); // Reset error on text change
          }}
        />
      </View>

      {/* Proceed Button */}
      <TouchableOpacity style={styles.button} onPress={handleNavigate}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#E74C3C', // Red border color for invalid input
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50', // Green color for proceed button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // Add shadow for Android
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
