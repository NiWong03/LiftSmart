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

  const handleSubmitPlan = () => {
    if (!newPlan.name.trim() || !newPlan.goal.trim()) return;
    
    // Create the new plan (you'll need to add this to WorkoutContext)
    const plan = {
      ...newPlan,
      current: false,
      progress: '0%',
      workoutsCompleted: 0,
    };
    
    // Add plan creation logic here
    addPlan(plan)
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
        onDismiss={() => setShowAddPlan(false)}
      />
    </View>
  );
};

export default PlansScreen;