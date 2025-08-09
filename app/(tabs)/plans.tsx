import { useWorkout } from '@/components/WorkoutContext';
import React, { useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';

const PlansScreen = () => {
  const theme = useTheme();
  const { currentPlan, workouts, updatePlan, markWorkoutComplete } = useWorkout();
  const [expandedWorkouts, setExpandedWorkouts] = useState<{ [key: string]: boolean }>({});
  const [selectedEmoji, setSelectedEmoji] = useState(currentPlan.emoji);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Emoji options for workout plans
  const workoutEmojis = [
    '💪', '🏋️', '🤸', '🏃', '🚴', '🧘', '🤾', '🏊', 
    '🥊', '🤺', '⚽', '🏀', '🎾', '🏐', '🏓', '🏸',
    '🔥', '⚡', '💯', '🎯', '🏆', '🥇', '⭐', '✨',
    '🦾', '🦵', '🫀', '🧠', '🎪', '🎨', '🌟', '🚀'
  ];

  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prev => ({
      ...prev,
      [workoutId]: !prev[workoutId]
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return theme.colors.tertiary;
      case 'medium': return theme.colors.secondary;
      case 'hard': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  const renderEmojiItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.emojiItem, { backgroundColor: theme.colors.surfaceVariant }]}
      onPress={() => handleEmojiSelect(item)}
    >
      <Text style={styles.emojiText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          {/* Current Plan Overview */}
          <Surface style={[styles.planOverviewContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  {currentPlan.name}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {currentPlan.progress} • {currentPlan.duration}
                </Text>
                <View style={styles.planBadges}>
                  <Chip mode="outlined" style={{ marginRight: 8 }}>
                    {currentPlan.difficulty}
                  </Chip>
                  <Chip icon="check-circle" textStyle={{ color: theme.colors.primary }}>
                    {currentPlan.workoutsCompleted}/{currentPlan.totalWorkouts} completed
                  </Chip>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setShowEmojiPicker(true)}
                style={[styles.emojiContainer, { backgroundColor: theme.colors.primaryContainer }]}
              >
                <Text style={styles.planEmoji}>{selectedEmoji}</Text>
                <View style={[styles.editIndicator, { backgroundColor: theme.colors.primary }]}>
                  <IconButton
                    icon="pencil"
                    size={12}
                    iconColor={theme.colors.onPrimary}
                  />
                </View>
              </TouchableOpacity>
            </View>
            
            <Divider style={{ marginVertical: 16 }} />
            
            <View style={styles.planActions}>
              <Button 
                mode="contained" 
                onPress={() => console.log('Continue Plan')}
                style={[styles.primaryButton, { flex: 1, marginRight: 8 }]}
                icon="play"
              >
                Continue Plan
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => console.log('Edit Plan')}
                style={[styles.secondaryButton, { flex: 1, marginLeft: 8 }]}
                icon="pencil"
              >
                Edit Plan
              </Button>
            </View>
          </Surface>

          {/* Workouts Section */}
          <Surface style={[styles.workoutsContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Workouts in Plan
              </Text>
              <IconButton
                icon="plus"
                size={24}
                iconColor={theme.colors.primary}
                style={{ backgroundColor: theme.colors.primaryContainer }}
                onPress={() => console.log('Add new workout')}
              />
            </View>

            {workouts.map((workout, index) => (
              <Card key={workout.id} style={[styles.workoutCard, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
                <TouchableOpacity onPress={() => toggleWorkoutExpansion(workout.id)}>
                  <View style={styles.workoutHeader}>
                    <View style={styles.workoutStatus}>
                      <IconButton
                        icon={workout.completed ? "check-circle" : "clock-outline"}
                        size={24}
                        iconColor={workout.completed ? theme.colors.primary : theme.colors.outline}
                      />
                    </View>
                    
                    <View style={styles.workoutInfo}>
                      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                        {workout.name}
                      </Text>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                        {workout.day}, {formatDate(workout.date)}
                      </Text>
                      <View style={styles.workoutMeta}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {workout.duration} • {workout.exercises} exercises
                        </Text>
                        <Chip 
                          mode="outlined" 
                          style={{ 
                            marginLeft: 8,
                            backgroundColor: getDifficultyColor(workout.difficulty) + '20',
                            borderColor: getDifficultyColor(workout.difficulty)
                          }}
                          textStyle={{ color: getDifficultyColor(workout.difficulty), fontSize: 10 }}
                        >
                          {workout.difficulty}
                        </Chip>
                      </View>
                    </View>
                    
                    <IconButton
                      icon={expandedWorkouts[workout.id] ? "chevron-up" : "chevron-down"}
                      size={20}
                      iconColor={theme.colors.onSurface}
                    />
                  </View>
                </TouchableOpacity>

                {expandedWorkouts[workout.id] && (
                  <View style={styles.workoutDetails}>
                    <Divider style={{ marginBottom: 12 }} />
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                      Exercises:
                    </Text>
                    {workout.exercises_list.map((exercise, exerciseIndex) => (
                      <View key={exerciseIndex} style={styles.exerciseRow}>
                        <View style={styles.exerciseInfo}>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                            {exercise.name}
                          </Text> 
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {exercise.sets} {exercise.weight !== 'Bodyweight' && exercise.weight !== 'N/A' && `• ${exercise.weight}`}
                          </Text>
                        </View>
                        <IconButton
                          icon="information-outline"
                          size={16}
                          iconColor={theme.colors.outline}
                          onPress={() => console.log(`Info for ${exercise.name}`)}
                        />
                      </View>
                    ))}
                    
                    <View style={styles.workoutActions}>
                      <Button 
                        mode={workout.completed ? "outlined" : "contained"}
                        onPress={() => console.log(`Start ${workout.name}`)}
                        style={{ flex: 1, marginRight: 4 }}
                        icon={workout.completed ? "repeat" : "play"}
                      >
                        {workout.completed ? "Repeat" : "Start"}
                      </Button>
                      <Button 
                        mode="outlined" 
                        onPress={() => console.log(`Edit ${workout.name}`)}
                        style={{ flex: 1, marginLeft: 4 }}
                        icon="pencil"
                      >
                        Edit
                      </Button>
                    </View>
                  </View>
                )}
              </Card>
            ))}

            {/* Add New Workout Card */}
            <Card style={[styles.addWorkoutCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]} mode="outlined">
              <TouchableOpacity onPress={() => console.log('Add new workout')} style={styles.addWorkoutContent}>
                <IconButton
                  icon="plus-circle-outline"
                  size={32}
                  iconColor={theme.colors.primary}
                />
                <Text variant="titleMedium" style={{ color: theme.colors.primary, marginTop: 8 }}>
                  Add New Workout
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
                  Create a custom workout or choose from templates
                </Text>
              </TouchableOpacity>
            </Card>
          </Surface>
        </View>
      </ScrollView>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.emojiPickerContainer, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <View style={styles.emojiPickerHeader}>
              <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Choose Emoji
              </Text>
              <IconButton
                icon="close"
                size={24}
                iconColor={theme.colors.onSurface}
                onPress={() => setShowEmojiPicker(false)}
              />
            </View>
            <Divider />
            <FlatList
              data={workoutEmojis}
              renderItem={renderEmojiItem}
              numColumns={8}
              contentContainerStyle={styles.emojiGrid}
              showsVerticalScrollIndicator={false}
            />
          </Surface>
        </View>
      </Modal>
    </View>
  );
};

export default PlansScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  // Current Plan Overview Styles
  planOverviewContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    marginRight: 16,
  },
  planBadges: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
  // Workouts Section Styles
  workoutsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Individual Workout Card Styles
  workoutCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  workoutStatus: {
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  workoutDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  exerciseInfo: {
    flex: 1,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  // Add New Workout Card Styles
  addWorkoutCard: {
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    marginTop: 8,
  },
  addWorkoutContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Emoji Picker Styles
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  planEmoji: {
    fontSize: 32,
  },
  editIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emojiPickerContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '70%',
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  emojiGrid: {
    padding: 16,
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  emojiText: {
    fontSize: 24,
  },
});