import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import AddWorkoutModal from './AddWorkoutModal';
import { createPlanStyles } from './styles';
import { Workout } from './WorkoutContext';
import ItemCard from '../ItemCard';

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
  onSubmit: () => void;
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

  const [selectedDuration, setSelectedDuration] = useState(newPlan.duration);
  const [selectedEmoji, setSelectedEmoji] = useState(newPlan.emoji);
  
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

  const updatePlan = (updates: Partial<NewPlan>) => {
    onPlanChange({ ...newPlan, ...updates });
  };


  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    updatePlan({ duration });

    const totalWorkouts = newPlan.workouts.length;
    updatePlan({ totalWorkouts });
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    updatePlan({ emoji });
  };

  // Workout management functions
  const handleAddWorkout = () => {
    if (!newWorkout.name.trim()) return;

    const workout: Workout = {
      id: Date.now().toString(),
      name: newWorkout.name,
      day: newWorkout.day,
      date: new Date(newWorkout.date),
      exercises: newWorkout.exercises_list.length,
      duration: "AI Calculated", // Default duration
      difficulty: newWorkout.difficulty,
      completed: false,
      exercises_list: newWorkout.exercises_list
    };

    const updatedWorkouts = [...(newPlan.workouts || []), workout];
    updatePlan({ 
      workouts: updatedWorkouts,
      totalWorkouts: updatedWorkouts.length 
    });
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
    const updatedWorkouts = newPlan.workouts.filter(w => w.id !== workoutId);
    updatePlan({ 
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
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
                  value={newPlan.name}
                  onChangeText={(text) => updatePlan({ name: text })}
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
                  value={newPlan.goal}
                  onChangeText={(text) => updatePlan({ goal: text })}
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
                  value={newPlan.duration?.toString() || ''}
                  onChangeText={(text) => {
                    const input = parseInt(text) || 0;
                    updatePlan({ duration: input });
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
                    Workouts ({newPlan.workouts?.length || 0})
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
                {newPlan.workouts && newPlan.workouts.length > 0 && (
                  <View>
                    {newPlan.workouts.map((workout) => (
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
                  onPress={onSubmit}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  disabled={!newPlan.name.trim() || !newPlan.goal.trim()}
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
      </View>
    </Modal>
  );
}
