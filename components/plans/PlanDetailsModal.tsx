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
  const { currentPlan, workouts, updatePlan, updateWorkouts } = useWorkout();

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
  const handleSubmitWorkout = () => {
    if (!newWorkout.name.trim()) return;

    const workout = {
      id: Date.now().toString(),
      name: newWorkout.name,
      day: newWorkout.day,
      date: Timestamp.fromDate(new Date(newWorkout.date)),
      exercises: newWorkout.exercises_list.length,
      startTime: newWorkout.startTime,
      endTime: newWorkout.endTime,
      duration: "est time",
      difficulty: newWorkout.difficulty,
      completed: false,
      exercises_list: newWorkout.exercises_list,
      userId: 'testUserID'
    };

    updateWorkouts([...workouts, workout]);
    setShowAddWorkout(false);
    resetForm();
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
              {workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
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