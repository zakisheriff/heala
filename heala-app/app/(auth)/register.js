import CustomAlert from "@/components/CustomAlert";
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import auth from '../firebaseConfig';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');

  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleNext = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !dobDay ||
      !dobMonth ||
      !dobYear ||
      !username
    ) {
      setAlertMessage('Please fill in all fields.');
      setAlertVisible(true);
      return;
    }

        if (password !== confirmPassword) {
      setAlertMessage('Passwords do not match.');
      setAlertVisible(true);
      return;
    }

    if (password.length < 6) {
      setAlertMessage('Password must be at least 6 characters.');
      setAlertVisible(true);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage('Please enter a valid email address.');
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        
        // Send email verification
        return sendEmailVerification(user);
      })
      .then(() => {
        setVerificationSent(true);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          setAlertMessage('This email is already registered.');
        } else if (error.code === 'auth/invalid-email') {
          setAlertMessage('Invalid email address.');
        } else if (error.code === 'auth/weak-password') {
          setAlertMessage('Password is too weak.');
        } else {
          setAlertMessage('Failed to create account. Please try again.');
        }
        setAlertVisible(true);
      });
  };

  const handleLogin = () => {
    router.navigate('/login');
  };

  const handleContinueToDetails = () => {
    router.replace('/details');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f5f5f7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.glassCard}>
            {!verificationSent ? (
              <>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Enter your details to get started</Text>

                <TextInput 
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                />

                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#666"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#666"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />

                {/* DOB */}
                <View style={styles.dobContainer}>
                  <TextInput
                    style={[styles.input, styles.dobInput]}
                    placeholder="DD"
                    placeholderTextColor="#666"
                    value={dobDay}
                    onChangeText={(text) => {
                      const day = text.replace(/[^0-9]/g, '');
                      if (day === '') setDobDay('');
                      else if (+day > 31) setDobDay('31');
                      else setDobDay(day);
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.dobInput]}
                    placeholder="MM"
                    placeholderTextColor="#666"
                    value={dobMonth}
                    onChangeText={(text) => {
                      const month = text.replace(/[^0-9]/g, '');
                      if (month === '') setDobMonth('');
                      else if (+month > 12) setDobMonth('12');
                      else setDobMonth(month);
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.dobInput]}
                    placeholder="YYYY"
                    placeholderTextColor="#666"
                    value={dobYear}
                    onChangeText={(text) => {
                      const year = text.replace(/[^0-9]/g, '');
                      setDobYear(year);
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#666"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  secureTextEntry
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <TouchableOpacity 
                  style={[styles.button, loading && { opacity: 0.7 }]} 
                  onPress={handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={handleLogin}>
                    <Text style={styles.loginLink}>Sign in</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>📧</Text>
                <Text style={styles.successTitle}>Verify Your Email</Text>
                <Text style={styles.successText}>
                  We've sent a verification link to
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                <Text style={styles.successSubtext}>
                  You can continue setting up your profile while we verify your email.
                </Text>
                <Text style={styles.spamText}>
                  Didn't receive it? Check your spam folder.
                </Text>
                
                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleContinueToDetails}
                >
                  <Text style={styles.buttonText}>Continue Setup</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 10 },
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
    textAlign: 'center' 
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: '#000',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dobContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 0 
  },
  dobInput: { 
    flex: 1, 
    marginHorizontal: 4 
  },
  button: {
    backgroundColor: '#9cafcb',
    width: '100%',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#9cafcb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 17 
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  loginText: { 
    color: '#8e8e93', 
    fontSize: 15 
  },
  loginLink: { 
    color: '#0a84ff', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIcon: {
    fontSize: 70,
    marginBottom: 20,
  },
  successTitle: {
    color: '#000',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    color: '#0a84ff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  successSubtext: {
    color: '#8e8e93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  spamText: {
    color: '#8e8e93',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 30,
  },
});