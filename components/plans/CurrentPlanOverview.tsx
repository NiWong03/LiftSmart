import { useWorkout } from '@/components/plans/WorkoutContext';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';

interface CurrentPlanOverviewProps {
  selectedEmoji: string;
  onEmojiPress: () => void;
}

export default function CurrentPlanOverview({ selectedEmoji, onEmojiPress }: CurrentPlanOverviewProps) {
  const theme = useTheme();
  const { currentPlan } = useWorkout();
  const styles = createPlanStyles(theme);

  return (
    <Surface style={styles.planOverviewContainer} elevation={2}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text variant="headlineSmall" style={styles.primaryText}>
            {currentPlan.name}
          </Text>
          <Text variant="bodyMedium" style={[styles.surfaceVariantText, { marginTop: 4 }]}>
            {currentPlan.progress} • {currentPlan.duration}
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
      
      <View style={styles.planActions}>
        <Button 
          mode="contained" 
          style={[styles.primaryButton, { flex: 1 }]}
          onPress={() => console.log('Continue plan')}
          icon="play"
        >
          Continue Plan
        </Button>
        <Button 
          mode="outlined" 
          style={[styles.secondaryButton, { flex: 1 }]}
          onPress={() => console.log('View details')}
          icon="information-outline"
        >
          Details
        </Button>
      </View>
    </Surface>
  );
}
