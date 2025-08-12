import { createPlanStyles } from '@/components/plans/styles';
import { useWorkout } from '@/components/plans/WorkoutContext';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';

import AddWorkoutModal from '@/components/plans/AddWorkoutModal';
import CurrentPlanOverview from '@/components/plans/CurrentPlanOverview';
import EmojiPicker from '@/components/plans/EmojiPicker';
import WorkoutCard from '@/components/plans/WorkoutCard';

const PlansScreen = () => {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const { currentPlan, workouts, updatePlan, updateWorkouts } = useWorkout();
  
 
  const [expandedWorkouts, setExpandedWorkouts] = useState<{ [key: string]: boolean }>({});
  

  const [selectedEmoji, setSelectedEmoji] = useState(currentPlan.emoji);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // State for add workout modal
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    day: 'Monday',
    date: new Date().toISOString().split('T')[0],
    name: '',
    startTime: '08:00',
    endTime: '09:00',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    exercises_list: [] as any[]
  });

  // Toggle workout expansion
  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prev => ({
      ...prev,
      [workoutId]: !prev[workoutId]
    }));
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    updatePlan({ ...currentPlan, emoji });
    setShowEmojiPicker(false);
  };

  const resetForm = () => {
    setNewWorkout({
      day: 'Monday',
      date: new Date().toISOString().split('T')[0],
      name: '',
      startTime: '08:00',
      endTime: '09:00',
      difficulty: 'Medium',
      exercises_list: []
    });
  };

  // ade workout submission
  const handleSubmitWorkout = () => {
    if (!newWorkout.name.trim()) return;

    const workout = {
      id: Date.now().toString(),
      name: newWorkout.name,
      day: newWorkout.day,
      date: newWorkout.date,
      exercises: newWorkout.exercises_list.length,
      duration: "est time",
      difficulty: newWorkout.difficulty,
      completed: false,
      exercises_list: newWorkout.exercises_list
    };

    updateWorkouts([...workouts, workout]);
    setShowAddWorkout(false);
    resetForm();
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* -----------Current Plan Overview--------- */}
          <CurrentPlanOverview
            selectedEmoji={selectedEmoji}
            onEmojiPress={() => setShowEmojiPicker(true)}
          />

          {/* -------------Workouts Section------------- */}
          <Surface style={styles.workoutsContainer} elevation={2}>
            <View style={styles.sectionHeader}>
              <View>
                <Text variant="titleLarge" style={styles.primaryText}>
                  Workouts in Plan
                </Text>
                <Text variant="bodyMedium" style={styles.surfaceVariantText}>
                  {workouts.length} workouts • Tap to expand
                </Text>
              </View>
            </View>

            {/* ---------Workout Cards------------- */}
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isExpanded={expandedWorkouts[workout.id] || false}
                onToggleExpanded={() => toggleWorkoutExpansion(workout.id)}
              />
            ))}

            {/* ---------Add New Workout Card------------- */}
            <Card 
              style={styles.addWorkoutCard} 
              mode="outlined"
            >
              <TouchableOpacity onPress={() => setShowAddWorkout(true)} style={styles.addWorkoutContent}>
                <IconButton
                  icon="plus-circle-outline"
                  size={32}
                  iconColor={theme.colors.primary}
                />
                <Text variant="titleMedium" style={[styles.primaryTextRegular, { marginTop: 8 }]}>
                  Add New Workout
                </Text>
                <Text variant="bodySmall" style={[styles.surfaceVariantText, styles.centeredText, { marginTop: 4 }]}>
                  Create a custom workout
                </Text>
              </TouchableOpacity>
            </Card>
          </Surface>
        </View>
      </ScrollView>

      {/* Emoji Picker Modal */}
      <EmojiPicker
        visible={showEmojiPicker}
        selectedEmoji={selectedEmoji}
        onSelectEmoji={handleEmojiSelect}
        onDismiss={() => setShowEmojiPicker(false)}
      />

      {/* Add Workout Modal */}
      <AddWorkoutModal
        visible={showAddWorkout}
        newWorkout={newWorkout}
        onWorkoutChange={setNewWorkout}
        onSubmit={handleSubmitWorkout}
        onDismiss={() => setShowAddWorkout(false)}
      />
    </View>
  );
};

export default PlansScreen;