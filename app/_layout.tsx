import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

const emeraldColors = {
  light: {
    // (Green theme)
    primary: '#10B981', // Soft emerald green
    onPrimary: '#FFFFFF',
    primaryContainer: '#D1FAE5',
    onPrimaryContainer: '#064E3B',
    
    // Secondary teal palette
    secondary: '#14B8A6', // Teal accent
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CCFBF1',
    onSecondaryContainer: '#042F2E',
    
    // Tertiary sage palette
    tertiary: '#84CC16', // Sage green
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#F7FEE7',
    onTertiaryContainer: '#365314',
    
    // Surface and background
    surface: '#FAFAFA',
    onSurface: '#1F2937',
    surfaceVariant: '#F3F4F6',
    onSurfaceVariant: '#6B7280',
    background: '#FFFFFF',
    onBackground: '#1F2937',
    
    // Additional colors
    error: '#EF4444',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#7F1D1D',
    
    warning: '#F59E0B',
    onWarning: '#FFFFFF',
    warningContainer: '#FEF3C7',
    onWarningContainer: '#92400E',
    
    success: '#10B981',
    onSuccess: '#FFFFFF',
    successContainer: '#D1FAE5',
    onSuccessContainer: '#064E3B',
    
    info: '#3B82F6',
    onInfo: '#FFFFFF',
    infoContainer: '#DBEAFE',
    onInfoContainer: '#1E40AF',
    
    // Outline and borders
    outline: '#E5E7EB',
    outlineVariant: '#F3F4F6',
    
    // Special colors for gym app
    accent: '#34D399', // Bright emerald
    surfaceBright: '#FFFFFF',
    surfaceDim: '#F9FAFB',
  },
  
  dark: {
    // Primary emerald palette (darker)
    primary: '#34D399', // Brighter emerald for dark mode
    onPrimary: '#000000',
    primaryContainer: '#065F46',
    onPrimaryContainer: '#D1FAE5',
    
    // Secondary teal palette
    secondary: '#5EEAD4', // Bright teal
    onSecondary: '#000000',
    secondaryContainer: '#134E4A',
    onSecondaryContainer: '#CCFBF1',
    
    // Tertiary sage palette
    tertiary: '#A3E635', // Bright sage
    onTertiary: '#000000',
    tertiaryContainer: '#3F6212',
    onTertiaryContainer: '#F7FEE7',
    
    // Surface and background
    surface: '#111827',
    onSurface: '#F9FAFB',
    surfaceVariant: '#1F2937',
    onSurfaceVariant: '#D1D5DB',
    background: '#0F172A',
    onBackground: '#F9FAFB',
    
    // Additional colors
    error: '#F87171',
    onError: '#000000',
    errorContainer: '#7F1D1D',
    onErrorContainer: '#FEE2E2',
    
    warning: '#FBBF24',
    onWarning: '#000000',
    warningContainer: '#92400E',
    onWarningContainer: '#FEF3C7',
    
    success: '#34D399',
    onSuccess: '#000000',
    successContainer: '#065F46',
    onSuccessContainer: '#D1FAE5',
    
    info: '#60A5FA',
    onInfo: '#000000',
    infoContainer: '#1E40AF',
    onInfoContainer: '#DBEAFE',
    
    // Outline and borders
    outline: '#374151',
    outlineVariant: '#4B5563',
    
    // Special colors for gym app
    accent: '#6EE7B7', // Bright emerald accent
    surfaceBright: '#1F2937',
    surfaceDim: '#111827',
  },
};

// Create light theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...emeraldColors.light,
  },
  // Custom theme properties
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

// Create dark theme
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...emeraldColors.dark,
  },
  // Custom theme properties
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

// Helper function to get theme based on color scheme
const getTheme = (colorScheme: 'light' | 'dark') => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export default function RootLayout() {
  const colorScheme = useColorScheme() || 'light';
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Get the sophisticated emerald theme based on color scheme
  const paperTheme = getTheme(colorScheme);

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
