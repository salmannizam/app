import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import { Button, Card, TextInput, Snackbar } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker'; // For dropdown picker
import * as ImagePicker from "expo-image-picker";

const QuestionnaireScreen = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [imageUris, setImageUris] = useState<{ [key: number]: string | null }>({}); // Track image per question
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null); // Track only the currently open dropdown ID
  const [openAccordion, setOpenAccordion] = useState<{ [key: number]: boolean }>({}); // Track accordion state for image upload

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
    setLoading(true);
    const mandatoryQuestions = questions.filter(q => q.Mandatory === "Yes");

    if (mandatoryQuestions.some(q => !answers.find(a => a.QuestionID === q.QuestionID)?.answer)) {
      setSnackbarMessage('Please answer all mandatory questions before submitting.');
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }
    console.log("Survey answers submitted:", answers);
    setSnackbarMessage('Your answers have been successfully submitted.');
    setOpenSnackbar(true);
    setLoading(false);
  };

  const handleResetSurvey = () => {
    setAnswers([]);
    setImageUris({});
  };

  const handleImageUpload = async (questionId: number) => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access media library is required.');
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUris(prev => ({ ...prev, [questionId]: uri }));
    } else {
      console.log('Image picker canceled');
    }
  };

  const renderQuestion = (question: any) => (
    <Card key={question.QuestionID} style={styles.card}>
      <Card.Content>
        <Text style={styles.question}>{question.Question}</Text>

        {question.Questiontype === 'User Input' && (
          <TextInput
            style={styles.input}
            mode="outlined"
            keyboardType={question.Datatype === 'Number' ? 'numeric' : 'default'}
            onChangeText={(text) => handleAnswerChange(question.QuestionID, text)}
            value={answers.find(a => a.QuestionID === question.QuestionID)?.answer || ''}
          />
        )}

        {question.Questiontype === 'Single Choice' && question.Choices && (
          <DropDownPicker
            multiple={false}
            open={openDropdown === question.QuestionID}
            value={answers.find(a => a.QuestionID === question.QuestionID)?.answer || ''}
            items={question.Choices.map(choice => ({
              label: choice.ChoiceText,
              value: choice.ChoiceText,
            }))}
            setValue={(callback) => {
              const newValue = callback(answers.find(a => a.QuestionID === question.QuestionID)?.answer || '');
              handleAnswerChange(question.QuestionID, newValue);
            }}
            containerStyle={styles.pickerContainer}
            setOpen={(isOpen) => {
              setOpenDropdown(isOpen ? question.QuestionID : null);
            }}
            style={styles.dropdownStyle} // Add this style for dropdown customizations
            dropDownContainerStyle={styles.dropdownContainerStyle} // Add this style for the dropdown container customization
          />
        )}

        {question.Questiontype === 'Matrix' && question.Matrixtype === 'Drop Down' && question.Choices && (
          <DropDownPicker
            multiple={false}
            open={openDropdown === question.QuestionID}
            value={answers.find(a => a.QuestionID === question.QuestionID)?.answer || ''}
            items={question.Choices.map(choice => ({
              label: choice.ChoiceText,
              value: choice.ChoiceText,
            }))}
            setValue={(callback) => {
              const newValue = callback(answers.find(a => a.QuestionID === question.QuestionID)?.answer || '');
              handleAnswerChange(question.QuestionID, newValue);
            }}
            containerStyle={styles.pickerContainer}
            setOpen={(isOpen) => {
              setOpenDropdown(isOpen ? question.QuestionID : null);
            }}
            style={styles.dropdownStyle} // Add this style for dropdown customizations
            dropDownContainerStyle={styles.dropdownContainerStyle} // Add this style for the dropdown container customization
          />
        )}

        {question.Questiontype === 'Image' && (
          <View style={styles.accordionContainer}>
            <Button
              mode="outlined"
              onPress={() => setOpenAccordion(prev => ({ ...prev, [question.QuestionID]: !prev[question.QuestionID] }))}
              style={styles.accordionButton}
              labelStyle={styles.accordionButtonLabel}
            >
              {openAccordion[question.QuestionID] ? 'Hide' : 'Show'} Image Upload
            </Button>
            {openAccordion[question.QuestionID] && (
              <View style={styles.imageContainer}>
                <Text style={styles.imageText}>Upload Image</Text>
                {imageUris[question.QuestionID] ? (
                  <Image source={{ uri: imageUris[question.QuestionID] }} style={styles.imagePreview} />
                ) : (
                  <Text style={styles.imageText}>No image selected</Text>
                )}
                <Button
                  icon="camera"
                  mode="contained"
                  onPress={() => handleImageUpload(question.QuestionID)}
                  style={styles.uploadButton}
                >
                  Select Image
                </Button>
              </View>
            )}
          </View>
        )}

      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        renderItem={({ item }) => renderQuestion(item)}
        keyExtractor={(item) => item.QuestionID.toString()}
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<Text style={styles.title}>Survey Questions</Text>}
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={handleResetSurvey} style={styles.resetButton} color="#5bc0de">
              Reset
            </Button>

            {loading ? (
              <ActivityIndicator animating={true} size="large" color="#5bc0de" />
            ) : (
              <Button mode="contained" onPress={handleSubmitSurvey} style={styles.submitButton} color="#5bc0de">
                Submit Survey
              </Button>
            )}
          </View>
        }
      />

      <Snackbar visible={openSnackbar} onDismiss={() => setOpenSnackbar(false)} duration={Snackbar.DURATION_SHORT}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 10,  
    paddingTop: 100,  
    paddingBottom: 50, 
  },
  title: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 6,
    borderRadius: 8,
    padding: 2,
    elevation: 1,
  },
  question: {
    fontSize: 11,
    marginBottom: 5,
  },
  input: {
    marginBottom: 2,
    fontSize: 10,
    height: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pickerContainer: {
    marginBottom: 2,
  },
  dropdownStyle: {
    zIndex: 9999,
    position: 'relative',
  },
  dropdownContainerStyle: {
    zIndex: 9999,
    position: 'absolute',
  },
  accordionContainer: {
    marginBottom: 2,
  },
  accordionButton: {
    paddingVertical: 4,
  },
  accordionButtonLabel: {
    fontSize: 11,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 2,
  },
  imageText: {
    textAlign: 'center',
    marginBottom: 6,
    fontSize: 11,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  uploadButton: {
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 15,
  },
  resetButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#FF6F61',
  },
  submitButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#4CAF50',
  },
});

export default QuestionnaireScreen;
