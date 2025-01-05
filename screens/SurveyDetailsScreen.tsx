// app/SurveyDetailsScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';

const SurveyDetailsScreen = ({ route, navigation }: any) => {
  const { productId, surveyId } = route.params;
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startZone, setStartZone] = useState('');

  const handleSubmit = () => {
    // Call API to submit the pre-survey data
    navigation.navigate('Questionnaire', { productId, surveyId });
    fetch('https://api.example.com/submitPreSurvey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, surveyId, address, city, country, startZone }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          navigation.navigate('Questionnaire', { productId, surveyId });
        } else {
          alert('Failed to submit pre-survey data');
        }
      })
      .catch(err => alert('Error submitting pre-survey data'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pre-Survey Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Country"
        value={country}
        onChangeText={setCountry}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Start Zone"
        value={startZone}
        onChangeText={setStartZone}
      />

      <Button title="Next" onPress={handleSubmit} />
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

export default SurveyDetailsScreen;
