import { createPlanStyles } from '@/components/plans/styles';
import { FIREBASE_AUTH } from '@/firebaseAuth/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View, } from 'react-native';
import { ActivityIndicator, Avatar, Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';


const Login = () => {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = FIREBASE_AUTH



  const handleLogin = async () => {
    setLoading(true);
    try{
        const response = await signInWithEmailAndPassword( auth, email, password);
        console.log(response);
    } catch (error) {
        console.log(error);
        alert('No log in for u ');
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
        alert('No sign up for u');
        
    } finally {
        setLoading(false);
    }
  };

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