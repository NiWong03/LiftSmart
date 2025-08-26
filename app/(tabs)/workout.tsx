import ActiveWorkoutModal, { ActiveWorkout } from '@/components/plans/ActiveWorkoutModal';
import { useWorkout, Workout } from '@/components/plans/WorkoutContext';
import { createPlanStyles } from '@/components/styles';
import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Divider, IconButton, Text, useTheme } from 'react-native-paper';


export default function WorkoutPage() {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const { currentPlan, workouts, updateWorkout } = useWorkout();
  
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [expandedUpcomingId, setExpandedUpcomingId] = useState<string | null>(null);
 

  // Get this week's workouts from current plan and sort by date
  const thisWeeksWorkouts = workouts
    .filter(workout => {
      if (!workout.planId || workout.planId !== currentPlan?.planID) return false;
      
      const workoutDate = workout.date instanceof Timestamp ? workout.date.toDate() : new Date(workout.date);
      const today = new Date();
      
      // Get start of current week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Get end of current week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
      const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Get upcoming workouts (next week and beyond) and sort by date
  const upcomingWorkouts = workouts
    .filter(workout => {
      if (!workout.planId || workout.planId !== currentPlan?.planID) return false;
      
      const workoutDate = workout.date instanceof Timestamp ? workout.date.toDate() : new Date(workout.date);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7); // Start of next week
      return workoutDate >= nextWeek;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
      const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    // No slice needed - show all upcoming workouts from the plan


  const startWorkout = (workout: Workout) => {
    setActiveWorkout({
      workout,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      completedSets: [],
      startTime: new Date(),
      isActive: true,
      totalWorkoutTime: 0,
      currentRestTime: 0,
      isResting: false,
      pausedTime: 0,
      isPaused: false,
      workoutStarted: true, // This will auto-start the timer in the modal
      exercisesCompleted: new Array(workout.exercises_list.length).fill(false),
    });
  };

  const repeatWorkout = (workout: Workout) => {
    // Mark workout as not completed when repeating
    const updatedWorkout = { ...workout, completed: false };
    updateWorkout(workout.id, { completed: false });
    
    // Reset workout state and start fresh with timer already started
    setActiveWorkout({
      workout: updatedWorkout,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      completedSets: [],
      startTime: new Date(),
      isActive: true,
      totalWorkoutTime: 0,
      currentRestTime: 0,
      isResting: false,
      pausedTime: 0,
      isPaused: false,
      workoutStarted: true, // This will auto-start the timer in the modal
      exercisesCompleted: new Array(workout.exercises_list.length).fill(false),
    });
  };

  if (activeWorkout) {
    return (
      <ActiveWorkoutModal
        activeWorkout={activeWorkout}
        onClose={() => setActiveWorkout(null)}
        onUpdateWorkout={(workout) => {
          // Update workout with all changes (completed status, duration, etc.)
          updateWorkout(workout.id, workout);
        }}
        onCompleteWorkout={() => {
          setActiveWorkout(null);
          // Refresh the workout list
        }}
        onUpdateActiveWorkout={(updatedActiveWorkout) => {
          // Update the activeWorkout state when modal needs to reset it
          setActiveWorkout(updatedActiveWorkout);
        }}
      />
    );
  }

  // No active workout - Modern Dashboard
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Modern Header */}
      <View style={[
        styles.workoutHeaderContainer,
        {
          backgroundColor: theme.colors.primary,
          elevation: 8,
          shadowOpacity: 1,
          shadowRadius: 16,
        }
      ]}>
        <Text style={styles.workoutHeaderTitle}>
          Workout Dashboard
        </Text>
        <Text style={styles.workoutHeaderSubtitle}>
          {currentPlan.name} • {currentPlan.difficulty} • {currentPlan.duration} weeks
        </Text>
      </View>

      {/* Today's Workouts - Modern Cards */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.workoutScrollContent}>
        <View style={styles.sectionContainer}>
          <Text style={[styles.surfaceText, styles.sectionTitle]}>
            This Week's Workouts
          </Text>
          
          {thisWeeksWorkouts.length === 0 ? (
            <Card style={[styles.workoutCard, { elevation: 4 }]}>
              <Card.Content style={{ 
                padding: 40, 
                alignItems: 'center',
              }}>
                <IconButton icon="calendar-blank" size={48} iconColor={theme.colors.outline} />
                <Text style={[styles.surfaceVariantText, { 
                  fontSize: 16, 
                  textAlign: 'center',
                  fontWeight: '500',
                }]}>
                  No workouts scheduled for today
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={{ gap: 16 }}>
              {thisWeeksWorkouts.map((workout: Workout) => (
                <Card key={workout.id} style={[styles.workoutCard, { elevation: 8}]}> 
                  <Card.Content style={styles.cardContentLg}>
                    <View style={[styles.rowBetweenStart, { marginBottom: 16 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.surfaceText, { fontSize: 20, marginBottom: 4 }]}>
                          {workout.name}
                        </Text>
                        <Text style={[styles.surfaceVariantText, { fontSize: 16, marginBottom: 4 }]}>
                          {workout.day} • {workout.duration} • {workout.difficulty}
                        </Text>
                        <Text style={[styles.surfaceVariantText, { fontSize: 14 }]}>
                          {workout.exercises} exercises • {workout.exercises_list.length} sets
                        </Text>
                      </View>
                      <View style={[
                        styles.statusPill,
                        { backgroundColor: workout.completed ? theme.colors.primaryContainer : theme.colors.secondaryContainer }
                      ]}>
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: '700',
                          color: workout.completed ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer,
                          textTransform: 'uppercase',
                        }}>
                          {workout.completed ? '✓ Done' : '⏳ Pending'}
                        </Text>
                      </View>
                    </View>
                    
                    <Button
                      mode={workout.completed ? "outlined" : "contained"}
                      onPress={() => workout.completed ? repeatWorkout(workout) : startWorkout(workout)}
                      icon={workout.completed ? "replay" : "play"}
                      contentStyle={{ paddingVertical: 12 }}
                      labelStyle={{ fontSize: 16, fontWeight: '600' }}
                      style={[styles.primaryButton, { 
                        borderWidth: workout.completed ? 2 : 0,
                      }]}
                    >
                      {workout.completed ? 'Repeat Workout' : 'Start Workout'}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Upcoming Workouts - Modern Cards */}
        {upcomingWorkouts.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.surfaceText, styles.sectionTitle]}>
              Upcoming Workouts
            </Text>
            <View style={{ gap: 16 }}>
              {upcomingWorkouts.map((workout) => (
                <Card key={workout.id} style={[styles.workoutCard, { elevation: 4 }]}>
                  <Card.Content style={styles.cardContentMd}>
                    <View style={[styles.rowBetweenStart, { marginBottom: 24 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.surfaceText, { fontSize: 18, marginBottom: 4 }]}>
                          {workout.name}
                        </Text>
                        <Text style={[styles.surfaceVariantText, { fontSize: 14, marginBottom: 4 }]}>
                          {workout.day} • {workout.duration} • {workout.difficulty}
                        </Text>
                        <Text style={[styles.surfaceVariantText]}>
                          {workout.exercises} exercises • {workout.exercises_list.length} sets
                        </Text>
                      </View>
                      <View style={[styles.dateBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                        <Text style={{fontWeight: '600'}}>
                          {workout.date instanceof Date ? workout.date.toLocaleDateString() : workout.date.toDate().toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    {/* Expandable workout details */}
                    <View style={{ alignItems: 'flex-end' }}>
                      <IconButton
                        icon={expandedUpcomingId === workout.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        iconColor={theme.colors.onSurfaceVariant}
                        onPress={() => setExpandedUpcomingId(prev => prev === workout.id ? null : workout.id)}
                      />
                    </View>
                    {expandedUpcomingId === workout.id && (
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
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}