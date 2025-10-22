import CustomAlert from "@/components/CustomAlert";
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import auth, { db } from '../firebaseConfig';

export default function MedicalDetails() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [physician, setPhysician] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async () => {
    if (!bloodGroup || !allergies || !medications || !physician || !emergencyContact) {
      setAlertMessage("Please fill in all fields.");
      setAlertVisible(true);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setAlertMessage("No user logged in.");
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    try {
      // Save medical details to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        bloodGroup,
        allergies,
        medications,
        physician,
        emergencyContact,
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge: true ensures we don't overwrite existing data

      setAlertMessage("Medical details saved successfully!");
      setAlertVisible(true);
      
      // Navigate after a short delay
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (error) {
      console.error("Error saving medical details:", error);
      setAlertMessage(`Error: ${error.message}`);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f5f5f7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.glassCard}>
            <Text style={styles.title}>Medical Details</Text>
            <Text style={styles.subtitle}>Help us provide better care</Text>
            
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowBloodGroupPicker(true)}
            >
              <Text style={[styles.inputText, !bloodGroup && styles.placeholder]}>
                {bloodGroup || 'Blood Group'}
              </Text>
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Allergies / Chronic Conditions"
              placeholderTextColor="#666"
              value={allergies}
              onChangeText={setAllergies}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Current Medications"
              placeholderTextColor="#666"
              value={medications}
              onChangeText={setMedications}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Primary Physician / Clinic Info"
              placeholderTextColor="#666"
              value={physician}
              onChangeText={setPhysician}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Emergency Contact (Name & Phone)"
              placeholderTextColor="#666"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Save Details</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Blood Group Picker Modal */}
        <Modal
          visible={showBloodGroupPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Blood Group</Text>
              
              <View style={styles.bloodGroupGrid}>
                {bloodGroups.map(bg => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodGroupOption, bloodGroup === bg && styles.bloodGroupOptionSelected]}
                    onPress={() => {
                      setBloodGroup(bg);
                      setShowBloodGroupPicker(false);
                    }}
                  >
                    <Text style={[styles.bloodGroupText, bloodGroup === bg && styles.bloodGroupTextSelected]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowBloodGroupPicker(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  glassCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  title: {
    color: '#000',
    fontSize: 32,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8e8e93',
    fontSize: 15,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: '#000',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    fontSize: 17,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  inputText: {
    color: '#000',
    fontSize: 17,
  },
  placeholder: {
    color: '#666',
  },
  button: {
    backgroundColor: '#9cafcb',
    width: '100%',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#9cafcb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  skipButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  skipText: {
    color: '#0a84ff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bloodGroupOption: {
    width: '23%',
    padding: 16,
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  bloodGroupOptionSelected: {
    backgroundColor: '#0a84ff',
  },
  bloodGroupText: {
    fontSize: 17,
    color: '#000',
    fontWeight: '600',
  },
  bloodGroupTextSelected: {
    color: '#fff',
  },
  modalCancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelButtonText: {
    color: '#9cafcb',
    fontSize: 17,
    fontWeight: '600',
  }
});