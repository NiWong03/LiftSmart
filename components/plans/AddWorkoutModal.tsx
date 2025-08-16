import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { Button, Divider, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';
import AddExerciseModal from './AddExerciseModal';
import ItemCard from '../ItemCard';

interface NewWorkout {
  day: string;
  date: string;
  name: string;
  startTime: string;
  endTime: string;
  difficulty: string;
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
const difficulties = "AI Pending";

// Add a helper function to format time in 12-hour format
const formatTime12Hour = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function AddWorkoutModal({ 
  visible, 
  newWorkout, 
  onWorkoutChange, 
  onSubmit, 
  onDismiss 
}: AddWorkoutModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);

  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

  // Add state for time validation
  const [timeError, setTimeError] = useState(false);

  // Add validation function
  const validateTimes = (start: Date, end: Date) => {
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    
    if (endMinutes <= startMinutes) {
        setTimeError(true);
    } else {
        setTimeError(false);
    }
  };

  // Day Picker
  const [showDatePicker, setShowDatePicker] = useState(false);




//   Start time picker
  const onChangeStartTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartPicker(false);
    setStartTime(currentTime);
    updateWorkout({ startTime: formatTime12Hour(currentTime) });
    validateTimes(currentTime, endTime);
  };
//  End time picker
  const onChangeEndTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndPicker(false);
    setEndTime(currentTime);
    updateWorkout({ endTime: formatTime12Hour(currentTime) });
    validateTimes(startTime, currentTime);
  };

  // Day of the week picker, couldnt do just day picker spinner
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    // Date spinner alr exists, this reformats to show specific day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[currentDate.getDay()];
    updateWorkout({ 
      day: dayOfWeek,
      date: currentDate.toISOString().split('T')[0] 
    });
  };

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
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dropdownButton}
                  contentStyle={styles.dropdownContent}
                >
                  {newWorkout.day}
                </Button>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="spinner"
                    onChange={onChangeDate}
                  />
                )}
              </View>

              {/*----------- Start Time----------- */}
              <View style={styles.formField}>
                <Button onPress={() => setShowStartPicker(true)} mode="outlined">
                  Start Time: {formatTime12Hour(startTime)}
                </Button>
                {showStartPicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onChangeStartTime}
                  />
                )}
              </View>

              {/*----------- End Time----------- */}

              <View style={styles.formField}>
                <Button onPress={() => setShowEndPicker(true)} mode="outlined">
                  End Time: {formatTime12Hour(endTime)}
                </Button>
                
                {showEndPicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onChangeEndTime}
                  />
                )}
                
                {timeError && (
                  <Text style={styles.errorText}>
                    *End time cannot be before start time*
                  </Text>
                )}
              </View>


              <View style={styles.formField}>
                <Text variant="labelLarge" style={[styles.primaryTextRegular, { marginBottom: 8 }]}>
                  Exercises
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setExerciseModalVisible(true)}
                  style={styles.addButton}
                  icon="plus"
                >
                  Add Exercises
                </Button>
                <AddExerciseModal
                  visible={exerciseModalVisible}
                  onDismiss={() => setExerciseModalVisible(false)}
                  onSubmit={(exercise) => {
                    updateWorkout({ exercises_list: [...newWorkout.exercises_list, exercise] });
                  }}
                />
                 {newWorkout.exercises_list.map((ex, idx) => (
                  <ItemCard
                    key={idx}
                    id={idx}
                    title={ex.name}
                    // Join all sets into a readable format: "10 reps x 50 lbs x 30 sec, 12 reps x 55 lbs x 30 sec"
                    subtitle={ex.sets
                      .map((s: [number, string, number]) => {
                        const [reps, weight, time] = s;
                        const repsStr = reps > 0 ? `${reps} reps` : '';
                        const weightStr = weight ? `${weight}` : '';
                        const timeStr = time > 0 ? `${time} sec` : '';
                        return [repsStr, weightStr, timeStr].filter(Boolean).join(' x ');
                      })
                      .join(', ')}
                    details={ex.description || undefined}
                    onDelete={() => {
                      const updated = newWorkout.exercises_list.filter((_, i) => i !== idx);
                      onWorkoutChange({ ...newWorkout, exercises_list: updated });
                    }}
                  />
                ))}

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
