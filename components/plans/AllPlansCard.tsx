import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';
import { useWorkout } from './WorkoutContext';
import { createPlanStyles } from './styles';

export default function PlanListCard() {
  const theme = useTheme();
  const { allPlans } = useWorkout();
  const styles = createPlanStyles(theme);

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
            {allPlans.map((plan, index) => (
              <View key={plan.id}>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingVertical: 8 
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text variant="bodyMedium" style={styles.surfaceText}>
                      {plan.name}
                    </Text>
                    {plan.current && (
                      <Text variant="bodySmall" style={[styles.primaryText, { marginLeft: 8 }]}>
                        (Current)
                      </Text>
                    )}
                  </View>
                  <Text variant="bodySmall" style={styles.surfaceVariantText}>
                    ID: {plan.id}
                  </Text>
                </View>
                {index < allPlans.length - 1 && <Divider style={{ marginVertical: 4 }} />}
              </View>
            ))}
          </ScrollView>
        )}
      </Card.Content>
    </Card>
  );
}
