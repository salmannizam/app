import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from 'react-native-modal';
import SurveyDetailsStyles  from '../styles/SurveyDetailsStyle';
import Toast from 'react-native-toast-message';
import { submitPreSurveyDetails } from '../services/api'; // Import your validateProjectId API

const SurveyDetailsScreen = ({ route, navigation }: any) => {
  const { projectId, surveyId } = route.params;

  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [outletName, setOutletName] = useState('');
  const [startZone, setStartZone] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Handle zone selection
  const handleZoneSelect = (zone: string) => {
    setStartZone(zone);
    setIsModalVisible(false); // Close modal after selection
  };

  const getCurrentTimeFormatted = () => {
    const now = new Date();
  
    // Get the individual components of the date
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    // Format it into the desired string
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  // Handle submit logic
  const handleSubmit = async () => {
    navigation.navigate('Questionnaire', { projectId, surveyId });
    // Validate if required fields are filled
    if (projectId && surveyId && address && country && location && outletName && startZone) {
      try {
        // Call the submitPreSurveyDetails API with the form data
        const surveyData = { projectId, surveyId, address, country, location, outletName, startZone };
        const response = await submitPreSurveyDetails(surveyData);

        if (response.data.status == "success") {
          // Navigate to the 'Questionnaire' screen if submission is successful
          const ResultID = getCurrentTimeFormatted();

          const generatedSurveyID = `S${ResultID}`

          navigation.navigate('Questionnaire', { projectId, surveyId,generatedSurveyID ,ResultID});
        } else {
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Submission Failed',
            text2: 'Please try again later.',
            visibilityTime: 3000,
          });
        }
      } catch (err) {
        console.error(err);
        // Show error toast if the API call fails
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Submission Failed',
          text2: 'An error occurred. Please try again.',
          visibilityTime: 3000,
        });
      }
    } else {
      // Show toast for missing fields
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Missing Fields',
        text2: 'Please fill all the fields.',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={SurveyDetailsStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={SurveyDetailsStyles.formContainer}>
        <Text style={SurveyDetailsStyles.title}>Pre-Survey Information</Text>

        {/* Input Fields */}
        <View style={SurveyDetailsStyles.inputContainer}>
          <Text style={SurveyDetailsStyles.label}>Address</Text>
          <TextInput
            style={SurveyDetailsStyles.input}
            placeholder="Enter Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={SurveyDetailsStyles.inputContainer}>
          <Text style={SurveyDetailsStyles.label}>Country</Text>
          <TextInput
            style={SurveyDetailsStyles.input}
            placeholder="Enter Country"
            value={country}
            onChangeText={setCountry}
          />
        </View>

        <View style={SurveyDetailsStyles.inputContainer}>
          <Text style={SurveyDetailsStyles.label}>Location</Text>
          <TextInput
            style={SurveyDetailsStyles.input}
            placeholder="Enter Location"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={SurveyDetailsStyles.inputContainer}>
          <Text style={SurveyDetailsStyles.label}>Outlet Name</Text>
          <TextInput
            style={SurveyDetailsStyles.input}
            placeholder="Enter Outlet Name"
            value={outletName}
            onChangeText={setOutletName}
          />
        </View>

        {/* Zone Selection Button */}
        <TouchableOpacity style={SurveyDetailsStyles.zoneButton} onPress={() => setIsModalVisible(true)}>
          <Text style={SurveyDetailsStyles.zoneButtonText}>
            {startZone || 'Select Zone'}
          </Text>
        </TouchableOpacity>


        {/* Modal for Zone Selection */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)} // Close modal when tapping outside
          style={SurveyDetailsStyles.modal}
        >
          <View style={SurveyDetailsStyles.modalContent}>
            <Text style={SurveyDetailsStyles.modalTitle}>Select Zone</Text>
            {['East', 'West', 'South', 'North'].map(zone => (
              <TouchableOpacity
                key={zone}
                style={SurveyDetailsStyles.modalOption}
                onPress={() => handleZoneSelect(zone)}
              >
                <Text style={SurveyDetailsStyles.modalOptionText}>{zone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>

        {/* Previous and Next Buttons */}
        <View style={SurveyDetailsStyles.buttonContainer}>
          <TouchableOpacity style={SurveyDetailsStyles.prevButton} onPress={() => navigation.goBack()}>
            <Text style={SurveyDetailsStyles.submitButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={SurveyDetailsStyles.nextButton} onPress={handleSubmit}>
            <Text style={SurveyDetailsStyles.submitButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};



export default SurveyDetailsScreen;
