import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseAuth/FirebaseConfig';
import { router } from 'expo-router';
import { deleteUser, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

const handleSignOut = async () => {
  await signOut(FIREBASE_AUTH);
  console.log('signed out');
}

const deleteUserData = async (userId: string) => {
  try {
    // Delete all user's plans
    const plansQuery = query(collection(FIREBASE_DB, 'plans'), where('userId', '==', userId));
    const plansSnapshot = await getDocs(plansQuery);
    const planDeletePromises = plansSnapshot.docs.map(planDoc => deleteDoc(planDoc.ref));
    await Promise.all(planDeletePromises);

    // Delete all user's workouts
    const workoutsQuery = query(collection(FIREBASE_DB, 'workouts'), where('userId', '==', userId));
    const workoutsSnapshot = await getDocs(workoutsQuery);
    const workoutDeletePromises = workoutsSnapshot.docs.map(workoutDoc => deleteDoc(workoutDoc.ref));
    await Promise.all(workoutDeletePromises);

    console.log('User data deleted successfully');
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

const handleDeleteAccount = () => {
  Alert.alert(
    'Delete Account',
    'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your workout plans, schedules, and data.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: confirmDeleteAccount,
      },
    ]
  );
};

const confirmDeleteAccount = async () => {
  if (!user) return;
  
  setIsDeleting(true);
  try {
    // First delete all user data from Firestore
    await deleteUserData(user.uid);
    
    // Then delete the user account from Firebase Auth
    await deleteUser(user);
    
    console.log('Account deleted successfully');
    Alert.alert(
      'Account Deleted', 
      'Your account and all associated data have been permanently deleted.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login screen after account deletion
            router.replace('/screens/login');
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    Alert.alert(
      'Error', 
      'Failed to delete account. Please try again or contact support if the problem persists.'
    );
  } finally {
    setIsDeleting(false);
  }
};

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Button 
        style={styles.deleteButton} 
        mode="contained"
        onPress={handleDeleteAccount}
        loading={isDeleting}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting Account...' : 'Delete Account'}
      </Button>
      
      <View style={styles.centerContent}>
        <Text variant="headlineLarge">
          Hello {user?.email}
        </Text>
        <Button 
          style={{ marginTop: 20, outlineColor: '#10B981', outlineWidth: 1, borderRadius: 10 }} 
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginTop: 50,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Settings;