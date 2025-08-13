import React from 'react';
import { Modal, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { WorkoutPlan } from './WorkoutContext';
import { createPlanStyles } from './styles';

interface PlanDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  plan: WorkoutPlan;
}

function PlanDetailsModal({ visible, onDismiss, plan }: PlanDetailsModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Surface style={styles.workoutsContainer}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge">Plan Details</Text>
            <IconButton icon="close" onPress={onDismiss} />
          </View>
          <View style={{ padding: 16 }}>
            <Text variant="bodyLarge">{plan.name}</Text>
            <Text variant="bodyMedium">{plan.duration}</Text>
          </View>
        </Surface>
      </View>
    </Modal>
  );
}

export default PlanDetailsModal;