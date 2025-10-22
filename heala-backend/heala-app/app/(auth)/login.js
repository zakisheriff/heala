import CustomAlert from "@/components/CustomAlert";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      setAlertMessage("Please enter Email and Password.  ");
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.navigate("(tabs)");
      })
      .catch(() => {
        setAlertMessage("Email or Password is incorrect.  ");
        setAlertVisible(true);
      })
      .finally(() => setLoading(false));
  };

  const handleSignUp = () => {
    router.navigate("/register");
  };

  const handleRecover = () => {
    router.navigate("/recover");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <View style={styles.glassCard}>
        <Text style={styles.title}>Sign In</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={22} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.forgotPassword} onPress={handleRecover}>
          <Text style={styles.linkText}>Forgot Email or Password? </Text>
        </TouchableOpacity>
        
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 30,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
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
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: '#000',
    borderRadius: 10,
    padding: 16,
    paddingRight: 50,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 2,
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  forgotPassword: {
    marginTop: 20,
    alignSelf: 'center',
  },
  linkText: {
    color: '#0a84ff',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dividerText: {
    color: '#8e8e93',
    paddingHorizontal: 15,
    fontSize: 15,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  signupText: {
    color: '#8e8e93',
    fontSize: 14,
  },
  signupLink: {
    color: '#0a84ff',
    fontSize: 14,
    fontWeight: '600',
  },
});