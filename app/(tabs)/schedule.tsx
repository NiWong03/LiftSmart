import EventModalComponent from '@/components/eventModal';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar } from 'react-native-big-calendar';








const Schedule: React.FC = () => {  
  const [events, setEvents] = useState([
    {
      title: 'Gym session',
      start: new Date(2025, 7, 5, 8, 0),
      end: new Date(2025, 7, 5, 9, 0),
    },
    {
      title: 'Meeting',
      start: new Date(2025, 7, 6, 13, 45),
      end: new Date(2025, 7, 6, 16, 30),
    },
  ]);

  const handleAddEvent = (event: {title: string, start: Date, end: Date}) => {
    setEvents(prevEvents => [...prevEvents, event]);
  }

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [date, setDate] = useState(new Date())
  return (
    <ThemedView style={styles.calendarContainer}>
      <Calendar
        onPressCell={(date) => {
          const fullMonthName = date.toLocaleDateString('default', {month: 'long'})
          console.log('you pressed:', fullMonthName, date.getDate(), "at", date.getHours());
          setIsModalVisible(true);
          setDate(date);
        }}
        events={events}
        height={1000}
        onPressEvent={(event) => console.log(event.title)}
        ampm={true}
        hourRowHeight={80}
        headerContainerStyle={styles.headerContainer}
        headerContentStyle={styles.headerContent}
          
      />

      <EventModalComponent 
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        date={date}
        setDate={setDate}
        onAddEvent={handleAddEvent}
      />
      
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    paddingTop: 60,
    flex: 0.91,
  },
  headerContainer: {
    height: 100,
  },
  headerContent: {
    
  },
});
export default Schedule;