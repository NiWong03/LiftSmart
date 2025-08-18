import { FIREBASE_AUTH } from '@/firebaseAuth/FirebaseConfig';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);

const handleSignOut = async () => {
  await signOut(FIREBASE_AUTH);
  console.log('signed out');
}

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">
        Hello {user?.email}
      </Text>
      <Button style={{ marginTop: 20, outlineColor: '#10B981', outlineWidth: 1, borderRadius: 10 }} onPress={handleSignOut}>Sign Out</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Settings;