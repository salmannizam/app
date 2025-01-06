import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Image, View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';  // Correct import
import { TouchableOpacity } from 'react-native';

const QuestionnaireScreen = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const questionsData = require('../assets/questions.json');
    setQuestions(questionsData);
  }, []);

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prevAnswers => {
      const updatedAnswers = [...prevAnswers];
      const index = updatedAnswers.findIndex(a => a.QuestionID === questionId);
      if (index !== -1) {
        updatedAnswers[index].answer = answer;
      } else {
        updatedAnswers.push({ QuestionID: questionId, answer });
      }
      return updatedAnswers;
    });
  };

  const handleSubmitSurvey = () => {
    if (answers.length === 0 || answers.some(a => !a.answer && questions.find(q => q.QuestionID === a.QuestionID).Mandatory === "Yes")) {
      Alert.alert('Error', 'Please answer all mandatory questions before submitting.');
      return;
    }

    console.log("Survey answers submitted:", answers);
    Alert.alert('Survey Submitted', 'Your answers have been successfully submitted.');
  };

  const handleResetSurvey = () => {
    setAnswers([]);
    setImageUri(null);
  };

  const handleImageUpload = () => {
    Alert.alert('Image Picker', 'Implement Image Picker Here');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <Text variant="headlineMedium" style={styles.title}>Survey Questions</Text>

      {questions.map((question) => (
        <Card key={question.QuestionID} style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.question}>{question.Question}</Text>

            {question.Questiontype === 'User Input' && (
              <TextInput
                style={styles.input}
                label={`Enter ${question.Question}`}
                keyboardType={question.Datatype === 'Number' ? 'numeric' : 'default'}
                onChangeText={(text) => handleAnswerChange(question.QuestionID, text)}
              />
            )}

            {question.Questiontype === 'Single Choice' && question.Choices && (
              <View style={styles.choiceContainer}>
                <Picker
                  selectedValue={answers.find(a => a.QuestionID === question.QuestionID)?.answer || ''}
                  onValueChange={(itemValue) => handleAnswerChange(question.QuestionID, itemValue)}
                  style={styles.picker}
                >
                  {question.Choices.map((choice, index) => (
                    <Picker.Item key={index} label={choice.ChoiceText} value={choice.ChoiceText} />
                  ))}
                </Picker>
              </View>
            )}

            {question.Questiontype === 'Matrix' && question.Choices && (
              <Picker
                selectedValue={answers.find(a => a.QuestionID === question.QuestionID)?.answer || ''}
                onValueChange={(itemValue) => handleAnswerChange(question.QuestionID, itemValue)}
                style={styles.picker}
              >
                {question.Choices.map((choice, index) => (
                  <Picker.Item key={index} label={choice.ChoiceText} value={choice.ChoiceText} />
                ))}
              </Picker>
            )}

            {question.Questiontype === 'Image' && (
              <View style={styles.imageContainer}>
                <Text variant="bodyMedium" style={styles.imageText}>Upload Image</Text>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                ) : (
                  <Text style={styles.imageText}>No image selected</Text>
                )}
                <Button icon="camera" mode="contained" onPress={handleImageUpload} style={styles.uploadButton}>
                  Select Image
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      ))}

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={handleResetSurvey} style={styles.button} color="#d9534f">
          Reset
        </Button>
        <Button mode="contained" onPress={handleSubmitSurvey} style={styles.button} color="#5bc0de">
          Submit Survey
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    padding: 12,
    paddingTop: 100,
    paddingBottom:60
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 15,
    borderRadius: 8,
    padding: 8,
  },
  question: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    marginBottom: 15,
    fontSize: 14,
  },
  choiceContainer: {
    marginBottom: 15,
  },
  picker: {
    fontSize: 14,
    backgroundColor: '#f7f7f7',
    marginBottom: 10,
    borderRadius: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButton: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
  },
});

export default QuestionnaireScreen;
