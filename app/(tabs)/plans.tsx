import AddPlanModal from '@/components/plans/AddPlanModal';
import AllPlansCard from '@/components/plans/AllPlansCard';
import CurrentPlanOverview from '@/components/plans/CurrentPlanOverview';
import EmojiPicker from '@/components/plans/EmojiPicker';
import { createPlanStyles } from '@/components/plans/styles';
import { useWorkout, Workout } from '@/components/plans/WorkoutContext';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

const PlansScreen = () => {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const { currentPlan, workouts, updatePlan, updateWorkouts, addPlan, allPlans } = useWorkout();
  
  const [selectedEmoji, setSelectedEmoji] = useState(currentPlan.emoji);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [upcomingWorkout, setUpcomingWorkout] = useState<Workout | undefined>(undefined);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    goal: '',
    duration: 1,
    difficulty: 'AI Created',
    emoji: '💪',
    totalWorkouts: 12,
    workouts: [] as Workout[],
  });

  // Reset newPlan state when modal opens/closes
  useEffect(() => {
    if (showAddPlan) {
      console.log('Modal opening - resetting newPlan state');
      setNewPlan({
        name: '',
        goal: '',
        duration: 1,
        difficulty: 'AI Created',
        emoji: '💪',
        totalWorkouts: 12,
        workouts: [] as Workout[],
      });
    }
  }, [showAddPlan]);
  
  useEffect(
    () => {
      console.log(currentPlan.workoutsCompleted)
      // console.log('Reloading');
      const now = new Date();
      const chosenWorkout = workouts
        .filter(w => {
          const workoutDate = w.date instanceof Timestamp ? w.date.toDate() : new Date(w.date);
          return workoutDate > now && 
                 workoutDate.getDate() === now.getDate() && 
                 w.completed === false;
        })
        .sort((a,b) => {
          const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
          const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        })[0]
      setUpcomingWorkout(chosenWorkout)
    }
  , [workouts])

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    updatePlan({ ...currentPlan, emoji });
    setShowEmojiPicker(false);
  };

  const handleSubmitPlan = async (planData?: any) => {
    const planToSubmit = planData || newPlan;
    
    if (!planToSubmit.name.trim() || !planToSubmit.goal.trim()) return;
    
    console.log('=== PLAN SUBMISSION DEBUG ===');
    console.log('Submitting plan with workouts:', planToSubmit.workouts?.length || 0);
    console.log('Workouts data:', planToSubmit.workouts);
    console.log('Full plan object:', planToSubmit);
    
    // Create the new plan (you'll need to add this to WorkoutContext)
    const plan = {
      ...planToSubmit,
      current: false,
      progress: '0%',
      workoutsCompleted: 0,
    };
    
    console.log('Plan object to be created:', plan);
    console.log('Workouts to be passed to addPlan:', planToSubmit.workouts);
    
    try {
      console.log('Calling addPlan...');
      await addPlan(plan, planToSubmit.workouts);
      console.log('addPlan completed successfully');
      console.log('Plans:', allPlans.map(plan => plan.name));
      setShowAddPlan(false);
      
      // Reset form
      setNewPlan({
        name: '',
        goal: '',
        duration: 1,
        difficulty: 'Beginner',
        emoji: '💪',
        totalWorkouts: 12,
        workouts: [] as Workout[],
      });
      console.log('Form reset completed');
    } catch (error) {
      console.error('Error submitting plan:', error);
    }
  };


  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* -----------Current Plan Overview--------- */}
          <CurrentPlanOverview
            selectedEmoji={selectedEmoji}
            onEmojiPress={() => setShowEmojiPicker(true)}
          />

          {/* Plans List */}
          <AllPlansCard />

          <Card style={[styles.workoutCard, {marginBottom: -2,}]} mode="outlined">
            <TouchableOpacity onPress={() => setShowAddPlan(true)} style={[styles.addWorkoutContent, {marginTop: -16}]}>
              <IconButton
                icon="plus-circle-outline"
                size={32}
                iconColor={theme.colors.primary}
              />
              <Text variant="titleMedium" style={[styles.primaryTextRegular, { marginTop: -12}]}>
                Add New Plan
              </Text>
            </TouchableOpacity>
          </Card>
        </View>


      </ScrollView>

      {/* Emoji Picker Modal */}
      <EmojiPicker
        visible={showEmojiPicker}
        selectedEmoji={selectedEmoji}
        onSelectEmoji={handleEmojiSelect}
        onDismiss={() => setShowEmojiPicker(false)}
      />
      <AddPlanModal
        visible={showAddPlan}
        newPlan={newPlan}
        onPlanChange={setNewPlan}
        onSubmit={handleSubmitPlan}
        onDismiss={() => {
          console.log('Modal closing - resetting newPlan state');
          setNewPlan({
            name: '',
            goal: '',
            duration: 1,
            difficulty: 'AI Created',
            emoji: '💪',
            totalWorkouts: 12,
            workouts: [] as Workout[],
          });
          setShowAddPlan(false);
        }}
      />
    </View>
  );
};

export default PlansScreen;