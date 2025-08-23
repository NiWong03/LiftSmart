import React, { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';

import { IconButton, Surface, Text, useTheme, TextInput, Button, Switch } from 'react-native-paper';
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
  const { updatePlan, deleteWorkout, workouts, deletePlan, allPlans } = useWorkout();
  
  const [planName, setPlanName] = useState(plan.name);
  const [planDuration, setPlanDuration] = useState(plan.duration.toString());
  const [planGoal, setPlanGoal] = useState(plan.goal);
  const [isCurrent, setIsCurrent] = useState(plan.current);
  const [isLoading, setIsLoading] = useState(false);

  // Check if this is the only plan - if so, disable the current switch
  const isOnlyPlan = allPlans.length === 1;

  const handleSave = async () => {
    if (!planName.trim()) return;
    
    setIsLoading(true);
    
    try {
      const updatedPlan = {
        name: planName.trim(),
        duration: parseInt(planDuration) || plan.duration,
        goal: planGoal.trim(),
        current: isCurrent
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
    setIsCurrent(plan.current);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
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

              {/* Set as Current Plan */}
              <View style={[styles.formField, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                    Set as Current Plan
                  </Text>
                  <Text variant="bodySmall" style={[styles.surfaceVariantText, isOnlyPlan && { color: theme.colors.onBackground }]}>
                    {isOnlyPlan 
                      ? "This is your only plan, so it must remain current"
                      : "This plan will appear as your active plan on the main page"
                    }
                  </Text>
                </View>
                <Switch
                  value={isCurrent}
                  onValueChange={setIsCurrent}
                  color={theme.colors.primary}
                  disabled={isOnlyPlan}
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
