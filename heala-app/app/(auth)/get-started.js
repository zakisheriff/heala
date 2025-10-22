import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import auth from '../firebaseConfig';

export default function GetStarted() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.navigate('/register');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('(tabs)');
      } else {
        setCheckingAuth(false);
      }
    });

    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <Image
            source={require('@/assets/images/heala-app-use.png')}
            style={styles.logo}
          />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/heala-app-use.png')}
            style={styles.logo}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
          <Text style={styles.primaryButtonText}>Log in</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
          <Text style={styles.secondaryButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',

  },
  logo: {
    marginTop: 100,
    width: 100,
    height: 100,
    fontSize: 72,
    fontWeight: '700',
    color: '#0a84ff8f',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Helvetica Bold',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#000',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.3,
  },
});