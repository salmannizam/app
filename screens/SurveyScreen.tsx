// screens/SurveyScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const SurveyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    console.log('Survey Answer:', answer);
    navigation.replace('Home'); // You can replace with any screen after survey completion
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey Question</Text>
      <Text style={styles.question}>What is your favorite color?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your answer"
        value={answer}
        onChangeText={setAnswer}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 8,
  },
});

export default SurveyScreen;
