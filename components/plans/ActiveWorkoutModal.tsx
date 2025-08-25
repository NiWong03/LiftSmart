import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { createPlanStyles } from '../styles';
import { Set, Workout } from './WorkoutContext';

export interface ActiveSet {
  exerciseName: string;
  setNumber: number;
  reps: string;
  weight: string;
  time: string;
  rest: string;
  completed: boolean;
  actualReps?: string;
  actualWeight?: string;
  actualTime?: string;
  actualRest?: string;
  notes?: string;
  timestamp: Date;
  isResting?: boolean;
  restTimeRemaining?: number;
}

export interface ActiveWorkout {
  workout: Workout;
  currentExerciseIndex: number;
  currentSetIndex: number;
  completedSets: ActiveSet[];
  startTime: Date;
  isActive: boolean;
  totalWorkoutTime: number;
  currentRestTime: number;
  isResting: boolean;
  pausedTime: number;
  isPaused: boolean;
  workoutStarted: boolean;
  exercisesCompleted: boolean[];
}

interface ActiveWorkoutModalProps {
  activeWorkout: ActiveWorkout;
  onClose: () => void;
  onUpdateWorkout: (workout: Workout) => void;
  onCompleteWorkout: () => void;
  onUpdateActiveWorkout: (activeWorkout: ActiveWorkout) => void;
}

export default function ActiveWorkoutModal({
  activeWorkout,
  onClose,
  onUpdateWorkout,
  onCompleteWorkout,
  onUpdateActiveWorkout
}: ActiveWorkoutModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const [showHistory, setShowHistory] = useState(false);
  const [localWorkoutTime, setLocalWorkoutTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Timer refs
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset local timer state when workout changes (e.g., repeat workout)
  useEffect(() => {
    if (activeWorkout && !activeWorkout.workoutStarted) {
      setLocalWorkoutTime(0);
      setIsPaused(false);
    }
  }, [activeWorkout?.workout.id, activeWorkout?.workoutStarted]);

  // Auto-start timer when workout is marked as started
  useEffect(() => {
    if (activeWorkout?.workoutStarted && !workoutTimerRef.current) {
      // Auto-start timer when workout is marked as started
      startWorkoutTimer();
    }
  }, [activeWorkout?.workoutStarted]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
        workoutTimerRef.current = null;
      }
    };
  }, []);

  // Start rest timer
  useEffect(() => {
    if (activeWorkout?.isResting && activeWorkout.currentRestTime > 0) {
      restTimerRef.current = setInterval(() => {
        // Decrease rest time by 1 second
        const newRestTime = activeWorkout.currentRestTime - 1;
        
        if (newRestTime <= 0) {
          // Rest time is complete
          clearInterval(restTimerRef.current!);
          restTimerRef.current = null;
          
          const updatedActiveWorkout = {
            ...activeWorkout,
            isResting: false,
            currentRestTime: 0,
          };
          onUpdateActiveWorkout(updatedActiveWorkout);
        } else {
          // Update rest time
          const updatedActiveWorkout = {
            ...activeWorkout,
            currentRestTime: newRestTime,
          };
          onUpdateActiveWorkout(updatedActiveWorkout);
        }
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [activeWorkout?.isResting, activeWorkout?.currentRestTime]);

  const parseSet = (set: Set, setIndex: number) => {
    const rest = set[3]?.toString() || '';
    
    return {
      setNumber: setIndex + 1,
      reps: set[0]?.toString() || '',
      weight: set[1]?.toString() || '',
      time: set[2]?.toString() || '',
      rest: rest === '0' ? '60' : rest,
    };
  };

  const clearExistingTimer = () => {
    // Clear any existing workout timer
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
  };

  const startWorkoutTimer = () => {
    // Prevent multiple timers from running
    if (workoutTimerRef.current) {
      return;
    }
    
    // Mark workout as started and update parent component
    const updatedWorkout = {
      ...activeWorkout,
      workoutStarted: true,
      startTime: new Date(),
    };
    
    // Update parent component immediately when starting
    onUpdateWorkout(updatedWorkout.workout);
    
    // Start simple timer that increments every second
    workoutTimerRef.current = setInterval(() => {
      setLocalWorkoutTime(prev => {
        const newTime = prev + 1;
        
        // Update Firebase every 5 minutes (300 seconds)
        if (newTime % 300 === 0) {
          const workoutWithTime = {
            ...activeWorkout,
            totalWorkoutTime: newTime,
          };
          onUpdateWorkout(workoutWithTime.workout);
        }
        
        return newTime;
      });
    }, 1000);
  };

  const pauseWorkout = () => {
    // Pause the workout timer
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
    
    // Update local state immediately for UI responsiveness
    setIsPaused(true);
    
    // Update parent component
    const updatedWorkout = {
      ...activeWorkout,
      isPaused: true,
    };
    onUpdateWorkout(updatedWorkout.workout);
  };

  const resumeWorkout = () => {
    // Update local state immediately for UI responsiveness
    setIsPaused(false);
    
    // Update parent component
    const updatedWorkout = {
      ...activeWorkout,
      isPaused: false,
    };
    onUpdateWorkout(updatedWorkout.workout);
    
    // Resume the timer from where it left off
    if (workoutTimerRef.current) {
      return;
    }
    
    workoutTimerRef.current = setInterval(() => {
      setLocalWorkoutTime(prev => {
        const newTime = prev + 1;
        
        // Update Firebase every 5 minutes (300 seconds)
        if (newTime % 300 === 0) {
          const workoutWithTime = {
            ...activeWorkout,
            totalWorkoutTime: newTime,
          };
          onUpdateWorkout(workoutWithTime.workout);
        }
        
        return newTime;
      });
    }, 1000);
  };



  const skipRest = () => {
    // Skip rest timer and continue to next set
    const updatedActiveWorkout = {
      ...activeWorkout,
      isResting: false,
      currentRestTime: 0,
    };
    onUpdateActiveWorkout(updatedActiveWorkout);
  };

  const toggleSetCompletion = (exerciseName: string, setNumber: number) => {
    const existingSetIndex = activeWorkout.completedSets.findIndex(
      set => set.exerciseName === exerciseName && set.setNumber === setNumber
    );
    
    let updatedCompletedSets;
    let shouldStartRest = false;
    let restTime = 0;
    
    if (existingSetIndex >= 0) {
      // Remove the set if it's already completed
      updatedCompletedSets = activeWorkout.completedSets.filter(
        (_, index) => index !== existingSetIndex
      );
    } else {
      // Add the set as completed
      const newCompletedSet: ActiveSet = {
        exerciseName,
        setNumber,
        reps: '',
        weight: '',
        time: '',
        rest: '',
        completed: true,
        timestamp: new Date(),
      };
      updatedCompletedSets = [...activeWorkout.completedSets, newCompletedSet];
      
      // Check if we should start rest timer
      const exercise = activeWorkout.workout.exercises_list.find(ex => ex.name === exerciseName);
      
      if (exercise && exercise.sets[setNumber - 1]) {
        const set = exercise.sets[setNumber - 1];
        
        const rawRestValue = set[3]; // rest time is at index 3
        
        
        // Use the same logic as parseSet for rest time
        const restValue = rawRestValue === 0 ? 60 : rawRestValue;
        
        
        if (restValue > 0) {
          shouldStartRest = true;
          restTime = restValue;
          
        }
      }
    }
    
    // Create the updated workout state
    let updatedActiveWorkout = { ...activeWorkout, completedSets: updatedCompletedSets };
    
    // If we should start rest, include rest timer state in the same update
    if (shouldStartRest && restTime > 0) {
      updatedActiveWorkout = {
        ...updatedActiveWorkout,
        isResting: true,
        currentRestTime: restTime,
      };
      
    }
    
    // Single update call with all changes
    
    onUpdateActiveWorkout(updatedActiveWorkout);
  };

  const repeatWorkout = () => {
    // Clear existing timer and start fresh workout
    clearExistingTimer();
    
    // Reset local state variables
    setLocalWorkoutTime(0);
    setIsPaused(false);
    
    // Reset workout state to fresh start
    const resetWorkout = {
      ...activeWorkout,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      completedSets: [],
      startTime: new Date(),
      totalWorkoutTime: 0,
      currentRestTime: 0,
      isResting: false,
      pausedTime: 0,
      isPaused: false,
      workoutStarted: false,
      exercisesCompleted: new Array(activeWorkout.workout.exercises_list.length).fill(false),
    };
    
    // Update parent's activeWorkout state
    onUpdateActiveWorkout(resetWorkout);
    
    // Start fresh workout timer
    startWorkoutTimer();
  };

  const finishWorkout = async () => {
    try {
      await onUpdateWorkout(activeWorkout.workout);
      onCompleteWorkout();
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to complete workout');
    }
  };

  const getCurrentExercise = () => {
    if (!activeWorkout) return null;
    return activeWorkout.workout.exercises_list[activeWorkout.currentExerciseIndex];
  };

  const getCurrentSet = () => {
    const exercise = getCurrentExercise();
    if (!exercise) return null;
    return exercise.sets[activeWorkout.currentSetIndex];
  };

  const getProgress = () => {
    if (!activeWorkout) return 0;
    
    // Count completed sets
    const completedSets = activeWorkout.completedSets.length;
    const totalSets = activeWorkout.workout.exercises_list.reduce((total, exercise) => total + exercise.sets.length, 0);
    return totalSets > 0 ? completedSets / totalSets : 0;
  };

  const getExerciseProgress = (exerciseIndex: number) => {
    if (!activeWorkout) return 0;
    
    const exercise = activeWorkout.workout.exercises_list[exerciseIndex];
    if (!exercise) return 0;
    
    // Count completed sets for this exercise
    const completedSets = activeWorkout.completedSets.filter(
      set => set.exerciseName === exercise.name
    ).length;
    
    const totalSets = exercise.sets.length;
    
    return totalSets > 0 ? completedSets / totalSets : 0;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };


  const currentExercise = getCurrentExercise();
  const currentSet = getCurrentSet();
  const progress = getProgress();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Modern Gradient Header */}
      <View style={[
        styles.activeWorkoutHeader,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
        }
      ]}>
        <View style={styles.activeWorkoutHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activeWorkoutTitle}>
              {activeWorkout.workout.name}
            </Text>
            <Text style={styles.activeWorkoutSubtitle}>
              {activeWorkout.workout.day} • {activeWorkout.workout.duration}
            </Text>
          </View>
          <View style={styles.activeWorkoutButtonGroup}>
            {!activeWorkout.workoutStarted ? (
              <IconButton 
                icon="play-circle" 
                size={32} 
                iconColor="white" 
                onPress={startWorkoutTimer}
                style={styles.headerButton}
              />
            ) : isPaused ? (
              <IconButton 
                icon="play-circle" 
                size={32} 
                iconColor="white" 
                onPress={resumeWorkout}
                style={styles.headerButton}
              />
            ) : (
              <IconButton 
                icon="pause-circle" 
                size={32} 
                iconColor="white" 
                onPress={pauseWorkout}
                style={styles.headerButton}
              />
            )}
            <IconButton 
              icon="close" 
              size={32} 
              iconColor="white" 
              onPress={() => {
                // Show warning alert before closing
                Alert.alert(
                  'Close Workout?',
                  'Closing will reset your workout progress. Are you sure you want to continue?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Close',
                      style: 'destructive',
                      onPress: onClose,
                    },
                  ]
                );
              }}
              style={styles.headerButton}
            />
          </View>
        </View>
        
        {/* Modern Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatTime(localWorkoutTime)}
          </Text>
          <Text style={styles.timerLabel}>
            {!activeWorkout.workoutStarted ? 'Tap Play to Start' : 
             isPaused ? 'PAUSED' : 'Workout Time'}
          </Text>
        </View>
        
        {/* Modern Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[
            styles.progressBarFill,
            { width: `${Math.round(progress * 100)}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% Complete
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.activeWorkoutScrollContent}>

      {/* Rest Timer - Modern Design */}
      {activeWorkout.isResting && (
        <View style={[
          styles.restTimerContainer,
          {
            backgroundColor: theme.colors.tertiary,
            shadowColor: theme.colors.tertiary,
          }
        ]}>
          <Text style={[styles.restTimerTitle, { color: theme.colors.onTertiary }]}>
            Rest Time
          </Text>
          <Text style={[styles.restTimerDisplay, { color: theme.colors.onTertiary }]}>
            {formatTime(activeWorkout.currentRestTime)}
          </Text>
          <Button 
            mode="contained" 
            onPress={skipRest} 
            icon="skip-next"
            contentStyle={{ paddingVertical: 12 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
            style={{ borderRadius: 16 }}
          >
            Skip Rest
          </Button>
        </View>
      )}

      {/* Modern Stats Cards */}
        <View style={[styles.workoutsContainer, styles.statsContainer]}>
          <Card style={[styles.workoutCard, styles.statCard]}>
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.surfaceVariantText, styles.statLabel]}>
                You
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.workoutCard, styles.statCard]}>
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.surfaceVariantText, styles.statLabel]}>
                got
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.workoutCard, styles.statCard]}>
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.surfaceVariantText, styles.statLabel]}>
                this!
              </Text>
            </Card.Content>
          </Card>
        </View>

      {/* Exercise Checklist - Modern Design */}
      <Surface style={[styles.workoutsContainer, styles.checklistContainer]}>
        <View style={{ overflow: 'hidden' }}>
          <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <IconButton icon="format-list-checks" size={24} iconColor={theme.colors.primary} />
              <Text style={[styles.surfaceText, { fontSize: 18, flex: 1 }]}>
                Exercise Checklist
              </Text>
            </View>
          </View>

          {/* Exercise Checklist */}
          
          <View style={{ padding: 20 }}>
            {activeWorkout.workout.exercises_list.map((exercise, index) => {
              const exerciseProgress = getExerciseProgress(index);
              const isCompleted = activeWorkout.exercisesCompleted[index];
              
              return (
                <View key={index} style={styles.exerciseChecklistItem}>
                  <View style={styles.exerciseChecklistRow}>
                    <View style={styles.exerciseChecklistInfo}>
                      <Text style={[styles.surfaceText, { fontSize: 16 }]}>
                        {exercise.name}
                      </Text>
                      <Text style={[styles.surfaceVariantText, { fontSize: 14 }]}>
                        {exercise.sets.length} sets • {Math.round(exerciseProgress * 100)}% complete
                      </Text>
                    </View>
                    <View style={[
                      styles.statusPill,
                      { backgroundColor: isCompleted ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
                    ]}>
                      <Text style={{ 
                        fontSize: 12, 
                        fontWeight: '600',
                        color: isCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                      }}>
                        {isCompleted ? '✓ Done' : '⏳ Pending'}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.exerciseProgressBar,
                    { backgroundColor: theme.colors.surfaceVariant }
                  ]}>
                    <View style={{ 
                      backgroundColor: isCompleted ? theme.colors.primary : theme.colors.outline,
                      height: '100%',
                      borderRadius: 3,
                      width: `${exerciseProgress * 100}%`,
                    }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Surface>

      {/* All Exercises - Modern Cards */}
      {activeWorkout.workoutStarted && (
        <View style={styles.workoutsContainer}>
          <Text style={[styles.surfaceText, styles.sectionTitle, { marginBottom: 16 }]}>
            Workout Exercises
          </Text>
          
          {activeWorkout.workout.exercises_list.map((exercise, exerciseIndex) => {
            const isCompleted = activeWorkout.exercisesCompleted[exerciseIndex];
            const exerciseProgress = getExerciseProgress(exerciseIndex);
            
            return (
              <Surface 
                key={exerciseIndex} 
                style={[
                  styles.workoutCard, 
                  { 
                    marginBottom: 16,
                    backgroundColor: theme.colors.surface,
                  }
                ]}
              >
                <View style={{ overflow: 'hidden' }}>
                  <View style={[
                    styles.currentExerciseHeader,
                    { 
                      backgroundColor: theme.colors.surfaceVariant,
                      borderRadius: 16,
                      padding: 20,
                    }
                  ]}>
                    <View style={[styles.rowBetweenCenter, { marginBottom: 16 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.surfaceText, styles.currentExerciseTitle]}>
                          {exercise.name}
                        </Text>
                        <Text style={[styles.surfaceVariantText, { fontSize: 14 }]}>
                          {exercise.sets.length} sets
                        </Text>
                      </View>
                      <View style={[
                        styles.currentExerciseBadge,
                        { 
                          backgroundColor: isCompleted ? theme.colors.primaryContainer : theme.colors.surfaceVariant
                        }
                      ]}>
                        <Text style={{ 
                          fontSize: 14, 
                          fontWeight: '600',
                          color: isCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant
                        }}>
                          {isCompleted ? '✓ Done' : 'Active'}
                        </Text>
                      </View>
                    </View>
                    
                    {exercise.description && (
                      <Text style={[
                        styles.surfaceVariantText, 
                        { 
                          fontSize: 14, 
                          fontStyle: 'italic',
                          lineHeight: 20,
                        }
                      ]}>
                        {exercise.description}
                      </Text>
                    )}
                    
                    {/* Progress Bar */}
                    <View style={[
                      styles.exerciseProgressBar,
                      { 
                        backgroundColor: theme.colors.surfaceVariant,
                        marginTop: 12,
                      }
                    ]}>
                      <View style={{ 
                        backgroundColor: isCompleted ? theme.colors.primary : theme.colors.outline,
                        height: '100%',
                        borderRadius: 3,
                        width: `${exerciseProgress * 100}%`,
                      }} />
                    </View>
                    
                    {/* Sets Display */}
                    <View style={styles.sectionContainer}>
                      <Text style={[styles.surfaceVariantText, styles.sectionTitle]}>
                        Sets:
                      </Text>
                      {exercise.sets.map((set, setIndex) => {
                        const parsedSet = parseSet(set, setIndex);
                        const isSetCompleted = activeWorkout.completedSets.some(
                          completedSet => 
                            completedSet.exerciseName === exercise.name && 
                            completedSet.setNumber === parsedSet.setNumber
                        );
                        
                        return (
                          <Card key={setIndex} style={[
                            styles.workoutCard,
                            { backgroundColor: isSetCompleted ? theme.colors.primaryContainer : theme.colors.surface }
                          ]}>
                            <Card.Content style={styles.cardContentMd}>
                              <View style={[styles.rowBetweenCenter, { marginBottom: 12 }]}>
                                <Text style={[
                                  styles.surfaceVariantText, 
                                  styles.surfaceText,
                                  { fontSize: 16, color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
                                ]}>
                                  Set {parsedSet.setNumber}
                                </Text>
                                <Button
                                  mode={isSetCompleted ? "contained" : "outlined"}
                                  onPress={() => toggleSetCompletion(exercise.name, parsedSet.setNumber)}
                                  style={styles.setCompletionButton}
                                  labelStyle={[styles.statLabel, { 
                                    fontSize: 11,
                                    textAlign: 'center',
                                    includeFontPadding: false,
                                  }]}
                                  contentStyle={{ 
                                    minHeight: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}
                                >
                                  {isSetCompleted ? 'Completed' : 'Complete'}
                                </Button>
                              </View>
                              
                              <View style={[styles.rowBetweenCenter, { paddingVertical: 8 }]}>
                                <View style={{ alignItems: 'center', minWidth: 60 }}>
                                  <Text style={[
                                    styles.surfaceVariantText, 
                                    styles.statLabel,
                                    { color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }
                                  ]}>
                                    Reps
                                  </Text>
                                  <Text style={[
                                    styles.surfaceVariantText, 
                                    styles.surfaceText,
                                    { fontSize: 14, color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
                                  ]}>
                                    {parsedSet.reps || '-'}
                                  </Text>
                                </View>
                                
                                <View style={{ alignItems: 'center', minWidth: 60 }}>
                                  <Text style={[
                                    styles.surfaceVariantText, 
                                    styles.statLabel,
                                    { color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }
                                  ]}>
                                    Weight
                                  </Text>
                                  <Text style={[
                                    styles.surfaceVariantText, 
                                    styles.surfaceText,
                                    { fontSize: 14, color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
                                  ]}>
                                    {parsedSet.weight === '' || parsedSet.weight === '0' ? 'Bodyweight' : `${parsedSet.weight} lbs`}
                                  </Text>
                                </View>
                                
                                <View style={{ alignItems: 'center', minWidth: 60 }}>
                                  <Text style={[
                                    styles.surfaceVariantText, 
                                    styles.statLabel,
                                    { color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }
                                  ]}>
                                    Time
                                  </Text>
                                  <Text style={[
                                    styles.surfaceVariantText, 
                                    styles.surfaceText,
                                    { fontSize: 14, color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
                                  ]}>
                                    {parsedSet.time || '-'}s
                                  </Text>
                                </View>
                              </View>
                              
                              {/* Rest Timer Section */}
                              {parsedSet.rest && parsedSet.rest !== '0' && (
                                <View style={{
                                  marginTop: 12,
                                  paddingTop: 12,
                                  borderTopWidth: 1,
                                  borderTopColor: theme.colors.outline,
                                }}>
                                  <View style={[styles.rowBetweenCenter, { marginBottom: 8 }]}>
                                    <Text style={[
                                      styles.surfaceVariantText, 
                                      styles.statLabel,
                                      { color: isSetCompleted ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }
                                    ]}>
                                      Rest Timer
                                    </Text>
                                    {activeWorkout.isResting && 
                                     activeWorkout.currentRestTime > 0 && 
                                     activeWorkout.completedSets.some(set => 
                                       set.exerciseName === exercise.name && 
                                       set.setNumber === parsedSet.setNumber
                                     ) ? (
                                      <Text style={[
                                        styles.surfaceVariantText,
                                        styles.surfaceText,
                                        { 
                                          fontSize: 16,
                                          color: theme.colors.primary,
                                          fontFamily: 'monospace'
                                        }
                                      ]}>
                                        {Math.floor(activeWorkout.currentRestTime / 60)}:{(activeWorkout.currentRestTime % 60).toString().padStart(2, '0')}
                                      </Text>
                                    ) : (
                                      <Text style={[
                                        styles.surfaceVariantText,
                                        { fontSize: 14 }
                                      ]}>
                                        {parsedSet.rest}s
                                      </Text>
                                    )}
                                  </View>
                                  
                                  {activeWorkout.isResting && activeWorkout.currentRestTime > 0 && (
                                    <Button
                                      mode="contained"
                                      onPress={skipRest}
                                      style={{ width: '100%' }}
                                      labelStyle={styles.statLabel}
                                      compact
                                    >
                                      Skip Rest
                                    </Button>
                                  )}
                                </View>
                              )}
                            </Card.Content>
                          </Card>
                        );
                      })}
                    </View>
                  </View>

                  {/* Action Buttons - Show for all exercises */}
                  <View style={styles.formContainer}>
                    <View style={styles.formGap}>
                      <View style={styles.timeRow}>
                        <Button
                          mode="outlined"
                          onPress={() => {/* TODO: Open edit modal */}}
                          icon="pencil"
                          contentStyle={{ paddingVertical: 16 }}
                          labelStyle={{ fontSize: 18, fontWeight: '600' }}
                          style={[styles.secondaryButton, { flex: 1, marginLeft: 16 }]}
                        >
                          Edit Set
                        </Button>
                      </View>
                    </View>
                  </View>
                </View>
              </Surface>
            );
          })}
        </View>
      )}

      {/* Completed Sets - Modern Design */}
      {activeWorkout.completedSets.length > 0 && (
        <Surface style={[styles.workoutsContainer, { margin: 20, elevation: 6 }]}>
          <View style={{ overflow: 'hidden' }}>
            <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <IconButton icon="history" size={24} iconColor={theme.colors.primary} />
                <Text style={[styles.surfaceText, { fontSize: 18, flex: 1 }]}>
                  Completed Sets ({activeWorkout.completedSets.length})
                </Text>
              </View>
              <IconButton 
                icon={showHistory ? "chevron-up" : "chevron-down"} 
                size={24} 
                iconColor={theme.colors.primary}
                onPress={() => setShowHistory(!showHistory)}
              />
            </View>
            
            {showHistory && (
              <View style={{ padding: 20 }}>
                {activeWorkout.completedSets.map((set, index) => (
                  <View key={index} style={[styles.exerciseRow, { marginBottom: 12 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.surfaceText, { fontSize: 16 }]}>
                          {set.exerciseName} - Set {set.setNumber}
                        </Text>
                        <Text style={[styles.surfaceVariantText, { fontSize: 12, marginTop: 4 }]}>
                          {set.timestamp.toLocaleTimeString()}
                        </Text>
                        {set.notes && (
                          <Text style={[styles.surfaceVariantText, { 
                            fontSize: 12, 
                            fontStyle: 'italic', 
                            marginTop: 8,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            padding: 8,
                            borderRadius: 24,
                          }]}>
                            "{set.notes}"
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.surfaceText, { fontSize: 14 }]}>
                          {set.actualReps} reps • {set.actualWeight}
                        </Text>
                        <Text style={[styles.surfaceVariantText, { fontSize: 12 }]}>
                          {set.actualTime}s • {set.actualRest}s rest
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Surface>
      )}

      {/* Modern Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Button
          mode="outlined"
          onPress={() => {
            // Capture the final workout duration and completion data
            const completedWorkout = {
              ...activeWorkout.workout,
              completed: true,
              duration: formatTime(localWorkoutTime), // Update duration with actual workout time
            };
            onUpdateWorkout(completedWorkout);
            onClose();
          }}
          icon="stop"
          contentStyle={{ paddingVertical: 16 }}
          labelStyle={{ fontSize: 16, fontWeight: '600' }}
          style={[styles.secondaryButton, { borderWidth: 2 }]}
        >
          End Workout
        </Button>
      </View>

      </ScrollView>


    </View>
  );
}
