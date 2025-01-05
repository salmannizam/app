// HomeScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

// This type maps 'Home' and 'SurveyDetails' screens to their parameters
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SurveyDetails'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [productId, setProductId] = useState('');
  const [surveyId, setSurveyId] = useState('');

  const handleNavigate = () => {
    if (productId && surveyId) {
      console.log(navigation);  // This should not be undefined if navigation is passed correctly
      navigation.navigate('SurveyDetails', { productId, surveyId });

      // Validate the Product ID and navigate to SurveyDetails screen
      fetch(`https://api.example.com/validateProduct?productId=${productId}`)
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            navigation.navigate('SurveyDetails', { productId, surveyId });
          } else {
            alert('Invalid Product ID');
          }
        })
        .catch(err => alert('Error validating Product ID'));
    } else {
      alert('Please enter valid Product ID and Survey ID');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey App</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Product ID"
        value={productId}
        onChangeText={setProductId}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Survey ID"
        value={surveyId}
        onChangeText={setSurveyId}
      />
      <Button title="Proceed" onPress={handleNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginBottom: 10,
    paddingLeft: 8,
  },
});

export default HomeScreen;
