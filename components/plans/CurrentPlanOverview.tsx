import PlanDetailsModal from '@/components/plans/PlanDetailsModal';
import { useWorkout, Workout } from '@/components/plans/WorkoutContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';


interface CurrentPlanOverviewProps {
  selectedEmoji: string;
  onEmojiPress: () => void;
}



export default function CurrentPlanOverview({ selectedEmoji, onEmojiPress }: CurrentPlanOverviewProps) {
  const theme = useTheme();
  const { currentPlan, workouts } = useWorkout();
  const styles = createPlanStyles(theme);
  const [upcomingWorkout, setUpcomingWorkout] = useState<Workout | undefined>(undefined);
  const params = useLocalSearchParams();
  

  useEffect(
    () => {
      console.log(currentPlan.workoutsCompleted)
      // console.log('Reloading');
      const now = new Date();
      const chosenWorkout = workouts
        .filter(w => {
          const workoutDate = w.date instanceof Timestamp ? w.date.toDate() : w.date;
          return workoutDate > now && 
                 workoutDate.getDate() === now.getDate() && 
                 w.completed === false;
        })
        .sort((a,b) => {
          const dateA = a.date instanceof Timestamp ? a.date.toDate() : a.date;
          const dateB = b.date instanceof Timestamp ? b.date.toDate() : b.date;
          return dateA.getTime() - dateB.getTime();
        })[0]
      setUpcomingWorkout(chosenWorkout)
    }
  , [workouts])

    // Plan Details Modal--------------------------------
    const [showPlanDetails, setShowPlanDetails] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(currentPlan);

    // Auto-open plan details if requested
    useEffect(() => {
      if (params.openDetails === 'true') {
        setShowPlanDetails(true);
        // Clear the URL parameter after opening the modal
        router.replace('/plans');
      }
    }, [params.openDetails]);

  return (
    <Surface style={styles.planOverviewContainer} elevation={2}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text variant="headlineSmall" style={styles.primaryText}>
            {currentPlan.name}
          </Text>
          <Text variant="bodyMedium" style={[styles.surfaceVariantText, { marginTop: 4 }]}>
            Progress bar here • {currentPlan.duration} weeks
          </Text> 
          <View style={styles.planBadges}>
            <Chip mode="outlined" style={{ marginRight: 8 }}>
              {currentPlan.difficulty}
            </Chip>
            <Chip icon="check-circle" textStyle={styles.chipTextPrimary}>
              {currentPlan.workoutsCompleted}/{currentPlan.totalWorkouts} completed
            </Chip>
          </View>
        </View>
        <TouchableOpacity 
          onPress={onEmojiPress}
          style={styles.emojiContainer}
        >
          <Text style={styles.planEmoji}>{selectedEmoji}</Text>
          <View style={styles.editIndicator}>
            <IconButton
              icon="pencil"
              size={12}
              iconColor={theme.colors.onPrimary}
            />
          </View>
        </TouchableOpacity>
      </View>
      
      <Divider style={{ marginVertical: 16 }} />

      <View style={styles.planFocusContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,}}>
                <View>
                  <Text variant="titleLarge" style={{ color: '#666666', fontWeight: 'bold' }}>
                    Today's Focus
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {upcomingWorkout ? upcomingWorkout.name : 'No workout scheduled for today'}
                  </Text>
                </View>
                <Avatar.Icon
                  size={48}
                  icon="dumbbell"
                  style={{ borderRadius: 12, backgroundColor: theme.colors.primaryContainer }}
                  color={theme.colors.onPrimaryContainer}
                />
              </View>

              {upcomingWorkout ? (
                <>
                  {/* Workout details */}
                  <View style={styles.workoutDetails}>
                    <View style={{alignItems: 'center'}}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Duration
                      </Text>
                      <Text variant="titleLarge" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
                        {upcomingWorkout.duration}
                      </Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <Text variant="bodySmall" style={{ paddingVertical: 4, color: theme.colors.onSurfaceVariant }}>
                        Intensity
                      </Text>
                      <Chip
                        mode="flat"
                        textStyle={{ color: theme.colors.onPrimaryContainer }}
                        style={{ borderRadius: 12, backgroundColor: theme.colors.primaryContainer }}
                      >
                        {upcomingWorkout.difficulty}
                      </Chip>
                    </View>
                  </View>
                </> 
              ) : null}
               <View style={styles.planActions}>
      </View>
        <Button 
          mode="contained" 
          style={[styles.primaryButton, { flex: 1 }]}
          onPress={() => router.push('/workout')}
          icon="play"
        >
          Continue Plan
        </Button>
            </View>
        <Button 
          mode="outlined" 
          style={[styles.secondaryButton, { flex: 1, marginTop: 16 }]}
          onPress={() => setShowPlanDetails(true)}
          icon="information-outline"
        >
          Details
        </Button>
      
      <PlanDetailsModal
        visible={showPlanDetails}
        onDismiss={() => setShowPlanDetails(false)}
        plan={selectedPlan}
        openAddWorkout={params.openAddWorkout === 'true'}
      />
    </Surface>
  );
}
