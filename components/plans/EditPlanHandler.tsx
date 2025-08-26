import React from 'react';
import { Modal, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { useWorkout, WorkoutPlan, Workout } from './WorkoutContext';
import { createPlanStyles } from './styles';
import { Timestamp } from 'firebase/firestore';

interface EditPlanHandlerProps {
  visible: boolean;
  aiResponse: any;
  onDismiss: () => void;
  onComplete: () => void;
}

export default function EditPlanHandler({ 
  visible, 
  aiResponse, 
  onDismiss, 
  onComplete 
}: EditPlanHandlerProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const { currentPlan, workouts, updatePlan, updateWorkout, addWorkout, deleteWorkout } = useWorkout();

  const handleApplyChanges = async () => {
    try {
      if (!aiResponse) {
        console.error('No AI response available');
        return;
      }
      
      const currentPlanWorkouts = workouts.filter(w => w.planId === currentPlan.planID);

      // Handle new response format with workoutsToUpdate
      if (aiResponse.workoutsToUpdate && aiResponse.workoutIds) {
        console.log('Processing targeted workout updates');
        
        // Update only the specific workouts that were modified
        for (const workoutUpdate of aiResponse.workoutsToUpdate) {
          const existingWorkout = currentPlanWorkouts.find(w => w.id === workoutUpdate.id);
          
          if (existingWorkout) {
            // Prepare updates for this workout
            const workoutUpdates: any = {};
            
            // Only update exercises_list if provided
            if (workoutUpdate.exercises_list) {
              console.log('DEBUG - Processing exercises_list:', workoutUpdate.exercises_list);
              
              // Convert nested arrays to objects for Firebase compatibility
              const processedExercises = workoutUpdate.exercises_list.map((exercise: any) => {
                console.log('DEBUG - Processing exercise:', exercise.name, 'with sets:', exercise.sets);
                
                const processedSets = exercise.sets?.map((set: any) => {
                  console.log('DEBUG - Processing set:', set);
                  const processedSet = {
                    reps: set[0] || 0,
                    weight: set[1] || '', // Don't default to 'bodyweight' for empty strings
                    time: set[2] || 0,
                    rest: set[3] || 0
                  };
                  console.log('DEBUG - Processed set:', processedSet);
                  return processedSet;
                }) || [];
                
                console.log('DEBUG - Final processed sets:', processedSets);
                
                return {
                  ...exercise,
                  sets: processedSets
                };
              });
              
              console.log('DEBUG - Final processed exercises:', processedExercises);
              
              workoutUpdates.exercises = processedExercises.length || 0;
              workoutUpdates.exercises_list = processedExercises;
            }
            
            // Update other fields if provided
            if (workoutUpdate.name !== undefined) workoutUpdates.name = workoutUpdate.name;
            if (workoutUpdate.day !== undefined) workoutUpdates.day = workoutUpdate.day;
            if (workoutUpdate.date !== undefined) workoutUpdates.date = new Date(workoutUpdate.date);
            if (workoutUpdate.startTime !== undefined) workoutUpdates.startTime = workoutUpdate.startTime;
            if (workoutUpdate.endTime !== undefined) workoutUpdates.endTime = workoutUpdate.endTime;
            if (workoutUpdate.difficulty !== undefined) workoutUpdates.difficulty = workoutUpdate.difficulty;
            
            await updateWorkout(workoutUpdate.id, workoutUpdates);
          }
        }
      } else if (aiResponse.plan) {
        // Handle legacy format (fallback)
        console.log('Processing legacy plan format');
        
        const updatedPlan = aiResponse.plan;
        
        // Update plan details
        await updatePlan({
          name: updatedPlan.name,
          goal: updatedPlan.goal,
          duration: updatedPlan.duration,
          difficulty: updatedPlan.difficulty,
          emoji: updatedPlan.emoji,
          planID: currentPlan.planID,
        });

        // Process workout changes
        const updatedWorkouts = updatedPlan.workouts || [];
        
        // Find workouts to add (new workouts without existing IDs)
        const newWorkouts = updatedWorkouts.filter((w: any) => !w.id || !currentPlanWorkouts.find(cw => cw.id === w.id));
        
        // Find workouts to update (existing workouts with changes)
        const workoutsToUpdate = updatedWorkouts.filter((w: any) => 
          w.id && currentPlanWorkouts.find(cw => cw.id === w.id)
        );
        
        // Find workouts to delete (existing workouts not in updated plan)
        const workoutsToDelete = currentPlanWorkouts.filter(cw => 
          !updatedWorkouts.find((w: any) => w.id === cw.id)
        );

        // Apply changes for legacy format
        for (const workout of newWorkouts) {
          // Convert nested arrays to objects for Firebase compatibility
          const processedExercises = (workout.exercises_list || []).map((exercise: any) => ({
            ...exercise,
            sets: exercise.sets?.map((set: any) => ({
              reps: set[0] || 0,
              weight: set[1] || '', // Don't default to 'bodyweight' for empty strings
              time: set[2] || 0,
              rest: set[3] || 0
            })) || []
          }));

          // Ensure all required fields have valid values
          const newWorkoutData = {
            name: workout.name || 'New Workout',
            day: workout.day || 'Monday',
            date: workout.date ? new Date(workout.date) : new Date(),
            startTime: workout.startTime || '9:00 AM',
            endTime: workout.endTime || '10:00 AM',
            duration: workout.duration || '1 hour',
            difficulty: workout.difficulty || 'Medium',
            exercises: processedExercises.length || 0,
            completed: false,
            exercises_list: processedExercises,
          };
          
          await addWorkout(newWorkoutData, currentPlan.planID);
        }

        for (const workout of workoutsToUpdate) {
          // Filter out undefined values to prevent Firebase errors
          const workoutUpdates: any = {};
          
          if (workout.name !== undefined) workoutUpdates.name = workout.name;
          if (workout.day !== undefined) workoutUpdates.day = workout.day;
          if (workout.date !== undefined) workoutUpdates.date = new Date(workout.date);
          if (workout.startTime !== undefined) workoutUpdates.startTime = workout.startTime;
          if (workout.endTime !== undefined) workoutUpdates.endTime = workout.endTime;
          if (workout.duration !== undefined) workoutUpdates.duration = workout.duration;
          if (workout.difficulty !== undefined) workoutUpdates.difficulty = workout.difficulty;
          if (workout.exercises_list !== undefined) {
            // Convert nested arrays to objects for Firebase compatibility
            const processedExercises = workout.exercises_list.map((exercise: any) => ({
              ...exercise,
              sets: exercise.sets?.map((set: any) => ({
                reps: set[0] || 0,
                weight: set[1] || '', // Don't default to 'bodyweight' for empty strings
                time: set[2] || 0,
                rest: set[3] || 0
              })) || []
            }));
            
            workoutUpdates.exercises = processedExercises.length || 0;
            workoutUpdates.exercises_list = processedExercises;
          }
          
          await updateWorkout(workout.id, workoutUpdates);
        }

        for (const workout of workoutsToDelete) {
          await deleteWorkout(workout.id);
        }
      }

      onComplete();
    } catch (error) {
      console.error('Error applying plan changes:', error);
    }
  };

  const getChangeSummary = () => {
    if (!aiResponse) {
      return 'No changes available';
    }
    
    // Handle new response format
    if (aiResponse.workoutsToUpdate && aiResponse.workoutIds) {
      return `Update ${aiResponse.workoutIds.length} workout(s): ${aiResponse.response || 'Modified exercises'}`;
    }
    
    // Handle legacy format
    if (aiResponse.plan) {
      const updatedPlan = aiResponse.plan;
      const currentPlanWorkouts = workouts.filter(w => w.planId === currentPlan.planID);
      const updatedWorkouts = updatedPlan.workouts || [];
      
      const changes = [];
      
      // Plan changes
      if (updatedPlan.name !== currentPlan.name) changes.push(`Plan name: "${currentPlan.name}" → "${updatedPlan.name}"`);
      if (updatedPlan.goal !== currentPlan.goal) changes.push(`Goal updated`);
      if (updatedPlan.difficulty !== currentPlan.difficulty) changes.push(`Difficulty: "${currentPlan.difficulty}" → "${updatedPlan.difficulty}"`);
      if (updatedPlan.duration !== currentPlan.duration) changes.push(`Duration: ${currentPlan.duration} → ${updatedPlan.duration} weeks`);
      
      // Workout changes
      const newWorkouts = updatedWorkouts.filter((w: any) => !w.id || !currentPlanWorkouts.find(cw => cw.id === w.id));
      const workoutsToDelete = currentPlanWorkouts.filter(cw => !updatedWorkouts.find((w: any) => w.id === cw.id));
      
      if (newWorkouts.length > 0) changes.push(`Add ${newWorkouts.length} new workout(s)`);
      if (workoutsToDelete.length > 0) changes.push(`Remove ${workoutsToDelete.length} workout(s)`);
      
      return changes.length > 0 ? changes.join(', ') : 'No changes detected';
    }
    
    return 'No changes available';
  };

  // Don't render if no valid AI response
  if (!aiResponse || (!aiResponse.plan && !aiResponse.workoutsToUpdate)) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Surface style={[styles.planDetailsModal, { maxHeight: '60%' }]} elevation={5}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              Review Plan Changes
            </Text>
          </View>
          
          <View style={{ padding: 16, flex: 1 }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              {aiResponse.response || 'The AI has suggested changes to your plan:'}
            </Text>
            
            <Surface style={[styles.planFocusContainer, { marginBottom: 16 }]} elevation={1}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {getChangeSummary()}
              </Text>
            </Surface>
            
            <View style={styles.submitContainer}>
              <Button
                mode="contained"
                onPress={handleApplyChanges}
                style={[styles.submitButton, { marginBottom: 12 }]}
                contentStyle={styles.submitButtonContent}
              >
                Apply Changes
              </Button>
              
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
              >
                Cancel
              </Button>
            </View>
          </View>
        </Surface>
      </View>
    </Modal>
  );
}
