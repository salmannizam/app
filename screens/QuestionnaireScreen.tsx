import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button, Card, TextInput, Snackbar } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import Modal from 'react-native-modal'; // Import react-native-modal
import Toast from 'react-native-toast-message';
import Collapsible from 'react-native-collapsible'; // Add this import for collapsible functionality
import { getCurrentDateTime } from '../services/dateUtils';
import * as Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';
import { submitPreSurveyDetails } from '../services/api';
import RightSidebar from '../components/RightSidebar';

interface Answer {
  QuestionID: number;
  answer: string;
}

interface Survey {
  answers: Answer[];
}

const QuestionnaireScreen = ({ route, navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [imageUris, setImageUris] = useState<{ [key: number]: string | null }>({}); // Track image per question
  const [openDropdown, setOpenDropdown] = useState<number | null>(null); // Track only the currently open dropdown ID
  const [openAccordion, setOpenAccordion] = useState<{ [key: number]: boolean }>({}); // Track accordion state for image upload
  const [showImageUploads, setShowImageUploads] = useState(false); // Track whether to show image upload questions
  const [completedSurveys, setCompletedSurveys] = useState<any[]>([]);

  const [openAccordionSurveys, setOpenAccordionSurveys] = useState<number | null>(null);  // For Completed Surveys

  const { ProjectId, outletName, Location, Address, Zone, country, state, StartDate, StartTime } = route.params;
  useEffect(() => {
    const questionsData = require('../assets/questions.json');

    // Sorting questions by QuestionID in ascending order
    const sortedQuestions = questionsData.sort((a, b) => a.QuestionID - b.QuestionID);
    // Setting the sorted questions to state
    setQuestions(sortedQuestions);
  }, []);

  const getPersistentDeviceId = async () => {
    let deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      // Generate a device ID based on platform-specific properties
      if (Device.osName === 'iOS') {
        const iosIdForVendor = await Application.getIosIdForVendorAsync();
        deviceId = iosIdForVendor;
      } else if (Device.osName === 'Android') {
        deviceId = await Application.getAndroidId();
      } else {
        // Fallback for other platforms
        deviceId = `device-${Math.random().toString(36).substring(7)}`;
      }
    }
    // Type assertion to tell TypeScript that deviceId will be a string here
    await SecureStore.setItemAsync('deviceId', deviceId as string);
    return deviceId || ''; // Ensure a fallback string if null
  };

  // Convert URI to Blob using fetch
  const createBlobFromUri = async (uri: string, questionId: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert the blob into a File (you can assign the name dynamically)
      const file = new File([blob], `image_${questionId}.jpg`, { type: 'image/jpeg' });

      return file;
    } catch (error) {
      console.error("Error converting URI to Blob:", error);
      return null;
    }
  };


  const createBase64FromUri = async (uri: string, questionId: string) => {
    try {
      // Use FileSystem to get the base64 encoded image from the URI
      const base64String = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      return base64String;
    } catch (error) {
      console.error("Error converting URI to Base64:", error);
      return null;
    }
  };



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


  const handleSubmitSurvey = async () => {
    setLoading(true);
    const mandatoryQuestions = questions.filter(q => q.Mandatory === "Yes");

    const missingAnswers = mandatoryQuestions.some(q =>
      !answers.find(a => a.QuestionID === q.QuestionID)?.answer
    );

    if (missingAnswers) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'Please answer all mandatory questions before submitting.',
        visibilityTime: 3000,
      });
      setLoading(false);
      return;
    }

    const { FullDateTime, date, time } = getCurrentDateTime();
    const deviceId = await getPersistentDeviceId();
    console.log("Device ID:", deviceId);  // This will now correctly log the device ID
    const ResultID = FullDateTime;
    const generatedSurveyID = `S${ResultID}`

    const formattedSurvey = answers.map((answer) => {
      // Find the corresponding question by QuestionID
      const question = questions.find((q) => q.QuestionID === answer.QuestionID);

      return {
        SurveyID: generatedSurveyID || "",  // Replace with dynamic data if needed
        ResultID: ResultID,
        QuestionID: answer.QuestionID,
        AnswerID: question?.Choices
          ? (() => {
            const choiceIndex = question.Choices.findIndex(choice => choice.ChoiceText === answer.answer);
            return choiceIndex !== -1 ? `${answer.QuestionID}-${choiceIndex + 1}` : '0';
          })()
          : '0', // For questions without options (User Input)
        AnswerText: answer.answer || "",
        Location: "", // Replace with dynamic data if needed
        Remarks: "",
        DeviceID: deviceId || "",  // Replace with dynamic data if needed
        ProjectId: ProjectId || "",  // Replace with dynamic data if needed
      };
    });


    const PreSurveyDetails = {
      SurveyID: generatedSurveyID,
      ResultID: ResultID,
      "Outlet Name": outletName,
      State: state,
      // country: country,
      Location: Location,
      Address: Address,
      Zone: Zone,
      StartDate: StartDate,
      StartTime: StartTime,
      EndDate: date,
      EndTime: time,
      ProjectId: ProjectId,
    };

    // Prepare the JSON data (including base64 images)
    const surveyData: any = {
      ProjectId: ProjectId,
      PreSurveyDetails,
      answeredQuestions: formattedSurvey,
    };

    // Collect images
    const allImages = {};
    const imageUrisExist = Object.keys(imageUris).length > 0;
    const question10033172Answer = answers.find((a) => a.QuestionID === 10033172)?.answer;


    if (imageUrisExist && question10033172Answer === 'yes') {
      const imagePromises = Object.keys(imageUris).map(async (questionId) => {
        const uri = imageUris[questionId];
        const base64Image = await createBase64FromUri(uri, questionId);
        if (base64Image) {
          allImages[questionId] = base64Image;
        }
      });

      await Promise.all(imagePromises);
      surveyData.images = allImages
    }

    console.log(surveyData)

    // Submit the survey data to the server using axios
    try {
      const response = await submitPreSurveyDetails(surveyData);  // Pass FormData here
      if (response.data.status === "success") {
        console.log('Survey submitted successfully:', response.data);
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Survey Submitted',
          text2: 'Your answers have been successfully submitted.',
          visibilityTime: 3000,
        });

        // setAnswers([]);  // Clear the answers array
        // setImageUris({}); // Clear the image URIs
        // setShowImageUploads(false);  // Hide image upload questions
        // setOpenAccordion({});  // Reset accordion state

      } else {
        console.error('Error submitting survey:', response.data.message);
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error Submitting Survey',
          text2: 'An error occurred while submitting your answers.',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error Submitting Survey',
        text2: 'An error occurred while submitting your answers.',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }


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

  const toggleAccordion = (surveyIndex: number) => {
    setOpenAccordionSurveys(prevState => prevState === surveyIndex ? null : surveyIndex);
  };

  const renderCompletedSurvey = (survey: Survey, surveyIndex: number) => {
    console.log("survey", survey)
    // Ensure survey is typed correctly
    return (
      <View style={styles.accordionContainer} key={surveyIndex}>
        <TouchableOpacity onPress={() => toggleAccordion(surveyIndex)} style={styles.accordionButton}>
          <Text style={styles.accordionButtonLabel}>Survey {surveyIndex + 1}</Text>
        </TouchableOpacity>

        <Collapsible collapsed={openAccordionSurveys !== surveyIndex}>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Question</Text>
              <Text style={styles.tableCell}>Answer</Text>
            </View>

            {/* Table Rows: Loop over answers */}
            {survey.answers.map((answer: Answer) => {
              const question = questions.find((q) => q.QuestionID === answer.QuestionID);
              return (
                <View key={answer.QuestionID} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{question?.Question || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{answer.answer || 'N/A'}</Text>
                </View>
              );
            })}
          </View>
        </Collapsible>
      </View>
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
            {/* <Button mode="outlined" onPress={} style={styles.addMoreButton} color="#5bc0de">
              Back
            </Button> */}

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

      {/* Completed Surveys Accordion */}
      {completedSurveys.length > 0 && (
        <View style={styles.completedSurveysContainer}>
          <Text style={styles.completedSurveysTitle}>Added Surveys</Text>
          {completedSurveys.map((survey, index) => renderCompletedSurvey(survey[0], index))}  {/* Accessing survey[0] */}
        </View>
      )}
      <RightSidebar surveys={completedSurveys} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  addMoreButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'blue',
  },
  submitButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#4CAF50',
  },
  completedSurveysContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 20,
  },

  completedSurveysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },

  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    backgroundColor: '#fff',
  },
  tableContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  tableCellLast: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: '#fff',
  },

});


export default QuestionnaireScreen;
