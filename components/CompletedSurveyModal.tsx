import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';

const SurveyModal = ({ visible, onClose, surveys, questions }) => {
  const [openAccordionIndex, setOpenAccordionIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordionIndex(openAccordionIndex === index ? null : index);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          <FlatList
            data={surveys}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: survey, index }) => (
              <View style={styles.accordionContainer}>
                <TouchableOpacity onPress={() => toggleAccordion(index)} style={styles.accordionButton}>
                  <Text style={styles.accordionButtonLabel}>Survey {index + 1}</Text>
                </TouchableOpacity>

                <Collapsible collapsed={openAccordionIndex !== index}>
                  <View style={styles.tableContainer}>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>Question</Text>
                      <Text style={styles.tableCell}>Answer</Text>
                    </View>
                    {survey.answers.map((answer) => {
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
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const sampleQuestions = [
    { QuestionID: 1, Question: 'What is your favorite color?' },
    { QuestionID: 2, Question: 'Do you like React Native?' }
  ];

  const sampleSurveys = [
    { answers: [{ QuestionID: 1, answer: 'Blue' }, { QuestionID: 2, answer: 'Yes' }] },
    { answers: [{ QuestionID: 1, answer: 'Red' }, { QuestionID: 2, answer: 'No' }] }
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.openButton}>
        <Text style={styles.openButtonText}>Show Submitted Surveys</Text>
      </TouchableOpacity>
      <SurveyModal visible={modalVisible} onClose={() => setModalVisible(false)} surveys={sampleSurveys} questions={sampleQuestions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  openButton: { padding: 10, backgroundColor: 'blue', borderRadius: 5 },
  openButtonText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%', maxHeight: '80%' },
  closeButton: { alignSelf: 'flex-end', padding: 5 },
  closeButtonText: { fontWeight: 'bold', color: 'red' },
  accordionContainer: { marginTop: 10, borderWidth: 1, borderRadius: 5, padding: 10 },
  accordionButton: { padding: 10, backgroundColor: '#ddd', borderRadius: 5 },
  accordionButtonLabel: { fontWeight: 'bold' },
  tableContainer: { marginTop: 10 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5, borderBottomWidth: 1 },
  tableCell: { flex: 1, textAlign: 'center' }
});

export default App;
