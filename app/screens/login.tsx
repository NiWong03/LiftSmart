import { createPlanStyles } from '@/components/plans/styles';
import { FIREBASE_AUTH } from '@/firebaseAuth/FirebaseConfig';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View, } from 'react-native';
import { ActivityIndicator, Avatar, Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';


const Login = () => {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const auth = FIREBASE_AUTH;

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (user) {
        // User is signed in, redirect to main app
        router.replace('/(tabs)');
      }
    });

    return unsubscribe; // Cleanup subscription
  }, [auth]);



  const handleLogin = async () => {
    setLoading(true);
    try{
        const response = await signInWithEmailAndPassword( auth, email, password);
        console.log(response);
    } catch (error) {
        console.log(error);
        alert('No log in for u\n Incorrect email or password');
    } finally {
        setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try{
        const response = await createUserWithEmailAndPassword(auth, email, password);
        console.log(response);
        alert('user created');
    } catch (error) {
        console.log(error);
        alert('No sign up for u:\n ' + error);
        
    } finally {
        setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try{
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent');
    } catch (error) {
        console.log(error);
        alert('No reset password for u\n ' + error);
    } finally {
        setLoading(false);
    }
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.surfaceVariantText, { marginTop: 16 }]}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
            <View style={styles.content}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
                <Avatar.Icon 
                size={80} 
                icon="dumbbell" 
                style={{ backgroundColor: theme.colors.primary, marginBottom: 16 }} 
                />
                <Text variant="displaySmall" style={[styles.primaryText, { textAlign: 'center' }]}>
                GymReact
                </Text>
                <Text variant="bodyLarge" style={[styles.surfaceVariantText, { textAlign: 'center', marginTop: 8 }]}>
                Welcome to GymReact!
                </Text>
            </View>

            <Surface style={[styles.planOverviewContainer]} elevation={2}>

                <Text variant="titleLarge" style={[styles.primaryText, { textAlign: 'center', marginBottom: 24 }]}>
                Log In
                </Text>
                
                <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={{ marginBottom: 16 }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                />
                
                <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={{ marginBottom: 24 }}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={<TextInput.Icon icon={showPassword ? "eye" : "eye-off"} onPress={() => setShowPassword(!showPassword)} />}
                left={<TextInput.Icon icon="lock" />}
                />
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : (
                    <>
                    <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.primaryButton}
                    contentStyle={styles.submitButtonContent}
                    >
                    Log In
                    </Button>

                    <Button
                    mode="outlined"
                    onPress={handleSignUp}
                    style={[styles.secondaryButton, { marginTop: 12 }]}
                    >
                    Sign Up
                    </Button>

                    <Button
                    mode="outlined"
                    onPress={handleResetPassword}
                    style={[styles.secondaryButton, { marginTop: 12,  }]}
                    >
                    Reset Password
                    </Button>
                    </>
                    
                )}
            </Surface>
            </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Login;