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
 

  // Get today's workouts from current plan
  const todaysWorkouts = workouts.filter(workout => 
    workout.planId === currentPlan?.planID
  );

  // Get upcoming workouts (next 7 days)
  const upcomingWorkouts = workouts.filter(workout => {
    if (!workout.planId || workout.planId !== currentPlan?.planID) return false;
    
    const workoutDate = workout.date instanceof Timestamp ? workout.date.toDate() : new Date(workout.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return workoutDate >= today && workoutDate <= nextWeek;
  }).slice(0, 3);


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
      workoutStarted: false,
      exercisesCompleted: new Array(workout.exercises_list.length).fill(false),
    });
  };

  if (activeWorkout) {
    return (
      <ActiveWorkoutModal
        activeWorkout={activeWorkout}
        onClose={() => setActiveWorkout(null)}
        onUpdateWorkout={(workout) => updateWorkout(workout.id, { completed: true })}
        onCompleteWorkout={() => {
          setActiveWorkout(null);
          // Refresh the workout list
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
            Today's Workouts
          </Text>
          
          {todaysWorkouts.length === 0 ? (
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
              {todaysWorkouts.map((workout: Workout) => (
                <Card key={workout.id} style={[styles.workoutCard, { elevation: 8, overflow: 'hidden' }]}> 
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
                      onPress={() => startWorkout(workout)}
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
              Upcoming This Week
            </Text>
            <View style={{ gap: 16 }}>
              {upcomingWorkouts.map((workout) => (
                <Card key={workout.id} style={[styles.workoutCard, { elevation: 4, overflow: 'hidden' }]}>
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
=======
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const app = () => {
  return (
    <View style={styles.container}>
      <Text style= {styles.text}>Workout Page</Text>
    </View>
  )
}

export default app

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    text: {
      color: 'black',
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 100,
    },
  });
