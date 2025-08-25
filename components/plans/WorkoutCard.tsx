import { useWorkout, type Workout } from '@/components/plans/WorkoutContext';
import { Timestamp } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';
import EditWorkoutModal from '../plans/EditWorkoutModal';

interface WorkoutCardProps {
  workout: Workout;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export default function WorkoutCard({ workout, isExpanded, onToggleExpanded }: WorkoutCardProps) {
  const theme = useTheme();
  const { markWorkoutComplete, updateWorkout, workouts } = useWorkout();
  const styles = createPlanStyles(theme);
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);
  
  // Get the latest workout data from context
  const currentWorkout = workouts.find(w => w.id === workout.id) || workout;

  // Force re-render when workout data changes
  useEffect(() => {
    // Workout data changed - component will re-render
  }, [currentWorkout.name, currentWorkout.exercises, currentWorkout.exercises_list]);

  const getWorkoutDate = (date: Date | Timestamp | string): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    if (typeof date === 'string') {
      return new Date(date);
    }
    return date;
  };

  const formatDate = (date: Date | Timestamp | string) => {
    const workoutDate = getWorkoutDate(date);
    return workoutDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card style={styles.workoutCard} mode="outlined">
      <TouchableOpacity onPress={onToggleExpanded} style={styles.workoutHeader}>
        <View style={styles.workoutStatus}>
          <IconButton
            icon={currentWorkout.completed ? "check-circle" : "clock-outline"}
            size={24}
            iconColor={currentWorkout.completed ? theme.colors.primary : theme.colors.outline}
          />
        </View>

        {/* ------Workout Day Card (Individual Workout)------ */}
        
        <View style={styles.workoutInfo}>
          <Text variant="titleMedium" style={styles.surfaceText}>
            {currentWorkout.name}
          </Text>
          <Text variant="bodySmall" style={[styles.surfaceVariantText, { marginTop: 2 }]}>
            {formatDate(currentWorkout.date)}
          </Text>
          <View style={styles.workoutMeta}>
            <Text variant="bodySmall" style={styles.surfaceVariantText}>
              {currentWorkout.exercises} exercises • {currentWorkout.duration}
            </Text>
          </View>
        </View>
        
        <IconButton
          icon={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          iconColor={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {/* ------Workout Details Card (Expanded)------ */}

      {isExpanded && (
        <View style={styles.workoutDetails}>
          <Divider />
          <View style={{ marginTop: 12 }}>
            <Text variant="labelMedium" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
              Exercises:
            </Text>
            {currentWorkout.exercises_list.map((exercise, index) => (
              <View key={index} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Text variant="bodyMedium" style={styles.surfaceTextRegular}>
                    {exercise.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          

          {/* ------Edit buttons------ */}
          <View style={styles.workoutActions}>
            <Button 
              mode={currentWorkout.completed ? "outlined" : "contained"}
              onPress={() => console.log(`Start ${currentWorkout.name}`)}
              style={{ flex: 1, marginRight: 4 }}
              icon={currentWorkout.completed ? "repeat" : "play"}
            >
              {currentWorkout.completed ? "Repeat" : "Start"}
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => {
                console.log(`Edit ${currentWorkout.name}`)
                setShowEditWorkoutModal(true);
              }}
              style={{ flex: 1, marginLeft: 4 }}
              icon="pencil"
            >
              Edit
            </Button>
          </View>
        </View>
      )}
      
      <EditWorkoutModal
        visible={showEditWorkoutModal}
        workout={currentWorkout}
        onDismiss={() => setShowEditWorkoutModal(false)}
        onSubmit={(updatedWorkout) => {
          updateWorkout(currentWorkout.id, updatedWorkout);
          setShowEditWorkoutModal(false);
        }}
      />
    </Card>
  );
}
