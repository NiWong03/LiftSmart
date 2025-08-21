import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Card, Checkbox, FAB, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { createPlanStyles } from '../styles';
import { Workout } from './WorkoutContext';

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
}

export default function ActiveWorkoutModal({
  activeWorkout,
  onClose,
  onUpdateWorkout,
  onCompleteWorkout
}: ActiveWorkoutModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentRest, setCurrentRest] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExerciseList, setShowExerciseList] = useState(false);

  // Timer refs
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start workout timers
  useEffect(() => {
    if (activeWorkout?.isActive && !activeWorkout.isPaused && activeWorkout.workoutStarted) {
      workoutTimerRef.current = setInterval(() => {
        // Timer logic will be handled by parent component
      }, 1000);
    }

    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [activeWorkout?.isActive, activeWorkout?.isPaused, activeWorkout?.workoutStarted]);

  // Start rest timer
  useEffect(() => {
    if (activeWorkout?.isResting && activeWorkout.currentRestTime > 0) {
      restTimerRef.current = setInterval(() => {
        // Rest timer logic will be handled by parent component
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [activeWorkout?.isResting, activeWorkout?.currentRestTime]);

  const startWorkoutTimer = () => {
    // This will be handled by parent component
  };

  const pauseWorkout = () => {
    // This will be handled by parent component
  };

  const resumeWorkout = () => {
    // This will be handled by parent component
  };

  const startRest = (restTime: number) => {
    // This will be handled by parent component
  };

  const skipRest = () => {
    // This will be handled by parent component
  };

  const toggleExerciseCompleted = (exerciseIndex: number) => {
    // This will be handled by parent component
  };

  const completeSet = () => {
    // This will be handled by parent component
  };

  const repeatWorkout = () => {
    // This will be handled by parent component
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
    
    const totalSets = activeWorkout.workout.exercises_list.reduce(
      (total, exercise) => total + exercise.sets.length, 
      0
    );
    
    return activeWorkout.completedSets.length / totalSets;
  };

  const getExerciseProgress = (exerciseIndex: number) => {
    if (!activeWorkout) return 0;
    
    const exercise = activeWorkout.workout.exercises_list[exerciseIndex];
    if (!exercise) return 0;
    
    const completedSetsForExercise = activeWorkout.completedSets.filter(
      set => set.exerciseName === exercise.name
    );
    
    return completedSetsForExercise.length / exercise.sets.length;
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

  const getWorkoutStats = () => {
    if (!activeWorkout) return null;
    
    const totalSets = activeWorkout.completedSets.length;
    const totalVolume = activeWorkout.completedSets.reduce((sum, set) => {
      const weight = parseFloat(set.actualWeight || '0') || 0;
      const reps = parseInt(set.actualReps || '0') || 0;
      return sum + (weight * reps);
    }, 0);
    
    const avgRestTime = activeWorkout.completedSets.reduce((sum, set) => {
      return sum + (parseInt(set.actualRest || '0') || 0);
    }, 0) / Math.max(totalSets, 1);
    
    const caloriesBurned = Math.round(totalVolume * 0.1 + activeWorkout.totalWorkoutTime * 0.1);
    const exercisesCompleted = activeWorkout.exercisesCompleted.filter(Boolean).length;
    
    return { totalSets, totalVolume, avgRestTime, caloriesBurned, exercisesCompleted };
  };

  const currentExercise = getCurrentExercise();
  const currentSet = getCurrentSet();
  const progress = getProgress();
  const stats = getWorkoutStats();

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
            ) : activeWorkout.isPaused ? (
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
              onPress={onClose}
              style={styles.headerButton}
            />
          </View>
        </View>
        
        {/* Modern Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatTime(activeWorkout.totalWorkoutTime)}
          </Text>
          <Text style={styles.timerLabel}>
            {!activeWorkout.workoutStarted ? 'Tap Play to Start' : 
             activeWorkout.isPaused ? 'PAUSED' : 'Workout Time'}
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
      {stats && (
        <View style={[styles.workoutsContainer, styles.statsContainer]}>
          <Card style={[styles.workoutCard, styles.statCard]}>
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.primaryText, styles.statNumber]}>
                {stats.totalSets}
              </Text>
              <Text style={[styles.surfaceVariantText, styles.statLabel]}>
                Sets
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.workoutCard, styles.statCard]}>
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.primaryText, styles.statNumber, { color: theme.colors.secondary }]}>
                {stats.exercisesCompleted}
              </Text>
              <Text style={[styles.surfaceVariantText, styles.statLabel]}>
                Exercises
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.workoutCard, styles.statCard]}>
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.primaryText, styles.statNumber, { color: theme.colors.tertiary }]}>
                {stats.caloriesBurned}
              </Text>
              <Text style={[styles.surfaceVariantText, styles.statLabel]}>
                Calories
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Exercise Checklist - Modern Design */}
      <Surface style={[styles.workoutsContainer, styles.checklistContainer]}>
        <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <IconButton icon="format-list-checks" size={24} iconColor={theme.colors.primary} />
            <Text style={[styles.surfaceText, { fontSize: 18, flex: 1 }]}>
              Exercise Checklist
            </Text>
          </View>
          <IconButton 
            icon={showExerciseList ? "chevron-up" : "chevron-down"} 
            size={24} 
            iconColor={theme.colors.primary}
            onPress={() => setShowExerciseList(!showExerciseList)}
          />
        </View>
        
        {showExerciseList && (
          <View style={{ padding: 20 }}>
            {activeWorkout.workout.exercises_list.map((exercise, index) => {
              const exerciseProgress = getExerciseProgress(index);
              const isCompleted = activeWorkout.exercisesCompleted[index];
              
              return (
                <View key={index} style={styles.exerciseChecklistItem}>
                  <View style={styles.exerciseChecklistRow}>
                    <Checkbox
                      status={isCompleted ? 'checked' : 'unchecked'}
                      onPress={() => toggleExerciseCompleted(index)}
                      disabled={!activeWorkout.workoutStarted}
                      color={theme.colors.primary}
                    />
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
                      width: `${exerciseProgress * 100}%`,
                      borderRadius: 3,
                    }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Surface>

      {/* Current Exercise - Modern Card */}
      {currentExercise && activeWorkout.workoutStarted && (
        <Surface style={[styles.workoutsContainer, styles.currentExerciseContainer]}>
          <View style={[
            styles.currentExerciseHeader,
            { backgroundColor: theme.colors.primaryContainer }
          ]}>
            <View style={[styles.rowBetweenCenter, { marginBottom: 16 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.onPrimaryText, styles.currentExerciseTitle]}>
                  {currentExercise.name}
                </Text>
                <Text style={styles.currentExerciseSetInfo}>
                  Set {activeWorkout.currentSetIndex + 1} of {currentExercise.sets.length}
                </Text>
              </View>
              <View style={styles.currentExerciseBadge}>
                <Text style={[styles.onPrimaryText, { fontSize: 14, fontWeight: '600' }]}>
                  {currentExercise.sets.length} sets
                </Text>
              </View>
            </View>
            
            {currentExercise.description && (
              <Text style={[styles.surfaceVariantText, { 
                fontSize: 14, 
                fontStyle: 'italic',
                lineHeight: 20,
              }]}>
                {currentExercise.description}
              </Text>
            )}
          </View>

          <View style={styles.formContainer}>
            {/* Modern Input Fields */}
            <View style={styles.formGap}>
              <View style={styles.timeRow}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={[styles.surfaceText, styles.formLabel]}>
                    Reps
                  </Text>
                  <TextInput
                    mode="outlined"
                    value={currentReps}
                    onChangeText={setCurrentReps}
                    keyboardType="numeric"
                    placeholder={currentSet ? currentSet[0].toString() : '0'}
                    left={<TextInput.Icon icon="numeric" />}
                    style={styles.textInput}
                    outlineStyle={styles.textInputStyle}
                  />
                </View>
                <View style={[styles.formField, { flex: 1, marginLeft: 16 }]}>
                  <Text style={[styles.surfaceText, styles.formLabel]}>
                    Weight
                  </Text>
                  <TextInput
                    mode="outlined"
                    value={currentWeight}
                    onChangeText={setCurrentWeight}
                    placeholder={currentSet ? currentSet[1] : '0'}
                    left={<TextInput.Icon icon="weight" />}
                    style={styles.textInput}
                    outlineStyle={styles.textInputStyle}
                  />
                </View>
              </View>
              
              <View style={styles.timeRow}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={[styles.surfaceText, styles.formLabel]}>
                    Time (sec)
                  </Text>
                  <TextInput
                    mode="outlined"
                    value={currentTime}
                    onChangeText={setCurrentTime}
                    keyboardType="numeric"
                    placeholder={currentSet ? currentSet[2].toString() : '0'}
                    left={<TextInput.Icon icon="timer" />}
                    style={styles.textInput}
                    outlineStyle={styles.textInputStyle}
                  />
                </View>
                <View style={[styles.formField, { flex: 1, marginLeft: 16 }]}>
                  <Text style={[styles.surfaceText, styles.formLabel]}>
                    Rest (sec)
                  </Text>
                  <TextInput
                    mode="outlined"
                    value={currentRest}
                    onChangeText={setCurrentRest}
                    keyboardType="numeric"
                    placeholder={currentSet ? currentSet[3].toString() : '0'}
                    left={<TextInput.Icon icon="pause" />}
                    style={styles.textInput}
                    outlineStyle={styles.textInputStyle}
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.surfaceText, styles.formLabel]}>
                  Notes (optional)
                </Text>
                <TextInput
                  mode="outlined"
                  value={currentNotes}
                  onChangeText={setCurrentNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="How did this set feel? Any adjustments needed?"
                  left={<TextInput.Icon icon="note-text" />}
                  style={styles.textInput}
                  outlineStyle={styles.textInputStyle}
                />
              </View>
            </View>

            {/* Modern Complete Button */}
            <Button
              mode="contained"
              onPress={completeSet}
              style={[styles.submitButton, { marginTop: 24 }]}
              icon="check-circle"
              contentStyle={styles.submitButtonContent}
              labelStyle={{ fontSize: 18, fontWeight: '700' }}
            >
              Complete Set
            </Button>
          </View>
        </Surface>
      )}

      {/* Completed Sets - Modern Design */}
      {activeWorkout.completedSets.length > 0 && (
        <Surface style={[styles.workoutsContainer, { margin: 20, elevation: 6, overflow: 'hidden' }]}>
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
        </Surface>
      )}

      {/* Modern Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Button
          mode="contained"
          onPress={repeatWorkout}
          icon="replay"
          contentStyle={{ paddingVertical: 16 }}
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
          style={[styles.primaryButton, { backgroundColor: theme.colors.secondary }]}
        >
          Repeat Workout
        </Button>
        <Button
          mode="outlined"
          onPress={onClose}
          icon="stop"
          contentStyle={{ paddingVertical: 16 }}
          labelStyle={{ fontSize: 16, fontWeight: '600' }}
          style={[styles.secondaryButton, { borderWidth: 2 }]}
        >
          End Workout
        </Button>
      </View>

      </ScrollView>

      {/* Modern FAB */}
      <FAB
        icon="plus"
        style={[
          styles.fabStyle,
          { backgroundColor: theme.colors.primary }
        ]}
        onPress={() => setShowExerciseList(!showExerciseList)}
      />
    </View>
  );
}
