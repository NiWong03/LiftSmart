import AddWorkoutModal from '@/components/plans/AddWorkoutModal';
import WorkoutCard from '@/components/plans/WorkoutCard';
import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { WorkoutPlan, useWorkout } from './WorkoutContext';
import { createPlanStyles } from './styles';



interface PlanDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  plan: WorkoutPlan;
}

function PlanDetailsModal({ visible, onDismiss, plan }: PlanDetailsModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const { currentPlan, workouts, updatePlan, updateWorkouts, addWorkout } = useWorkout();

  // Filter workouts to only show those belonging to this plan
  const planWorkouts = workouts.filter(workout => workout.planId === plan.planID);

  const [expandedWorkouts, setExpandedWorkouts] = useState<{ [key: string]: boolean }>({});
  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prev => ({
      ...prev,
      [workoutId]: !prev[workoutId]
    }));
  };

  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    day: 'Monday',
    date: new Date().toISOString().split('T')[0],
    name: '',
    startTime: '08:00',
    endTime: '09:00',
    difficulty: "AI Pending",
    exercises_list: [] as any[]
  });


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

  // add workout submission
  const handleSubmitWorkout = async () => {
    if (!newWorkout.name.trim()) return;

    console.log('Adding workout to existing plan:', {
      name: newWorkout.name,
      exercises_count: newWorkout.exercises_list.length,
      planId: plan.planID
    });

    // Convert 24-hour format to 12-hour format
    const convertTo12Hour = (time24: string) => {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const workout = {
      name: newWorkout.name,
      day: newWorkout.day,
      date: new Date(newWorkout.date),
      exercises: newWorkout.exercises_list.length,
      startTime: convertTo12Hour(newWorkout.startTime),
      endTime: convertTo12Hour(newWorkout.endTime),
      duration: "est time",
      difficulty: newWorkout.difficulty,
      completed: false,
      exercises_list: newWorkout.exercises_list?.map(exercise => ({
        name: exercise.name || '',
        sets: exercise.sets?.map((set: any) => ({
          reps: set[0] || 0,
          weight: set[1] || '',
          time: set[2] || 0,
          rest: set[3] || 0
        })) || [],
        description: exercise.description || ''
      })) || []
    };

    console.log('Created workout object:', {
      name: workout.name,
      exercises: workout.exercises,
      startTime: workout.startTime,
      endTime: workout.endTime,
      exercises_list_length: workout.exercises_list?.length || 0
    });

    try {
      await addWorkout(workout, plan.planID); // Pass the plan ID
      console.log('Workout added to Firebase successfully');
      setShowAddWorkout(false);
      resetForm();
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Surface style={styles.planDetailsModal}>
          <View style={styles.modalHeader}>
            <Text variant="headlineMedium" style={styles.primaryText}>{plan.name} • {plan.duration} Weeks</Text>
            <IconButton icon="close" onPress={onDismiss} />
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ padding: 16 }}>
              <Text variant="headlineSmall" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>Goal:</Text>
              <View style={styles.goaltextbox}> 
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>{plan.goal}</Text>
              </View>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={{ color: theme.colors.primary, paddingVertical: 16, fontWeight: 'bold' }}>
                  Workouts in Plan
                </Text>
              </View>
              {planWorkouts.map((workout) => (
                <WorkoutCard
                  key={`${workout.id}-${workout.name}-${workout.exercises}`}
                  workout={workout}
                  isExpanded={expandedWorkouts[workout.id] || false}
                  onToggleExpanded={() => toggleWorkoutExpansion(workout.id)}
                />
              ))}

            <Card style={styles.addWorkoutCard} mode="outlined">
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

            <AddWorkoutModal
            visible={showAddWorkout}
            newWorkout={newWorkout}
            onWorkoutChange={setNewWorkout}
            onSubmit={handleSubmitWorkout}
            onDismiss={() => setShowAddWorkout(false)}
            />
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}

export default PlanDetailsModal;