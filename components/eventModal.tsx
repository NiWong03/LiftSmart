import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, TextInput, StyleSheet, ScrollView, Text} from 'react-native';
import DatePicker from 'react-native-date-picker'
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { setStatusBarNetworkActivityIndicatorVisible, setStatusBarTranslucent } from 'expo-status-bar';
import { useSortedScreens } from 'expo-router/build/useScreens';
import { startScreenTransition } from 'react-native-reanimated';



type EventModalProps = {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  date: (Date)
  setDate: (date: Date) => void;
  onAddEvent: (event: { title: string; start: Date, end: Date}) => void;
};






const EventModalComponent: React.FC<EventModalProps> = ({isModalVisible, setIsModalVisible, date, onAddEvent}) => {  
  const [title, setTitle] = useState('');
  const [showDone, setShowdone] = useState(true);
  const [startTime, setStartTime] = useState(date);
  const [endTime, setEndTime] = useState(() => {
    const d = new Date(date)
    d.setHours(d.getHours() + 1);
    return d;
  })

  const [endTimeError, setEndError] = useState(false);

  useEffect(() => {
    setShowdone(true);
    setEndError(false);
    setStartTime(date);
    const d = new Date(date);
    d.setHours(date.getHours() + 1, 0, 0, 0);
    setEndTime(d);
  }, [date, isModalVisible])
  
  const handleStartTimeChange = (selectedDate: Date) => {
    setStartTime(selectedDate);
    if (selectedDate.getHours() === endTime.getHours() && selectedDate.getMinutes() === endTime.getMinutes()) {
      const newEnd = new Date(selectedDate);
      newEnd.setHours(selectedDate.getHours()+1, selectedDate.getMinutes(), 0, 0);
      setEndTime(newEnd);
      setEndError(false);
      setShowdone(true);
    }
    else {
      validateTimes(selectedDate, endTime);
    }
  }

  const handleEndTimeChange = (selectedDate: Date) => {
    setEndTime(selectedDate);
    validateTimes(startTime, selectedDate);
  }



  const validateTimes = (start: Date, end: Date) => {
    if (end.getHours() < start.getHours() || (end.getHours() === start.getHours() && end.getMinutes() < start.getMinutes())) {
      setEndError(true);
      setShowdone(false);
    }
    else {
      setEndError(false);
      setShowdone(true);
    }
  }


  const handleDonePress = () => {
    onAddEvent({
    title,
    start: startTime,
    end: endTime,
    });
    setIsModalVisible(false);
    setTitle('');
  };

  return (
      <ThemedView>
          <Modal visible={isModalVisible} animationType='slide'  onRequestClose={() => setIsModalVisible(false)}>
            <ThemedView style={styles.topBarContainer}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeContainer}>
                  <ThemedText style={styles.closeText}>
                      Close
                  </ThemedText>
              </TouchableOpacity>
            {showDone &&
              <TouchableOpacity style={styles.doneContainer} onPress={handleDonePress}>
                <ThemedText style={styles.doneText}>
                  Done
                </ThemedText>
              </TouchableOpacity>
            }
            </ThemedView>

            <ScrollView>

              <TextInput
                value={title}
                onChangeText={newText => setTitle(newText)}  
                placeholder='Add a title'
                style={styles.inputContainer}
              />
              <ThemedView style={styles.datePickerContainer}>
                <DateTimePicker
                  value={date}
                  onChange={() => setShowdone(true)}
                />
                <DateTimePicker //start hours
                    value={startTime}
                    mode='time'
                    onChange={(event, selectedDate) => {
                      if (selectedDate) handleStartTimeChange(selectedDate);
                    }}
                  />
                <Text style={styles.toText}>to</Text>
                <ThemedView>
                  <DateTimePicker //end hours
                    value={endTime}
                    mode='time'
                    onChange={(event, selectedDate) => {
                      if (selectedDate) handleEndTimeChange(selectedDate);
                    }}
                  />
                  {endTimeError && <ThemedText style={styles.pickerError}>
                    End time cannot be before start time!
                  </ThemedText>}
                  
                </ThemedView>
              </ThemedView>
            </ScrollView>
          </Modal>
      </ThemedView>
  );
};

const styles = StyleSheet.create({
  topBarContainer: {
    flexDirection: 'row',
  },
  closeContainer: {
    borderRadius: 10,
    width: 80,
    height: 60,
    marginLeft: 15,
    marginTop: 50, 
  },
  closeText: {
    fontSize: 27,
    paddingTop: 22,
    paddingLeft: 6,
    color: 'rgba(49, 222, 72, 1)',
  },
  inputContainer: {
    marginLeft: 145,
    fontSize: 29,
  },
  datePickerContainer: {
    marginLeft: 40,
    marginTop: 10,
    flexDirection: 'row',
  },
  toText: {
    marginLeft: 10,
    marginTop: 5,
    fontSize: 22,
  },
  doneContainer: {
    marginLeft: 250,
    marginTop: 50,
    borderRadius: 10,
    width: 80,
    height: 60,
  },
  doneText: {
    color: 'rgba(49, 222, 72, 1)',
    fontSize: 27,
    paddingTop: 22,
    paddingLeft: 7,
  },
  pickerError: {
    maxWidth: 100,
    color: 'red',
    paddingLeft: 13,
  },
});
export default EventModalComponent;