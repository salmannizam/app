import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from 'react-native-modal';
import SurveyDetailsStyles from '../styles/SurveyDetailsStyle';
import Toast from 'react-native-toast-message';
import { getResultId, submitPreSurveyDetails } from '../services/api'; // Import your validateProjectId API
import { getCurrentDateTime } from '../services/dateUtils';

const SurveyDetailsScreen = ({ route, navigation }: any) => {
  const { ProjectId, surveyId } = route.params;

  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('IN');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [outletName, setOutletName] = useState('');
  const [startZone, setStartZone] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Handle zone selection
  const handleZoneSelect = (zone: string) => {
    setStartZone(zone);
    setIsModalVisible(false); // Close modal after selection
  };



  // Handle submit logic
  const handleSubmit = async () => {
    // navigation.navigate('Questionnaire', { ProjectId, surveyId });
    // Validate if required fields are filled
    if (ProjectId && surveyId && address && country && location && outletName && startZone) {
      try {

        const response = await getResultId(ProjectId, surveyId, outletName);
        if (response.data.status === "success") {
          // console.log(response.data.data)
          // Call the submitPreSurveyDetails API with the form data
          const { FullDateTime, time, date } = getCurrentDateTime();
          const ResultID = (response.data.data.resultId) ? response.data.data.resultId : FullDateTime
          const surveyData = { ProjectId: ProjectId, SurveyID:surveyId, ResultID, outletName: outletName, state, Location: location, Address: address, Zone: startZone, country, StartDate: date, StartTime: time };
          navigation.navigate('Questionnaire', surveyData);

        } else {
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Something went wrong',
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

        {/* Input Fields */}
        <View style={SurveyDetailsStyles.inputContainer}>
          <Text style={SurveyDetailsStyles.label}>State</Text>
          <TextInput
            style={SurveyDetailsStyles.input}
            placeholder="Enter State"
            value={state}
            onChangeText={setState}
          />
        </View>


        {/* <View style={SurveyDetailsStyles.inputContainer}>
          <Text style={SurveyDetailsStyles.label}>Country</Text>
          <TextInput
            style={SurveyDetailsStyles.input}
            placeholder="Enter Country"
            value={country}
            onChangeText={setCountry}
          />
        </View> */}

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
