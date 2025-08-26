import DateTimePicker from '@react-native-community/datetimepicker';

import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { Button, Divider, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';
import AddExerciseModal from './AddExerciseModal';
import ItemCard from '../ItemCard';
import { Workout, Exercise } from './WorkoutContext';

interface EditWorkoutModalProps {
  visible: boolean;
  workout: Workout;
  onDismiss: () => void;
  onSubmit: (updatedWorkout: Partial<Workout>) => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper function to format time in 12-hour format
const formatTime12Hour = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to parse time string to Date
const parseTimeToDate = (timeString: string): Date => {
  // Handle invalid or empty time strings
  if (!timeString || typeof timeString !== 'string') {
    
    return new Date(); // Return current time as fallback
  }
  
  try {
    const trimmedTime = timeString.trim();
    
    
    // Check if it's 24-hour format (e.g., "08:00", "14:30")
    if (trimmedTime.includes(':') && !trimmedTime.includes('AM') && !trimmedTime.includes('PM')) {
      const [hours, minutes] = trimmedTime.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        
        return new Date(); // Return current time as fallback
      }
      
      const result = new Date();
      result.setHours(hours, minutes, 0, 0);
      
      return result;
    }
    
    // Handle 12-hour format (e.g., "8:00 AM", "2:30 PM")
    let time, period;
    
    const amIndex = trimmedTime.toUpperCase().lastIndexOf('AM');
    const pmIndex = trimmedTime.toUpperCase().lastIndexOf('PM');
    
    if (amIndex !== -1) {
      time = trimmedTime.substring(0, amIndex).trim();
      period = 'AM';
    } else if (pmIndex !== -1) {
      time = trimmedTime.substring(0, pmIndex).trim();
      period = 'PM';
    } else {
      const spaceIndex = trimmedTime.lastIndexOf(' ');
      if (spaceIndex === -1) {
        
        return new Date(); // Return current time as fallback
      }
      
      time = trimmedTime.substring(0, spaceIndex);
      period = trimmedTime.substring(spaceIndex + 1);
    }
    
    
    
    if (!time || !period) {
      
      return new Date(); // Return current time as fallback
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      
      return new Date(); // Return current time as fallback
    }
    
    let hour24 = hours;
    if (period.toUpperCase() === 'PM' && hours !== 12) hour24 += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hour24 = 0;
    
    const result = new Date();
    result.setHours(hour24, minutes, 0, 0);
    
    return result;
  } catch (error) {
    
    return new Date(); // Return current time as fallback
  }
};

// Helper function to calculate duration from start and end times
const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    const startDate = parseTimeToDate(startTime);
    const endDate = parseTimeToDate(endTime);
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return '0 min';
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  } catch (error) {
    
    return '0 min';
  }
};

export default function EditWorkoutModal({ 
  visible, 
  workout, 
  onDismiss, 
  onSubmit 
}: EditWorkoutModalProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);

  // Initialize state with workout data
  const [editedWorkout, setEditedWorkout] = useState<Partial<Workout>>(workout);
  const [startTime, setStartTime] = useState(parseTimeToDate(workout.startTime));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [endTime, setEndTime] = useState(parseTimeToDate(workout.endTime));
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (workout.date instanceof Date) {
      return workout.date;
    } else if (workout.date && typeof workout.date === 'object' && 'toDate' in workout.date) {
      return workout.date.toDate();
    } else {
      return new Date();
    }
  });

  // Update local state when workout prop changes
  useEffect(() => {
    
    setEditedWorkout(workout);
    setStartTime(parseTimeToDate(workout.startTime));
    setEndTime(parseTimeToDate(workout.endTime));
    
    // Update current date
    if (workout.date instanceof Date) {
      setCurrentDate(workout.date);
    } else if (workout.date && typeof workout.date === 'object' && 'toDate' in workout.date) {
      setCurrentDate(workout.date.toDate());
    }
  }, [workout]);

  // Validation function
  const validateTimes = (start: Date, end: Date) => {
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    
    if (endMinutes <= startMinutes) {
      setTimeError(true);
    } else {
      setTimeError(false);
    }
  };

  // Start time picker
  const onChangeStartTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartPicker(false);
    setStartTime(currentTime);
    const newStartTime = formatTime12Hour(currentTime);
    const newDuration = calculateDuration(newStartTime, editedWorkout.endTime || workout.endTime);
    updateWorkout({ 
      startTime: newStartTime,
      duration: newDuration
    });
    validateTimes(currentTime, endTime);
  };

  // End time picker
  const onChangeEndTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndPicker(false);
    setEndTime(currentTime);
    const newEndTime = formatTime12Hour(currentTime);
    const newDuration = calculateDuration(editedWorkout.startTime || workout.startTime, newEndTime);
    updateWorkout({ 
      endTime: newEndTime,
      duration: newDuration
    });
    validateTimes(startTime, currentTime);
  };

  // Date picker
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const selectedDateValue = selectedDate || new Date();
    setShowDatePicker(false);
    setCurrentDate(selectedDateValue);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[selectedDateValue.getDay()];
    updateWorkout({ 
      day: dayOfWeek,
      date: selectedDateValue
    });
  };

  const updateWorkout = (updates: Partial<Workout>) => {
    setEditedWorkout(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    if (!timeError) {
      
      
      
      onSubmit(editedWorkout);
    }
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
                Edit Workout
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
                  value={editedWorkout.name}
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
                  {editedWorkout.day}
                </Button>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={currentDate}
                    mode="date"
                    display="spinner"
                    onChange={onChangeDate}
                  />
                )}
              </View>

              {/* Start Time */}
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

                             {/* End Time */}
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
                 
                 {/* Duration Display */}
                 <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                   Duration: {editedWorkout.duration || calculateDuration(workout.startTime, workout.endTime)}
                 </Text>
               </View>

              {/* Exercises */}
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
                    updateWorkout({ 
                      exercises_list: [...(editedWorkout.exercises_list || []), exercise] 
                    });
                  }}
                />
                {(editedWorkout.exercises_list || []).map((ex, idx) => (
                  <ItemCard
                    key={idx}
                    id={idx}
                    title={ex.name}
                        subtitle={Array.isArray(ex.sets) ? ex.sets
                        .map((s: any, setIndex: number) => {
                          // Handle both array and object formats
                          let reps = 0, weight = '', time = 0, rest = 0;
                          
                          if (Array.isArray(s)) {
                            [reps, weight, time, rest] = s;
                          } else if (typeof s === 'object' && s !== null) {
                            reps = s.reps || 0;
                            weight = s.weight || '';
                            time = s.time || 0;
                            rest = s.rest || 0;
                          }
                          
                          const repsStr = reps > 0 ? `${reps} reps` : '';
                          const weightStr = weight ? `${weight}` : '';
                          const timeStr = time > 0 ? `${time} sec` : '';
                          const restStr = rest > 0 ? `${rest} sec rest` : '';
                          const setDetails = [repsStr, weightStr, timeStr, restStr].filter(Boolean).join(' x ');
                          return `Set ${setIndex + 1}: ${setDetails}`;
                        })
                        .join('\n') : 'No sets defined'}
                    details={ex.description || undefined}
                    onDelete={() => {
                      const updated = (editedWorkout.exercises_list || []).filter((_, i) => i !== idx);
                      updateWorkout({ exercises_list: updated });
                    }}
                  />
                ))}
              </View>

              <View style={styles.submitContainer}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  disabled={timeError}
                >
                  Save Changes
                </Button>
              </View>
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}
