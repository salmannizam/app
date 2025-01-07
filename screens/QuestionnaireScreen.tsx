import React, { useState, useEffect } from 'react';
import { FlatList, Alert, Image, View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Card, Snackbar } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';  // Using a more modern dropdown
import { TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-picker'; // To handle image uploads

const QuestionnaireScreen = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Add state for controlling the dropdown visibility
  const [openDropdown, setOpenDropdown] = useState<{ [key: number]: boolean }>({});

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
      setSnackbarMessage('Please answer all mandatory questions before submitting.');
      setOpenSnackbar(true);
      return;
    }
    console.log("Survey answers submitted:", answers);
    setSnackbarMessage('Your answers have been successfully submitted.');
    setOpenSnackbar(true);
  };

  const handleResetSurvey = () => {
    setAnswers([]);
    setImageUri(null);
  };

  const handleImageUpload = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      } else {
        setSnackbarMessage('Image selection failed!');
        setOpenSnackbar(true);
      }
    });
  };

  // Render each question dynamically
  const renderQuestion = ({ item: question }) => (
    <Card key={question.QuestionID} style={styles.card}>
      <Card.Content>
        {question.Questiontype !== 'User Input' && (
          <Text variant="titleSmall" style={styles.question}>{question.Question}</Text>
        )}

        {question.Questiontype === 'User Input' && (
          <TextInput
            style={styles.input}
            label={`Enter ${question.Question}`}  // Floating label
            mode="outlined"  // Adding outlined mode for better styling
            keyboardType={question.Datatype === 'Number' ? 'numeric' : 'default'}
            onChangeText={(text) => handleAnswerChange(question.QuestionID, text)}
            value={answers.find(a => a.QuestionID === question.QuestionID)?.answer || ''}  // Bind value
          />
        )}

        {question.Questiontype === 'Single Choice' && question.Choices && (
          <View style={styles.choiceContainer}>
            <DropDownPicker
              open={openDropdown[question.QuestionID] || false}  // Toggle visibility based on state
              value={answers.find(a => a.QuestionID === question.QuestionID)?.answer || ''}
              items={question.Choices.map((choice, index) => ({
                label: choice.ChoiceText,
                value: choice.ChoiceText,
              }))}
              setValue={(itemValue) => handleAnswerChange(question.QuestionID, itemValue)}
              containerStyle={styles.pickerContainer}
              setOpen={(callback: (prevState: boolean) => boolean) => setOpenDropdown(prevState => ({ ...prevState, [question.QuestionID]: callback(prevState[question.QuestionID] || false) }))}
            
            />
          </View>
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
  );

  return (
    <>
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={item => item.QuestionID.toString()}
        contentContainerStyle={styles.scrollViewContainer}
        ListHeaderComponent={
          <Text variant="headlineMedium" style={styles.title}>Survey Questions</Text>
        }
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={handleResetSurvey} style={styles.resetButton} color="#5bc0de">
              Reset
            </Button>
            <Button mode="contained" onPress={handleSubmitSurvey} style={styles.submitButton} color="#5bc0de">
              Submit Survey
            </Button>
          </View>
        }
      />

      {/* Snackbar for displaying messages */}
      <Snackbar
        visible={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    padding: 12,
    paddingTop: 100,
    paddingBottom: 60,
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
    elevation: 3,  // Adding shadow effect
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
  pickerContainer: {
    marginBottom: 10,
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
  resetButton: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
    backgroundColor: '#FF6F61',
  },
  submitButton: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
    backgroundColor: '#4CAF50',
  },
});

export default QuestionnaireScreen;
