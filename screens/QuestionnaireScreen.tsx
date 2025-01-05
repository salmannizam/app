import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const QuestionnaireScreen = ({ route }: any) => {
  const { productId, surveyId } = route.params;
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);

  useEffect(() => {
    const questionData = [
      {
        "QuestionID": 10033164,
        "Question": "Please Select Brand",
        "Questiontype": "Single Choice",
        "Mandatory": "Yes",
        "Choices": [
          { "ChoiceText": "AHO" },
          { "ChoiceText": "CP" },
          { "ChoiceText": "GLC" },
          { "ChoiceText": "HJ" },
          { "ChoiceText": "HON" }
        ]
      },
      {
        "QuestionID": 10033168,
        "Question": "UNIT CODE",
        "Questiontype": "Matrix",
        "Mandatory": "No",
        "Matrixtype": "Drop Down",
        "Choices": [
          { "ChoiceText": "AL" },
          { "ChoiceText": "BD" },
          { "ChoiceText": "BH" },
          { "ChoiceText": "BL" },
          { "ChoiceText": "BM" },
          { "ChoiceText": "BT" },
          { "ChoiceText": "BU" },
          { "ChoiceText": "ID" },
          { "ChoiceText": "JK" },
          { "ChoiceText": "LK" },
          { "ChoiceText": "MB" },
          { "ChoiceText": "NP" }
        ]
      },
      {
        "QuestionID": 10033169,
        "Question": "Batch No.",
        "Questiontype": "User Input",
        "Mandatory": "No",
        "Datatype": "Number"
      },
    ];
    setQuestions(questionData);
  }, [surveyId]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prevAnswers => {
      const updatedAnswers = [...prevAnswers];
      const existingAnswerIndex = updatedAnswers.findIndex((a: any) => a.QuestionID === questionId);
      if (existingAnswerIndex !== -1) {
        updatedAnswers[existingAnswerIndex].answer = answer;
      } else {
        updatedAnswers.push({ QuestionID: questionId, answer });
      }
      return updatedAnswers;
    });
  };

  const handleImagePick = async (questionId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct enum usage
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Handle the updated result structure (assets array)
      const imageUri = result.assets?.[0]?.uri;
      if (imageUri) {
        handleAnswerChange(questionId, imageUri);
      }
    }
  };

  const handleSubmit = () => {
    fetch('https://api.example.com/submitSurvey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, surveyId, answers }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Survey completed successfully');
        } else {
          alert('Failed to submit survey');
        }
      })
      .catch(err => alert('Error submitting survey'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey Questions</Text>
      {questions.map((question) => (
        <View key={question.QuestionID} style={styles.questionContainer}>
          <Text style={styles.question}>{question.Question}</Text>

          {question.Questiontype === 'Single Choice' && question.Choices && (
            <View>
              {question.Choices.map((choice: { ChoiceText: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                <TouchableOpacity
                  key={index}
                  style={styles.choiceButton}
                  onPress={() => handleAnswerChange(question.QuestionID, choice.ChoiceText)}>
                  <Text>{choice.ChoiceText}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {question.Questiontype === 'Matrix' && question.Choices && (
            <Picker
              selectedValue={answers.find((a: any) => a.QuestionID === question.QuestionID)?.answer}
              onValueChange={(itemValue) => handleAnswerChange(question.QuestionID, itemValue)}>
              {question.Choices.map((choice: { ChoiceText: string | undefined; }, index: React.Key | null | undefined) => (
                <Picker.Item key={index} label={choice.ChoiceText} value={choice.ChoiceText} />
              ))}
            </Picker>
          )}

          {question.Questiontype === 'User Input' && (
            <TextInput
              style={styles.input}
              placeholder={`Enter ${question.Question}`}
              onChangeText={(text) => handleAnswerChange(question.QuestionID, text)}
            />
          )}

          {question.Questiontype === 'Image' && (
            <View>
              <Button title="Select Image" onPress={() => handleImagePick(question.QuestionID)} />
              {answers.find((a: any) => a.QuestionID === question.QuestionID)?.answer && (
                <Image
                  source={{ uri: answers.find((a: any) => a.QuestionID === question.QuestionID)?.answer }}
                  style={styles.image}
                />
              )}
            </View>
          )}
        </View>
      ))}
      <Button title="Submit Survey" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    marginBottom: 10,
  },
  choiceButton: {
    marginBottom: 5,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});

export default QuestionnaireScreen;
