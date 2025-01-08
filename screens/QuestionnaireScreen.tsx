import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList } from 'react-native';
import { Button, Card, TextInput, Snackbar } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker'; // For dropdown picker
import * as ImagePicker from "expo-image-picker";

const QuestionnaireScreen = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDropdown, setOpenDropdown] = useState<{ [key: number]: boolean }>({}); // Manage dropdown open/close state
  const [openAccordion, setOpenAccordion] = useState<{ [key: number]: boolean }>({}); // Track accordion state for image upload

  useEffect(() => {
    const questionsData = require('../assets/questions.json');
    setQuestions(questionsData);
  }, []);

  const handleAnswerChange = (questionId: number, answer: any) => {
    console.log(answer)
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

  const handleImageUpload = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access media library is required.");
      return;
    }

    // Open image library picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Provide media types as an array
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri; // Access the image URI
      setImageUri(uri);
    } else {
      console.log("Image picker canceled");
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
            open={openDropdown[question.QuestionID] || false}
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
            setOpen={(isOpen) =>
              setOpenDropdown((prevState) => ({
                ...prevState,
                [question.QuestionID]: !!isOpen,
              }))
            }
            style={styles.dropdownStyle} // Add this style for dropdown customizations
            dropDownContainerStyle={styles.dropdownContainerStyle} // Add this style for the dropdown container customization
          />
        )}

        {question.Questiontype === 'Matrix' && question.Matrixtype === 'Drop Down' && question.Choices && (
          <DropDownPicker
            multiple={false}
            open={openDropdown[question.QuestionID] || false}
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
            setOpen={(isOpen) =>
              setOpenDropdown((prevState) => ({
                ...prevState,
                [question.QuestionID]: !!isOpen,
              }))
            }
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
            <Button mode="contained" onPress={handleSubmitSurvey} style={styles.submitButton} color="#5bc0de">
              Submit Survey
            </Button>
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
    padding: 10,  // Reduced padding
    paddingTop: 100,  // Reduced padding-top for more questions to fit
    paddingBottom: 50, // Reduced padding-bottom for better space usage
  },
  title: {
    textAlign: 'center',
    marginBottom: 15,  // Reduced space for the title
    fontSize: 18,  // Smaller font for the title
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 6,  // Reduced margin for compactness
    borderRadius: 8,
    padding: 2,  // Smaller padding
    elevation: 1,  // Reduced elevation for a flatter design
  },
  question: {
    fontSize: 11,  // Smaller text size for the question
    marginBottom: 5,  // Reduced space between question and input
  },
  input: {
    marginBottom: 2,  // Reduced margin for compactness
    fontSize: 10,      // Smaller font size
    height: 30,        // Reduced height for the input field
    paddingHorizontal: 8, // Reduced horizontal padding
    paddingVertical: 4,   // Reduced vertical padding
  },
  pickerContainer: {
    marginBottom: 2,
  },
  dropdownStyle: {
    zIndex: 9999, // Ensure the dropdown has a high stacking order
    position: 'relative', // Positioning the dropdown properly
  },

  dropdownContainerStyle: {
    zIndex: 9999, // Same for the dropdown container
    position: 'absolute', // Ensure it appears above other components
  },
  accordionContainer: {
    marginBottom: 2,  // Reduced margin
  },
  accordionButton: {
    paddingVertical: 4,  // Smaller button height
  },
  accordionButtonLabel: {
    fontSize: 11,  // Smaller label for accordion button
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 2,  // Reduced margin
  },
  imageText: {
    textAlign: 'center',
    marginBottom: 6,  // Reduced bottom margin
    fontSize: 11,  // Smaller text size
  },
  imagePreview: {
    width: 80,  // Reduced image preview size
    height: 80,  // Reduced image preview size
    borderRadius: 8,
    marginBottom: 6,  // Reduced margin
  },
  uploadButton: {
    marginTop: 4,  // Reduced top margin
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
