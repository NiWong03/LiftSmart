import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { Button, IconButton, Surface, Text, TextInput, Divider, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';

interface Exercise {
  name: string;
  sets: string;
  weight: string;
}

interface AddExerciseModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (exercise: Exercise) => void;
}

export default function AddExerciseModal({ visible, onDismiss, onSubmit }: AddExerciseModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);

  const [exercise, setExercise] = useState<Exercise>({
    name: '',
    sets: '',
    weight: '',
  });

  const updateExercise = (updates: Partial<Exercise>) => {
    setExercise({ ...exercise, ...updates });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <Surface style={styles.addWorkoutModal} elevation={4}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.primaryText}>
              Add Exercise
            </Text>
            <IconButton icon="close" onPress={onDismiss} />
          </View>
          <Divider />

          {/* Exercise Name */}
          <TextInput
            label="Exercise Name"
            mode="outlined"
            value={exercise.name}
            onChangeText={(text) => updateExercise({ name: text })}
            style={styles.textInput}
          />

          {/* Sets */}
          <TextInput
            label="Number of Sets"
            mode="outlined"
            value={exercise.sets}
            keyboardType="numeric"
            onChangeText={(text) => updateExercise({ sets: text })}
            style={styles.textInput}
          />

          {/* Weight */}
          <TextInput
            label="Weight (lbs)"
            mode="outlined"
            value={exercise.weight}
            keyboardType="numeric"
            onChangeText={(text) => updateExercise({ weight: text })}
            style={styles.textInput}
          />

          <Button
            mode="contained"
            onPress={() => {
              onSubmit(exercise);
              onDismiss();
            }}
            style={styles.submitButton}
          >
            Add Exercise
          </Button>
        </Surface>
      </View>
    </Modal>
  );
}
