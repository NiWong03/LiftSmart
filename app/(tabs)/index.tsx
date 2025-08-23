import { ChatbotModal } from '@/components/chat/chatbot';
import AddPlanModal from '@/components/plans/AddPlanModal';
import EditPlanHandler from '@/components/plans/EditPlanHandler';
import { useWorkout, Workout } from '@/components/plans/WorkoutContext';
import { FIREBASE_AUTH } from '@/firebaseAuth/FirebaseConfig';
import { router } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Chip, IconButton, Surface, Text, useTheme } from 'react-native-paper';


const HomeScreen = () => {
  const theme = useTheme();
  const { currentPlan, workouts, addPlan } = useWorkout();
  const [upcomingWorkout, setUpcomingWorkout] = useState<Workout | undefined>(undefined);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditHandler, setShowEditHandler] = useState(false);
  const [pendingEditResponse, setPendingEditResponse] = useState<any>(null);
  const [editApplied, setEditApplied] = useState(false);
  const authUserId = FIREBASE_AUTH.currentUser?.uid ?? '';
  const [user, setUser] = useState<User | null>(null);

  const realTimeGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 4 && currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const [draftPlan, setDraftPlan] = useState({
    name: '',
    goal: '',
    duration: 1,
    difficulty: 'AI Generated',
    emoji: '💪',
    totalWorkouts: 0,
    workouts: [] as Workout[],
  });
  
  useEffect(
    () => {
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
      onAuthStateChanged(FIREBASE_AUTH, (user) => {
        setUser(user);
      });
    }
  , [workouts])

  const handleParsedResponse = (data: any) => {
    try {
      const plan = data?.plan;
      if (!plan) return;

      const mappedWorkouts: Workout[] = (plan.workouts || []).map((w: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        day: w.day || '',
        date: new Date(typeof w.date === 'string' ? w.date : w.date?.toString?.() || ''),
        name: w.name || '',
        duration: w.duration,
        startTime: w.startTime,
        endTime: w.endTime,
        exercises: Array.isArray(w.exercises_list) ? w.exercises_list.length : (w.exercises || 0),
        completed: false,
        difficulty: w.difficulty || plan.difficulty, // incase no workout difficulty, generalize with plan difficulty
        exercises_list: w.exercises_list || [],
        userId: authUserId, // will be set by addPlan
      }));

      setDraftPlan({
        name: plan.name || '--Plan Name Needed--',
        goal: plan.goal || 'Specify a Goal for the Plan',
        duration: plan.duration || 1,
        difficulty: plan.difficulty || '',
        emoji: plan.emoji || '💪',
        totalWorkouts: mappedWorkouts.length,
        workouts: mappedWorkouts,
      });

     
    } catch (error) {
      console.error('Failed to map AI plan to draft:', error);
    }
  };
  
  return (
    <View style={styles.mainContainer}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text variant="displaySmall" style={[styles.greeting, { color: theme.colors.onBackground }]}>
              {realTimeGreeting()},
            </Text>
            <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.primary }]}>
            {user?.email || 'Guest'} 
            </Text>
          </View>

          {/* Quick Stats */}
          <Surface style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.workoutDetails}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  7
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Day Streak
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  12
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Workouts
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  85%
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Goal Progress
                </Text>
              </View>
            </View>
          </Surface>

          {/* Current Plan Progress Card */}
          <Surface style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.cardContent}>
              <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 12 }}>
                Current Plan Progress
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                {currentPlan.name} — {currentPlan.workoutsCompleted} of {currentPlan.totalWorkouts} workouts completed
              </Text>
              {/* Progress Bar Background */}
              <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.onSurface + '30' }]}>
                {/* Progress Bar Fill */}
                <View
                  style={[
                    styles.progressBarFill,
                    { 
                      backgroundColor: theme.colors.primary,
                      width: `${(currentPlan.workoutsCompleted / currentPlan.totalWorkouts) * 100}%`,
                    }
                  ]}
                />
              </View>
            </View>
          </Surface>

          {/* Current Plan Card */}
          <Surface style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.cardContent}>
              <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 8 }}>
                Current Plan
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Name: {currentPlan.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Duration: {currentPlan.duration}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Difficulty: {currentPlan.difficulty}
              </Text>
            </View>
          </Surface>

          {/* Today's Workout Card */}
          <Surface style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
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
                    <View style={styles.detailItem}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Duration
                      </Text>
                      <Text variant="titleLarge" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
                        {upcomingWorkout.duration}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
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

                  {/* Action buttons */}
                  <View style={styles.cardActions}>
                    <Button
                      mode="contained"
                      onPress={() => router.push('/workout')}
                      style={styles.primaryButton}
                      contentStyle={styles.buttonContent}
                    >
                      Start Workout
                    </Button>
                  </View>
                </>
              ) : (
                <View style={styles.cardActions}>
                  <Button
                    mode="contained"
                    onPress={() => console.log('Navigate to add workout screen')}
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                  >
                    Add a Workout
                  </Button>
                </View>
              )}
            </View>
          </Surface>


          {/* Quick Actions */}
          <Surface style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.cardContent}>
              <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 16 }}>
                Quick Actions
              </Text>
              <View style={styles.quickActions}>
                <View style={styles.actionItem}>
                  <IconButton
                    icon="calendar"
                    size={32}
                    iconColor={theme.colors.primary}
                    style={[styles.actionIcon, { backgroundColor: theme.colors.primaryContainer }]}
                    onPress={() => router.push('/(tabs)/schedule')}
                  />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Schedule
                  </Text>
                </View>
                <View style={styles.actionItem}>
                  <IconButton
                    icon="clipboard-list"
                    size={32}
                    iconColor={theme.colors.primary}
                    style={[styles.actionIcon, { backgroundColor: theme.colors.tertiaryContainer }]}
                    onPress={() => router.push('/(tabs)/plans?openDetails=true')}
                  />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Plan Details
                  </Text>
                </View>
                <View style={styles.actionItem}>
                  <IconButton
                    icon="plus-circle"
                    size={32}
                    iconColor={theme.colors.primary}
                    style={[styles.actionIcon, { backgroundColor: theme.colors.primaryContainer }]}
                    onPress={() => router.push('/(tabs)/plans?openDetails=true&openAddWorkout=true')}
                  />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Add Workout
                  </Text>
                </View>
              </View>
            </View>
          </Surface>

          {/* AI Suggestions Card */}
          <Surface style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.cardContent}>
              <View style={styles.aiCardHeader}>
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  AI Suggestions
                </Text>
                <IconButton
                  icon="robot"
                  size={24}
                  iconColor={theme.colors.primary}
                  onPress={() => setChatbotVisible(true)}
                />
              </View>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Get personalized workout recommendations and tips from your AI fitness coach.
              </Text>
              <Button 
                mode="outlined" 
                onPress={() => setChatbotVisible(true)}
                style={styles.aiButton}
                icon="lightbulb"
              >
                Get Suggestions
              </Button>
            </View>
          </Surface>
        </View>
      </ScrollView>
      {/* AI Chatbot Floating Button */}
      <View style={styles.floatingChatbot}>
        <IconButton
          icon="robot"
          size={32}
          iconColor={theme.colors.onPrimaryContainer}
          style={[styles.chatbotButton, { backgroundColor: theme.colors.tertiary }]}
          onPress={() => {
            setChatbotVisible(true);
            setEditApplied(false);
          }}
        />
      </View>

      {/* Chatbot Modal */}
      <ChatbotModal
        visible={chatbotVisible}
        onDismiss={() => setChatbotVisible(false)}
        onParsedResponse={handleParsedResponse}
        onRequestOpenAddPlan={() => 
          {
            setChatbotVisible(false);
            setShowAddPlanModal(true);
          }
        }
        onRequestEditPlan={(response) => {
          setPendingEditResponse(response);
          // Don't close the chatbot modal - keep it open so user can return to chat
          setShowEditHandler(true);
        }}
        onEditApplied={() => {
          setEditApplied(true);
        }}
        editApplied={editApplied}
      />

      <AddPlanModal
        visible={showAddPlanModal}
        newPlan={draftPlan as any}
        onPlanChange={(p: any) => setDraftPlan(p)}
        onSubmit={async (p: any) => {
          try {
            await addPlan({
              name: p.name,
              duration: p.duration,
              progress: '0%',
              goal: p.goal,
              workoutsCompleted: 0,
              totalWorkouts: p.workouts?.length || 0,
              difficulty: p.difficulty,
              emoji: p.emoji,
              current: false,
              planID: '' as any,
            } as any, p.workouts);
          } catch (e) {
            console.error('Failed to create plan from AI draft:', e);
          } finally {
            setShowAddPlanModal(false);
          }
        }}
        onDismiss={() => setShowAddPlanModal(false)}
      />
      <EditPlanHandler
        visible={showEditHandler}
        aiResponse={pendingEditResponse}
        onDismiss={() => {
          setShowEditHandler(false);
        }}
        onComplete={() => {
          setShowEditHandler(false);
          setPendingEditResponse(null);
          setEditApplied(true); // Only clear button when changes are actually applied
          
          // Close chatbot modal and navigate to plans page to show the updated plan
          setChatbotVisible(false);
          router.push('/plans?openDetails=true');
        }}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100, // Add extra padding for navbar and floating button
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    opacity: 0.8,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
  },
  cardActions: {
    paddingTop: 8,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    width: '100%',
  },
  secondaryButton: {
    borderRadius: 12,
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    marginBottom: 8,
    borderRadius: 12,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiButton: {
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
  },
  floatingChatbot: {
    position: 'absolute',
    bottom: 100, // Adjust to account for navbar
    right: 20,
    zIndex: 1000,
    opacity: 0.7,
  },
  chatbotButton: {
    borderRadius: 24,
    elevation: 8, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progressBarBackground: {
  height: 12,
  borderRadius: 8,
  overflow: 'hidden',
  width: '100%',
  marginBottom: 12,
},
progressBarFill: {
  height: '100%',
  borderRadius: 8,
},
});