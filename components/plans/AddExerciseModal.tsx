import React, { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { Button, Divider, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';
import { Exercise, Set } from './WorkoutContext';

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
  sets: [],  
  description: '',
});

  const [manualSets, setManualSets] = useState<{ reps?: string; weight?: string; time?: string; rest?: string }[]>([]);

  const updateExercise = (updates: Partial<Exercise>) => {
    setExercise({ ...exercise, ...updates });
  };

  const addManualSet = () => {
    setManualSets([...manualSets, { reps: '', weight: '', time: '', rest: '' }]);
  };

  const updateManualSet = (index: number, field: string, value: string) => {
    const newSets = [...manualSets];
    newSets[index] = { ...newSets[index], [field]: value };
    setManualSets(newSets);
  };

  const removeManualSet = (index: number) => {
    setManualSets(manualSets.filter((_, i) => i !== index));
  };

  const isValid =
  exercise.name.trim() !== '' &&
  manualSets.some(
    (s) => (s.reps && s.reps.trim() !== '') || (s.weight && s.weight.trim() !== '') || (s.time && s.time.trim() !== '') || (s.rest && s.rest.trim() !== '')
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <Surface style={[styles.addExerciseModal, { padding: 20, borderRadius: 16, maxHeight: '85%' }]} elevation={5}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text variant="titleLarge" style={styles.primaryText}>
              Add Exercise
            </Text>
            <IconButton icon="close" onPress={onDismiss} />
          </View>
          <Divider />

          {/* Scrollable content */}
          <ScrollView contentContainerStyle={{ paddingVertical: 12 }} showsVerticalScrollIndicator={false}>
            {/* Exercise Name */}
            <TextInput
              label="Exercise Name"
              mode="outlined"
              value={exercise.name}
              onChangeText={(text) => updateExercise({ name: text })}
              style={[styles.textInput, { marginBottom: 12 }]}
            />

            {/* Manual Sets Section */}
            <Text variant="titleMedium" style={{ marginTop: 20, marginBottom: 8 }}>
              Add Sets One by One
            </Text>
            {manualSets.map((set, index) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                  <TextInput
                    label="Reps"
                    mode="outlined"
                    value={set.reps}
                    keyboardType="numeric"
                    onChangeText={(text) => updateManualSet(index, 'reps', text)}
                    style={[styles.textInput, { flex: 1, marginRight: 4 }]}
                  />
                  <TextInput
                    label="Weight "
                    placeholder="(lbs)"
                    mode="outlined"
                    value={set.weight}
                    onChangeText={(text) => updateManualSet(index, 'weight', text)}
                    style={[styles.textInput, { flex: 1, marginHorizontal: 4 }]}
                  />
                  <TextInput
                    label="Time"
                    placeholder="(sec)"
                    mode="outlined"
                    value={set.time}
                    keyboardType="numeric"
                    onChangeText={(text) => updateManualSet(index, 'time', text)}
                    style={[styles.textInput, { flex: 1, marginHorizontal: 4 }]}
                  />

                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    label="Rest"
                    placeholder="(sec)"
                    mode="outlined"
                    value={set.rest}
                    keyboardType="numeric"
                    onChangeText={(text) => updateManualSet(index, 'rest', text)}
                    style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                  />
                  <IconButton 
                    icon="delete" 
                    onPress={() => removeManualSet(index)} 
                    mode='outlined'
                    size={20}
                  />
                </View>
              </View>
            ))}

            <Button mode="outlined" onPress={addManualSet} style={{ marginTop: 8, borderRadius: 12 }}>
              + Add Set
            </Button>

            {/* Description */}
            <TextInput
              label="Description (optional)"
              mode="outlined"
              value={exercise.description || ''}
              onChangeText={(text) => updateExercise({ description: text })}
              style={[styles.textInput, { marginTop: 12 }]}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={() => {
              const convertedSets: Set[] = manualSets.map(s => [
                parseInt(s.reps || '0', 10),
                s.weight || '',
                parseInt(s.time || '0', 10),
                parseInt(s.rest || '0', 10)
              ]);

              onSubmit({ ...exercise, sets: [...exercise.sets, ...convertedSets] });
              onDismiss();
              setManualSets([]);
            }}
            style={[styles.submitButton, { marginTop: 16, borderRadius: 12, paddingVertical: 8 }]}
            disabled={!isValid}
          >
            Add Exercise
          </Button>
          {!isValid && (
            <Text style={{ color: theme.colors.primary, marginTop: 8, alignSelf: 'center' }}>
              Please enter Exercise Name and Sets to continue
            </Text>
          )}
        </Surface>
      </View>
    </Modal>
  );
}
