import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Divider, IconButton, Modal as PaperModal, Portal, Surface, Text, TextInput, useTheme, } from 'react-native-paper';
import ItemCard from '../ItemCard';
import AddWorkoutModal from './AddWorkoutModal';
import { createPlanStyles } from './styles';
import { Workout } from './WorkoutContext';


interface NewPlan {
  name: string;
  goal: string;
  duration: number;
  difficulty: string;
  emoji: string;
  totalWorkouts: number;
  workouts: Workout[];
}

interface AddPlanModalProps {
  visible: boolean;
  newPlan: NewPlan;
  onPlanChange: (plan: NewPlan) => void;
  onSubmit: (plan: NewPlan) => void;
  onDismiss: () => void;
}

const difficulties = "AI Generated";
const emojis = ['💪', '🏃‍♂️', '🏋️‍♀️', '🧘‍♀️', '🚴‍♂️', '🏊‍♀️', '⚡', '🔥', '💯', '🎯'];

export default function AddPlanModal({ 
  visible, 
  newPlan, 
  onPlanChange, 
  onSubmit, 
  onDismiss 
}: AddPlanModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);

  // Create local plan state to avoid sharing issues
  const [localPlan, setLocalPlan] = useState({
    name: '',
    goal: '',
    duration: 1,
    difficulty: 'AI Created',
    emoji: '💪',
    totalWorkouts: 12,
    workouts: [] as Workout[],
  });

  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedEmoji, setSelectedEmoji] = useState('💪');
  
  // Workout management state
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    day: 'Monday',
    date: new Date().toISOString().split('T')[0],
    name: '',
    startTime: '08:00',
    endTime: '09:00',
    difficulty: 'AI Generated',
    exercises_list: [] as any[]
  });

  // Populate local state from incoming newPlan when visible
  useEffect(() => {
    if (visible) {
      const incoming = newPlan || ({} as any);
      setLocalPlan({
        name: incoming.name || '',
        goal: incoming.goal || '',
        duration: incoming.duration || 1,
        difficulty: incoming.difficulty || 'AI Created',
        emoji: incoming.emoji || '💪',
        totalWorkouts: incoming.totalWorkouts || (incoming.workouts?.length || 0),
        workouts: (incoming.workouts || []) as Workout[],
      });

      setSelectedDuration(incoming.duration || 1);
      setSelectedEmoji(incoming.emoji || '💪');
      setShowAddWorkout(false);
      setNewWorkout({
        day: 'Monday',
        date: new Date().toISOString().split('T')[0],
        name: '',
        startTime: '08:00',
        endTime: '09:00',
        difficulty: 'AI Generated',
        exercises_list: []
      });
    }
  }, [visible, newPlan]);

  const updateLocalPlan = (updates: Partial<typeof localPlan>) => {
    setLocalPlan(prev => ({ ...prev, ...updates }));
  };


  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    updateLocalPlan({ duration });

    const totalWorkouts = localPlan.workouts.length;
    updateLocalPlan({ totalWorkouts });
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    updateLocalPlan({ emoji });
  };

  // Workout management functions
  const handleAddWorkout = () => {
    if (!newWorkout.name.trim()) return;

    console.log('Creating workout with data:', {
      name: newWorkout.name,
      exercises_list: newWorkout.exercises_list,
      exercises_count: newWorkout.exercises_list.length
    });

    // Convert 24-hour format to 12-hour format
    const convertTo12Hour = (time24: string) => {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Create workout object with local ID for now
    const workoutData: Workout = {
      id: Date.now().toString(), // Local ID for UI
      name: newWorkout.name,
      day: newWorkout.day,
      date: Timestamp.fromDate(new Date(newWorkout.date)),
      exercises: newWorkout.exercises_list.length,
      duration: "AI Calculated", // Default duration
      startTime: convertTo12Hour(newWorkout.startTime),
      endTime: convertTo12Hour(newWorkout.endTime),
      userId: 'testUserID', // Will be set by addPlan
      difficulty: newWorkout.difficulty,
      completed: false,
      exercises_list: newWorkout.exercises_list
    };

    console.log('Created workout object:', {
      name: workoutData.name,
      exercises: workoutData.exercises,
      exercises_list: workoutData.exercises_list,
      exercises_list_length: workoutData.exercises_list?.length || 0,
      startTime: workoutData.startTime,
      endTime: workoutData.endTime
    });

    // Update local plan state only
    const updatedWorkouts = [...(localPlan.workouts || []), workoutData];
    updateLocalPlan({ 
      workouts: updatedWorkouts,
      totalWorkouts: updatedWorkouts.length 
    });
    
    console.log('Updated plan workouts count:', updatedWorkouts.length);
    
    setShowAddWorkout(false);
    
    // Reset workout form
    setNewWorkout({
      day: 'Monday',
      date: new Date().toISOString().split('T')[0],
      name: '',
      startTime: '08:00',
      endTime: '09:00',
      difficulty: 'AI Generated',
      exercises_list: []
    });
  };

  const handleRemoveWorkout = (workoutId: string) => {
    const updatedWorkouts = localPlan.workouts.filter(w => w.id !== workoutId);
    updateLocalPlan({ 
      workouts: updatedWorkouts,
      totalWorkouts: updatedWorkouts.length 
    });
  };

  const renderWorkoutCard = (workout: Workout) => (
    <Card key={workout.id} style={[styles.workoutCard, { marginBottom: 8 }]} mode="outlined">
      <View style={[styles.workoutHeader, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={styles.primaryText}>
            {workout.name}
          </Text>
          <Text variant="bodySmall" style={styles.surfaceVariantText}>
            {workout.day} • {workout.duration} • {workout.difficulty}
          </Text>
          <Text variant="bodySmall" style={styles.surfaceVariantText}>
            {workout.exercises} exercises
          </Text>
        </View>
        <IconButton
          icon="delete"
          size={20}
          iconColor={theme.colors.error}
          onPress={() => handleRemoveWorkout(workout.id)}
        />
      </View>
    </Card>
  );
// changed to paper modal to be compatible with chatbot page
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[{
          alignSelf: 'center',
          width: '90%',
          height: '80%',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
        }]}
      >
        <Surface style={styles.addWorkoutModal} elevation={4}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.primaryText}>
                Create New Plan
              </Text>
              <IconButton
                icon="close"
                size={24}
                iconColor={theme.colors.onSurface}
                onPress={onDismiss}
              />
            </View>
            <Divider />
            
            <View style={styles.formContainer}>
              {/* Plan Name */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Plan Name
                </Text>
                <TextInput
                  value={localPlan.name}
                  onChangeText={(text) => updateLocalPlan({ name: text })}
                  placeholder="Enter plan name (e.g., Summer Shred, Strength Building)"
                  style={styles.textInput}
                  mode="outlined"
                />
              </View>

              {/* Goal */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Goal
                </Text>
                <TextInput
                  value={localPlan.goal}
                  onChangeText={(text) => updateLocalPlan({ goal: text })}
                  placeholder="What do you want to achieve? (e.g., Lose weight, Build muscle)"
                  style={styles.textInput}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Duration */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Duration (weeks)
                </Text>
                <TextInput
                  value={localPlan.duration?.toString() || ''}
                  onChangeText={(text) => {
                    const input = parseInt(text) || 0;
                    updateLocalPlan({ duration: input });
                    setSelectedDuration(input);
                  }}
                  placeholder="Enter number of weeks"
                  style={styles.textInput}
                  mode="outlined"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>


              {/* Workouts Section */}
              <View style={styles.formField}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text variant="labelLarge" style={styles.primaryTextRegular}>
                    Workouts ({localPlan.workouts?.length || 0})
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => setShowAddWorkout(true)}
                    icon="plus"
                    compact
                  >
                    Add Workout
                  </Button>
                </View>
                
                {/* Workout List */}
                {localPlan.workouts && localPlan.workouts.length > 0 && (
                  <View>
                    {localPlan.workouts.map((workout) => (
                      <ItemCard
                        key={workout.id}
                        id={workout.id}
                        title={workout.name}
                        subtitle={`${workout.day} • ${workout.duration} • ${workout.difficulty}`}
                        details={`${workout.exercises} exercises`}
                        onDelete={() => handleRemoveWorkout(workout.id)}
                      />
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.submitContainer}>
                <Button
                  mode="contained"
                  onPress={() => {
                    console.log('Submit button pressed in AddPlanModal');
                    console.log('Current localPlan state:', localPlan);
                    console.log('Workouts in plan:', localPlan.workouts?.length || 0);
                    onSubmit(localPlan);
                  }}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  disabled={!localPlan.name.trim() || !localPlan.goal.trim()}
                >
                  Create Plan
                </Button>
              </View>
            </View>
          </ScrollView>
        </Surface>
        
        {/* Add Workout Modal */}
        <AddWorkoutModal
          visible={showAddWorkout}
          newWorkout={newWorkout}
          onWorkoutChange={setNewWorkout}
          onSubmit={handleAddWorkout}
          onDismiss={() => setShowAddWorkout(false)}
        />
      </PaperModal>
    </Portal>
  );
}
