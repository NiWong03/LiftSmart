import { useWorkout, type Workout } from '@/components/plans/WorkoutContext';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';

interface WorkoutCardProps {
  workout: Workout;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export default function WorkoutCard({ workout, isExpanded, onToggleExpanded }: WorkoutCardProps) {
  const theme = useTheme();
  const { markWorkoutComplete } = useWorkout();
  const styles = createPlanStyles(theme);

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
            icon={workout.completed ? "check-circle" : "clock-outline"}
            size={24}
            iconColor={workout.completed ? theme.colors.primary : theme.colors.outline}
          />
        </View>

        {/* ------Workout Day Card (Individual Workout)------ */}
        
        <View style={styles.workoutInfo}>
          <Text variant="titleMedium" style={styles.surfaceText}>
            {workout.name}
          </Text>
          <Text variant="bodySmall" style={[styles.surfaceVariantText, { marginTop: 2 }]}>
            {formatDate(workout.date)}
            <View style={styles.workoutMeta}>
          <Text variant="bodySmall" style={styles.surfaceVariantText}>
              {workout.exercises} exercises • {workout.duration}
            </Text>
            </View>
          </Text>
          <View style={styles.workoutMeta}>
            <Text variant="bodySmall" style={styles.surfaceVariantText}>
              {workout.exercises} exercises • {workout.duration}
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
            {workout.exercises_list.map((exercise, index) => (
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
              mode={workout.completed ? "outlined" : "contained"}
              onPress={() => console.log(`Start ${workout.name}`)}
              style={{ flex: 1, marginRight: 4 }}
              icon={workout.completed ? "repeat" : "play"}
            >
              {workout.completed ? "Repeat" : "Start"}
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => console.log(`Edit ${workout.name}`)}
              style={{ flex: 1, marginLeft: 4 }}
              icon="pencil"
            >
              Edit
            </Button>
          </View>
        </View>
      )}
    </Card>
  );
}
