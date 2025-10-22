// SplashScreen.js
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter(); // useRouter instead of navigation prop

  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to Login screen after 2.5 seconds
      router.replace('/get-started'); 
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/heala-app-use.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  tagline: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logo: {
  marginTop: 100,
  width: 90,
  height: 90,
  fontSize: 72,
  fontWeight: '700',
  color: '#000',
  textAlign: 'center',
  textAlignVertical: 'center',
  },
});
