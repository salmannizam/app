import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button, Card, TextInput, Snackbar } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import Modal from 'react-native-modal'; // Import react-native-modal

const QuestionnaireScreen = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [imageUris, setImageUris] = useState<{ [key: number]: string | null }>({}); // Track image per question
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null); // Track only the currently open dropdown ID
  const [openAccordion, setOpenAccordion] = useState<{ [key: number]: boolean }>({}); // Track accordion state for image upload
  const [showImageUploads, setShowImageUploads] = useState(false); // Track whether to show image upload questions

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

    // Special case: If question ID is 10033172 and answer is "yes", show image upload questions
    if (questionId === 10033172 && answer === 'yes') {
      setShowImageUploads(true);
    } else if (questionId === 10033172 && answer === 'no') {
      setShowImageUploads(false);
    }
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

  const renderRegularQuestions = (question: any) => {
    return (
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
            <View>
              <TouchableOpacity
                key={`dropdown-${question.QuestionID}`}  // Unique key here
                onPress={() => setOpenDropdown(question.QuestionID)}
                style={styles.dropdownButton}
              >
                <Text>{answers.find(a => a.QuestionID === question.QuestionID)?.answer || 'Select an option'}</Text>
              </TouchableOpacity>

              {/* Modal for Single Choice */}
              <Modal
                isVisible={openDropdown === question.QuestionID}
                onBackdropPress={() => setOpenDropdown(null)}
                onBackButtonPress={() => setOpenDropdown(null)} // Close on back button press
                onSwipeComplete={() => setOpenDropdown(null)}
                swipeDirection="down"
                style={styles.modal}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>Select an Option</Text>
                  {question.Choices.map((choice, index) => (
                    <TouchableOpacity
                      key={`choice-${choice.ChoiceID || index}`}   // Unique key for each choice
                      style={styles.modalItem}
                      onPress={() => {
                        handleAnswerChange(question.QuestionID, choice.ChoiceText);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={styles.modalItemText}>{choice.ChoiceText}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Modal>
            </View>
          )}

          {question.Questiontype === 'Matrix' && question.Matrixtype === 'Drop Down' && question.Choices && (
            <View>
              <TouchableOpacity
                key={`dropdown-${question.QuestionID}`}  // Unique key here
                onPress={() => setOpenDropdown(question.QuestionID)}
                style={styles.dropdownButton}
              >
                <Text>{answers.find(a => a.QuestionID === question.QuestionID)?.answer || 'Select an option'}</Text>
              </TouchableOpacity>

              {/* Modal for Matrix Drop Down */}
              <Modal
                isVisible={openDropdown === question.QuestionID}
                onBackdropPress={() => setOpenDropdown(null)}
                onBackButtonPress={() => setOpenDropdown(null)} // Close on back button press
                onSwipeComplete={() => setOpenDropdown(null)}
                swipeDirection="down"
                style={styles.modal}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>Select an Option</Text>
                  {question.Choices.map((choice, index) => (
                    <TouchableOpacity
                      key={`choice-${choice.ChoiceID || index}`}
                      style={styles.modalItem}
                      onPress={() => {
                        handleAnswerChange(question.QuestionID, choice.ChoiceText);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={styles.modalItemText}>{choice.ChoiceText}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Modal>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderImageUploadQuestions = (question: any) => {
    return (
      <Card key={question.QuestionID} style={styles.card}>
        <Card.Content>
          <Text style={styles.question}>{question.Question}</Text>

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
                    <Image
                      source={{ uri: imageUris[question.QuestionID] || undefined }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <Text style={styles.imageText}>No image selected</Text>
                  )}

                  <Button
                    key={`upload-${question.QuestionID}`} // Unique key here
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
  };

  // Separate image-upload and regular questions
  const regularQuestions = questions.filter(q => q.Questiontype !== 'Image');
  const imageUploadQuestions = questions.filter(q => q.Questiontype === 'Image' && showImageUploads);

  // Merge the regular questions first and then the image-upload questions
  const filteredQuestions = [...regularQuestions, ...imageUploadQuestions];

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredQuestions} // Combine regular and image-upload questions, with image uploads at the end
        renderItem={({ item }) => {
          if (item.Questiontype === 'Image') {
            return renderImageUploadQuestions(item); // Render image-upload question
          } else {
            return renderRegularQuestions(item); // Render regular question
          }
        }}
        keyExtractor={(item) => item.QuestionID.toString()}
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
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
    fontSize: 12,
    marginBottom: 5,
  },
  input: {
    marginBottom: 2,
    fontSize: 10,
    height: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dropdownButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 14,
    color: '#333',
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
