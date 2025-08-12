import React, { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { Button, Divider, IconButton, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';

interface NewWorkout {
  day: string;
  date: string;
  name: string;
  startTime: string;
  endTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  exercises_list: any[];
}

interface AddWorkoutModalProps {
  visible: boolean;
  newWorkout: NewWorkout;
  onWorkoutChange: (workout: NewWorkout) => void;
  onSubmit: () => void;
  onDismiss: () => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const difficulties = ['Easy', 'Medium', 'Hard'];

export default function AddWorkoutModal({ 
  visible, 
  newWorkout, 
  onWorkoutChange, 
  onSubmit, 
  onDismiss 
}: AddWorkoutModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);
  const [showDayMenu, setShowDayMenu] = useState(false);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);

  const updateWorkout = (updates: Partial<NewWorkout>) => {
    onWorkoutChange({ ...newWorkout, ...updates });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.addWorkoutModal} elevation={4}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.primaryText}>
                Add New Workout
              </Text>
              <IconButton
                icon="close"
                size={24}
                iconColor={theme.colors.onSurface}
                onPress={onDismiss}
              />
            </View>
            <Divider />
            
            <View style={styles.formContainer}>
              {/* Workout Name */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Workout Name
                </Text>
                <TextInput
                  value={newWorkout.name}
                  onChangeText={(text) => updateWorkout({ name: text })}
                  placeholder="Enter workout name"
                  style={styles.textInput}
                  mode="outlined"
                />
              </View>

              {/* Day of Week */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Day of Week
                </Text>
                <Menu
                  visible={showDayMenu}
                  onDismiss={() => setShowDayMenu(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setShowDayMenu(true)}
                      style={styles.dropdownButton}
                      contentStyle={styles.dropdownContent}
                    >
                      {newWorkout.day}
                    </Button>
                  }
                >
                  {daysOfWeek.map((day) => (
                    <Menu.Item
                      key={day}
                      onPress={() => {
                        updateWorkout({ day });
                        setShowDayMenu(false);
                      }}
                      title={day}
                    />
                  ))}
                </Menu>
              </View>

              {/* Start and End Time */}
              <View style={styles.timeRow}>
                <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                  <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                    Start Time
                  </Text>
                  <TextInput
                    value={newWorkout.startTime}
                    onChangeText={(text) => updateWorkout({ startTime: text })}
                    placeholder="08:00"
                    style={styles.textInput}
                    mode="outlined"
                  />
                </View>
                <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                  <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                    End Time
                  </Text>
                  <TextInput
                    value={newWorkout.endTime}
                    onChangeText={(text) => updateWorkout({ endTime: text })}
                    placeholder="09:00"
                    style={styles.textInput}
                    mode="outlined"
                  />
                </View>
              </View>

              {/* Difficulty */}
              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Difficulty
                </Text>
                <Menu
                  visible={showDifficultyMenu}
                  onDismiss={() => setShowDifficultyMenu(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setShowDifficultyMenu(true)}
                      style={styles.dropdownButton}
                      contentStyle={styles.dropdownContent}
                    >
                      {newWorkout.difficulty}
                    </Button>
                  }
                >
                  {difficulties.map((difficulty) => (
                    <Menu.Item
                      key={difficulty}
                      onPress={() => {
                        updateWorkout({ difficulty: difficulty as 'Easy' | 'Medium' | 'Hard' });
                        setShowDifficultyMenu(false);
                      }}
                      title={difficulty}
                    />
                  ))}
                </Menu>
              </View>

              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Exercises
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => console.log('Add Exercises')}
                  style={styles.addButton}
                  icon="plus"
                >
                  Add Exercises
                </Button>
              </View>

              <View style={styles.submitContainer}>
                <Button
                  mode="contained"
                  onPress={onSubmit}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                >
                  Add Workout
                </Button>
              </View>
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}
