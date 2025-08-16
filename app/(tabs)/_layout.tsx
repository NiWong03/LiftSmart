import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from 'react-native-paper';
import Login from '@/app/screens/login';


const BlurTabBarBackground = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.blurContainer, { borderColor: colors.primary }]}>
      {/* BlurView blurs everything behind it */}
      <BlurView
        style={styles.blurView}
        intensity={30}
        tint="light"
      />
      {/* Tab bar content renders on top of the blur */}
    </View>
  );
};


const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderTopWidth: 2,

  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
  

export default function TabLayout() {
  const { colors } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <Login onLogin={() => setIsLoggedIn(true)} />
    );
  }
  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: BlurTabBarBackground,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            paddingTop: 10,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderColor: 'black',
            shadowColor: colors.outline,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            marginBottom: 16,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          }}
        />
          <Tabs.Screen
            name="workout"
            options={{
              title: 'Workout',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.strengthtraining.traditional" color={color} />,
            }}
          />
        <Tabs.Screen
          name="plans"
          options={{
            title: 'Plans',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="dumbbell" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
  );
}
