import AddWorkoutModal from '@/components/plans/AddWorkoutModal';
import EditPlanModal from '@/components/plans/EditPlanModal';
import WorkoutCard from '@/components/plans/WorkoutCard';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { WorkoutPlan, useWorkout } from './WorkoutContext';
import { createPlanStyles } from './styles';



interface PlanDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  plan: WorkoutPlan;
  openAddWorkout?: boolean;
}

function PlanDetailsModal({ visible, onDismiss, plan, openAddWorkout = false }: PlanDetailsModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const { currentPlan, workouts, updatePlan, updateWorkouts, addWorkout, allPlans, deleteWorkout, deletePlan, startPlanDeletion, deletingPlans } = useWorkout();

  // Get the updated plan data from context instead of using the prop
  const updatedPlan = allPlans.find(p => p.planID === plan.planID) || plan;
  
  // Check if this plan is being deleted
  const isDeleting = deletingPlans.includes(updatedPlan.planID);

  // Filter workouts to only show those belonging to this plan and sort by date (earliest first)
  const planWorkouts = workouts
    .filter(workout => workout.planId === updatedPlan.planID)
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  const [expandedWorkouts, setExpandedWorkouts] = useState<{ [key: string]: boolean }>({});
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Reset expanded workouts when modal opens
  useEffect(() => {
    if (visible) {
      setExpandedWorkouts({});
    }
  }, [visible]);

  // Auto-open add workout modal if requested
  useEffect(() => {
    if (visible && openAddWorkout) {
      setShowAddWorkout(true);
    }
  }, [visible, openAddWorkout]);

  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prev => ({
      ...prev,
      [workoutId]: !prev[workoutId]
    }));
  };

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


    try {
      await addWorkout(workout, updatedPlan.planID); // Pass the plan ID
      
      setShowAddWorkout(false);
      resetForm();
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  // Handle plan deletion
  const handlePlanDeleted = () => {
    
    setShowEditPlan(false);
    onDismiss();
  };

  const handleDelete = async () => {
    try {
      
      
      // Close the confirmation dialog but keep modal open
      setShowDeleteConfirm(false);
      
      // Mark plan as deleting
      startPlanDeletion(updatedPlan.planID);
      
      // Delete all workouts associated with this plan
      const planWorkouts = workouts.filter(workout => workout.planId === updatedPlan.planID);
      
      
      for (const workout of planWorkouts) {
        await deleteWorkout(workout.id);
      }
      
      // Delete the plan itself
      await deletePlan(updatedPlan.planID);
      
      
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
                 <Surface style={[styles.planDetailsModal, { position: 'relative' }]}>
                      <View style={[styles.modalHeader, { zIndex: 20 }]}>
             <Text variant="headlineMedium" style={[styles.primaryText, { paddingRight: 72 }]}>
               {updatedPlan.name} • {updatedPlan.duration} Weeks
               {isDeleting && (
                 <Text style={{ color: theme.colors.error, fontSize: 14, marginLeft: 8 }}>
                   (Deleting...)
                 </Text>
               )}
             </Text>
                         <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row' }}>
               <IconButton 
                 icon="pencil" 
                 onPress={() => setShowEditPlan(true)} 
                 disabled={isDeleting}
               />
               <IconButton icon="close" onPress={onDismiss} />
             </View>
          </View>
                     <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
             <View style={{ padding: 16, position: 'relative' }}>
               {isDeleting && (
                 <View style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   right: 0,
                   bottom: 0,
                   backgroundColor: 'rgba(128, 128, 128, 0.3)',
                   zIndex: 10,
                   pointerEvents: 'none'
                 }} />
               )}
              <Text variant="headlineSmall" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>Goal:</Text>
              <View style={styles.goaltextbox}> 
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>{updatedPlan.goal}</Text>
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
               <TouchableOpacity 
                 onPress={() => setShowAddWorkout(true)} 
                 style={styles.addWorkoutContent}
                 disabled={isDeleting}
               >
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

                         {/* Delete Plan Button */}
             <Card style={[styles.addWorkoutCard, { marginTop: 16 }]} mode="outlined">
               <TouchableOpacity 
                 onPress={() => setShowDeleteConfirm(true)} 
                 style={styles.addWorkoutContent}
                 disabled={isDeleting}
               >
                <IconButton
                  icon="delete"
                  size={32}
                  iconColor={theme.colors.error}
                />
                <Text variant="titleMedium" style={[styles.primaryTextRegular, { marginTop: 8, color: theme.colors.error }]}>
                  Delete Plan
                </Text>
                <Text variant="bodySmall" style={[styles.surfaceVariantText, styles.centeredText, { marginTop: 4 }]}>
                  Permanently delete this plan and all workouts
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
            
            <EditPlanModal
              visible={showEditPlan}
              plan={updatedPlan}
              onDismiss={() => setShowEditPlan(false)}
              onUpdate={(updatedPlan) => {
                
                setShowEditPlan(false);
              }}
            />
            
            {/* Delete Confirmation Modal */}
            <Modal visible={showDeleteConfirm} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <Surface style={[styles.planDetailsModal, { maxHeight: '40%' }]}>
                  <View style={styles.modalHeader}>
                    <Text variant="headlineMedium" style={styles.primaryText}>Delete Plan</Text>
                  </View>
                  <View style={{ padding: 16 }}>
                    <Text variant="bodyLarge" style={styles.primaryTextRegular}>
                      Are you sure you want to delete "{updatedPlan.name}"? This action cannot be undone and will delete all workouts in this plan.
                    </Text>
                    <View style={[styles.submitContainer, { marginTop: 24 }]}>
                      <Button
                        mode="outlined"
                        onPress={() => setShowDeleteConfirm(false)}
                        style={[styles.submitButton, { marginBottom: 12 }]}
                        contentStyle={styles.submitButtonContent}
                      >
                        Cancel
                      </Button>
                      <Button
                        mode="contained"
                        onPress={handleDelete}
                        style={styles.submitButton}
                        contentStyle={styles.submitButtonContent}
                        buttonColor={theme.colors.error}
                      >
                        Delete
                      </Button>
                    </View>
                  </View>
                </Surface>
              </View>
            </Modal>
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}

export default PlanDetailsModal;