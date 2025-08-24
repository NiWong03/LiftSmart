import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Divider, Text, useTheme } from 'react-native-paper';
import PlanDetailsModal from './PlanDetailsModal';
import { useWorkout, WorkoutPlan } from './WorkoutContext';
import { createPlanStyles } from './styles';

export default function PlanListCard() {
  const theme = useTheme();
  const { allPlans, deletingPlans } = useWorkout();
  const styles = createPlanStyles(theme);
  
  // Sort plans to put current plan first
  const sortedPlans = [...allPlans].sort((a, b) => {
    if (a.current && !b.current) return -1; // a is current, b is not
    if (!a.current && b.current) return 1;  // b is current, a is not
    return 0; 
  });

  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const handleShowDetails = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetails(true);
  };

  return (
    <Card style={[styles.workoutCard, { marginBottom: 16 }]} mode="outlined">
      <Card.Content style={{ padding: 16 }}>
        <Text variant="titleMedium" style={[styles.primaryText, { marginBottom: 12 }]}>
          All Plans ({allPlans.length})
        </Text>
        
        {allPlans.length === 0 ? (
          <Text variant="bodyMedium" style={styles.surfaceVariantText}>
            No plans created yet
          </Text>
        ) : (
                     <ScrollView style={{ maxHeight: 200 }}>
             {sortedPlans.map((plan, index) => {
               const isDeleting = deletingPlans.includes(plan.planID);
               
               return (
                 <View key={plan.planID}>
                   <View style={{ 
                     flexDirection: 'row', 
                     justifyContent: 'space-between', 
                     alignItems: 'center',
                     paddingVertical: 8 
                   }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                       <Text 
                         variant="bodyMedium" 
                         style={[
                           styles.surfaceText,
                           isDeleting && { opacity: 0.6 }
                         ]}
                         numberOfLines={1}
                         ellipsizeMode="tail"
                       >
                         {isDeleting ? `${plan.name} (Deleting...)` : plan.name}
                       </Text>
                       {plan.current && !isDeleting && (
                         <Text variant="bodySmall" style={[styles.primaryText, { marginLeft: 8, flexShrink: 0 }]}>
                           (Current)
                         </Text>
                       )}
                     </View>
                     {!isDeleting && (
                       <Button
                         mode="outlined"
                         compact
                         onPress={() => handleShowDetails(plan)}
                         icon="information-outline"
                         style={{ borderRadius: 12, flexShrink: 0 }}
                       >
                         Details
                       </Button>
                     )}
                   </View>
                   {index < sortedPlans.length - 1 && <Divider style={{ marginVertical: 4 }} />}
                 </View>
               );
             })}
           </ScrollView>
        )}
      </Card.Content>
      
      {selectedPlan && (
        <PlanDetailsModal
          visible={showPlanDetails}
          onDismiss={() => setShowPlanDetails(false)}
          plan={selectedPlan}
        />
      )}
    </Card>
  );
}
