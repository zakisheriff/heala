import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="get-started"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="recover"
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="register"
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="details"
          options={{ headerShown: false }}
        />

      </Stack>
      <StatusBar style="auto" />

    </ThemeProvider>
  );
}
