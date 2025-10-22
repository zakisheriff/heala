import CustomAlert from "@/components/CustomAlert";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import auth from "../firebaseConfig";

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      setAlertMessage("Please enter your email address.");
      setAlertVisible(true);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage("Please enter a valid email address.");
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setEmailSent(true);
        setAlertMessage("Password reset email sent! Check your inbox.");
        setAlertVisible(true);
      })
      .catch((error) => {
        if (error.code === "auth/user-not-found") {
          setAlertMessage("No account found with this email.");
        } else {
          setAlertMessage("Failed to send reset email. Please try again.");
        }
        setAlertVisible(true);
      })
      .finally(() => setLoading(false));
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.glassCard}>
        <Text style={styles.title}>Reset Password</Text>
        
        {!emailSent ? (
          <>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleResetPassword} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>
              Check your email for a link to reset your password.
            </Text>
            <Text style={styles.successSubtext}>
              If it doesn't appear within a few minutes, check your spam folder.
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToLogin}
        >
          <Text style={styles.backButtonText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: 20,
  },
  glassCard: {
    width: '90%',
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
    marginBottom: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8e8e93',
    fontSize: 15,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: '#000',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  button: {
    backgroundColor: '#9cafcb',
    width: '100%',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#9cafcb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 60,
    color: '#34c759',
    marginBottom: 20,
  },
  successText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  successSubtext: {
    color: '#8e8e93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#0a84ff',
    fontSize: 15,
    fontWeight: '600',
  },
});