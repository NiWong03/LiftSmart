import React, { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { IconButton, Surface, Text, useTheme, TextInput, Button } from 'react-native-paper';
import { WorkoutPlan, useWorkout } from './WorkoutContext';
import { createPlanStyles } from './styles';

interface EditPlanModalProps {
  visible: boolean;
  plan: WorkoutPlan;
  onDismiss: () => void;
  onUpdate: (plan: Partial<WorkoutPlan>) => void;
}

export default function EditPlanModal({ visible, plan, onDismiss, onUpdate }: EditPlanModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const { updatePlan } = useWorkout();
  
  const [planName, setPlanName] = useState(plan.name);
  const [planDuration, setPlanDuration] = useState(plan.duration.toString());
  const [planGoal, setPlanGoal] = useState(plan.goal);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!planName.trim()) return;
    
    setIsLoading(true);
    
    try {
      const updatedPlan = {
        name: planName.trim(),
        duration: parseInt(planDuration) || plan.duration,
        goal: planGoal.trim()
      };
      
      // Update in Firebase and context
      await updatePlan({ ...updatedPlan, planID: plan.planID });
      
      // Call the parent's onUpdate callback
      onUpdate(updatedPlan);
      
      onDismiss();
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setPlanName(plan.name);
    setPlanDuration(plan.duration.toString());
    setPlanGoal(plan.goal);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Surface style={[styles.planDetailsModal, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text variant="headlineMedium" style={styles.primaryText}>Edit Plan</Text>
            <IconButton icon="close" onPress={handleCancel} />
          </View>
          
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ padding: 16 }}>
              {/* Plan Name */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Plan Name
                </Text>
                <TextInput
                  value={planName}
                  onChangeText={setPlanName}
                  placeholder="Enter plan name"
                  style={styles.textInput}
                  mode="outlined"
                />
              </View>

              {/* Plan Duration */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Duration (Weeks)
                </Text>
                <TextInput
                  value={planDuration}
                  onChangeText={setPlanDuration}
                  placeholder="Enter duration in weeks"
                  style={styles.textInput}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>

              {/* Plan Goal */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Goal
                </Text>
                <TextInput
                  value={planGoal}
                  onChangeText={setPlanGoal}
                  placeholder="Enter your goal"
                  style={styles.textInput}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.submitContainer}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={[styles.submitButton, { marginBottom: 12 }]}
                  contentStyle={styles.submitButtonContent}
                  loading={isLoading}
                  disabled={isLoading || !planName.trim()}
                >
                  Save Changes
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}
