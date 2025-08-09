import { useWorkout, type CalendarEvent } from '@/components/WorkoutContext';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Modal, Portal, Text, useTheme } from 'react-native-paper';

type EventDetailCardProps = {
  visible: boolean;
  event: CalendarEvent | null;
  onDismiss: () => void;
};

export default function EventDetailCard({ visible, event, onDismiss, }: EventDetailCardProps) {
  const { colors } = useTheme();
  const { markWorkoutComplete } = useWorkout();

  if (!event) return null;

  const isWorkoutEvent = event.type === 'workout' && event.workout;

  const formatDateTime = (d: Date) => {
    try {
      return `${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    } catch {
      return d.toString();
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Title
            title={event.title || 'Event'}
            titleVariant="titleLarge"
            right={(props) => (
              <IconButton {...props} icon="close" onPress={onDismiss} accessibilityLabel="Close" />
            )}
          />
          <Card.Content>
            <View style={styles.row}>
              <IconButton icon="calendar" size={20} disabled />
              <Text style={{ color: colors.onSurfaceVariant }}>{formatDateTime(event.start)}</Text>
            </View>
            <View style={styles.row}>
              <IconButton icon="clock" size={20} disabled />
              <Text style={{ color: colors.onSurfaceVariant }}>{formatDateTime(event.end)}</Text>
            </View>
            
            {isWorkoutEvent && event.workout && (
              <>
                <View style={styles.row}>
                  <IconButton icon="dumbbell" size={20} disabled />
                  <Text style={{ color: colors.onSurfaceVariant }}>
                    {event.workout.exercises} exercises • {event.workout.duration}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Chip 
                    mode="outlined" 
                    style={{ 
                      backgroundColor: event.workout.completed ? colors.primaryContainer : colors.surfaceVariant 
                    }}
                  >
                    {event.workout.completed ? 'Completed' : event.workout.difficulty}
                  </Chip>
                </View>
              </>
            )}
          </Card.Content>
          <Card.Actions style={{ justifyContent: 'flex-end' }}>
            {isWorkoutEvent && event.workout && !event.workout.completed && (
              <Button 
                mode="outlined" 
                onPress={() => {
                  if (event.workoutId) {
                    markWorkoutComplete(event.workoutId);
                  }
                  onDismiss();
                }} 
                icon="check"
              >
                Mark Complete
              </Button>
            )}
            <Button mode="contained" onPress={() => {
              onDismiss();
              router.push('/(tabs)/plans');
            }} icon={isWorkoutEvent ? "dumbbell" : "information"}>
              {isWorkoutEvent ? 'View Workout' : 'Details'}
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 16,
    height: '85%',
  },
  card: {
    borderRadius: 12,
    height: '85%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  padding: {
    padding: 0,
  },
  detailsButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});


