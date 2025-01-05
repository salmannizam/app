import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from 'react-native-modal';

const SurveyDetailsScreen = ({ route, navigation }: any) => {
  const { productId, surveyId } = route.params;

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

  // Handle submit logic
  const handleSubmit = () => {
    navigation.navigate('Questionnaire', { productId, surveyId });
    
    fetch('https://api.example.com/submitPreSurvey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, surveyId, address, country, location, outletName, startZone }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          navigation.navigate('Questionnaire', { productId, surveyId });
        } else {
          Alert.alert('Submission Failed', 'Please try again later.');
        }
      })
      .catch(err => Alert.alert('Error', 'An error occurred. Please try again.'));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Pre-Survey Information</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Country"
            value={country}
            onChangeText={setCountry}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Location"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Outlet Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Outlet Name"
            value={outletName}
            onChangeText={setOutletName}
          />
        </View>

        {/* Zone Selection Button */}
        <TouchableOpacity style={styles.zoneButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.zoneButtonText}>
            {startZone || 'Select Zone'}
          </Text>
        </TouchableOpacity>


        {/* Modal for Zone Selection */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)} // Close modal when tapping outside
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Zone</Text>
            {['East', 'West', 'South', 'North'].map(zone => (
              <TouchableOpacity
                key={zone}
                style={styles.modalOption}
                onPress={() => handleZoneSelect(zone)}
              >
                <Text style={styles.modalOptionText}>{zone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>

        {/* Previous and Next Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.prevButton} onPress={() => navigation.goBack()}>
            <Text style={styles.submitButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    width: '90%',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  zoneButton: {
    height: 45,
    width: '90%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  zoneButtonText: {
    fontSize: 14,
    color: '#777',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  prevButton: {
    width: '45%',
    height: 40,
    backgroundColor: '#FF6F61',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: '45%',
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SurveyDetailsScreen;
