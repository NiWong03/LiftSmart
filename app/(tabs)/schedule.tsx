import EventDetailCard from '@/components/EventDetailCard';
import AddWorkoutModal from '@/components/plans/AddWorkoutModal';
import { useWorkout } from '@/components/plans/WorkoutContext';
import { ThemedView } from '@/components/ThemedView';
import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { Button, Divider, Menu, useTheme } from 'react-native-paper';

const Schedule: React.FC = () => {  
  const { colors } = useTheme();
  const { height: screenHeight } = Dimensions.get('window');
  const { events, addEvent, getWorkoutEvents } = useWorkout();
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [menuVisible, setMenuVisible] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    day: 'Monday',
    date: new Date().toISOString().split('T')[0],
    name: '',
    startTime: '8:00',
    endTime: '9:00',
    difficulty: 'AI Pending',
    exercises_list: [] as any[]
  });


  const allEvents = useMemo(() => {
    const workoutEvents = getWorkoutEvents();
    return [...events, ...workoutEvents];
  }, [events, getWorkoutEvents]);

  const calendarTheme = {
    palette: {
      primary: {
        main: colors.primary,
        contrastText: colors.onPrimary,
      },
      nowIndicator: colors.primary,
      gray: {
        100: colors.primaryContainer,
        200: colors.outline,
        300: colors.tertiary,
        500: colors.primary,
        800: colors.onBackground,
      },
      moreLabel: colors.primary,
    },
    isRTL: false,
    typography: {
      fontFamily: 'System',
      xs: {
        fontSize: 12,
        fontWeight: '400' as const,
      },
      sm: {
        fontSize: 14,
        fontWeight: '400' as const,
      },
      xl: {
        fontSize: 18,
        fontWeight: '600' as const,
      },
      moreLabel: {
        fontSize: 14,
        fontWeight: '500' as const,
      },
    },
    eventCellOverlappings: [
      { main: colors.secondary, contrastText: colors.onSecondary },
      { main: colors.tertiary, contrastText: colors.onTertiary },
    ],
    moreLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
  };

  const handleAddEvent = (event: {title: string, start: Date, end: Date}) => {
    addEvent({ ...event, type: 'other' });
  }

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<{ title: string; start: Date; end: Date } | null>(null)
  const [isDetailVisible, setIsDetailVisible] = useState(false)

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'week': return 'Week';
      case 'month': return 'Month';
      case 'day': return 'Day';
      default: return 'Week View';
    }
  };

  const handleWorkoutChange = (workout: {
    day: string;
    date: string;
    name: string;
    startTime: string;
    endTime: string;
    difficulty: string;
    exercises_list: any[];
  }) => {
    setNewWorkout(workout);
  };

  return (
    <ThemedView style={styles.calendarContainer}>
      {/* View Mode Dropdown */}
      <View style={styles.dropdownContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={[styles.dropdownButton, { borderColor: colors.primary, backgroundColor: colors.primary }]}
              textColor={"#FFFFFF"}
            >
              {getViewModeLabel()}
            </Button>
          }
          contentStyle={{ backgroundColor: colors.surface }}
        >
          <Menu.Item
            onPress={() => {
              setViewMode('week');
              setMenuVisible(false);
            }}
            title="Week View"
            titleStyle={{ color: colors.onSurface }}
            leadingIcon="calendar-week"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setViewMode('month');
              setMenuVisible(false);
            }}
            title="Month View"
            titleStyle={{ color: colors.onSurface }}
            leadingIcon="calendar-month"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setViewMode('day');
              setMenuVisible(false);
            }}
            title="Day View"
            titleStyle={{ color: colors.onSurface }}
            leadingIcon="calendar"
          />
        </Menu>
      </View>

      <Calendar
        onPressCell={(date) => {
          const fullMonthName = date.toLocaleDateString('default', {month: 'long'});
          if (viewMode === 'month') {
            console.log('you pressed:', fullMonthName, date.getDate());
            // In month view, set the date for the workout
            setNewWorkout(prev => ({
              ...prev,
              date: date.toISOString().split('T')[0],
              day: date.toLocaleDateString('default', { weekday: 'long' })
            }));
          } else {
            console.log('you pressed:', fullMonthName, date.getDate(), "at", date.getHours());
            // In week/day view, set both date and time
            setNewWorkout(prev => ({
              ...prev,
              date: date.toISOString().split('T')[0],
              day: date.toLocaleDateString('default', { weekday: 'long' }),
              startTime: date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: new Date(date.getTime() + 60 * 60 * 1000).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: false })
            }));
          }
          setIsModalVisible(true);
        }}
        events={allEvents}
        height={screenHeight}
        onPressEvent={(event) => {
          // react-native-big-calendar passes event object
          setSelectedEvent(event as { title: string; start: Date; end: Date });
          setIsDetailVisible(true);
        }}
        ampm={true}
        hourRowHeight={Math.max(40, screenHeight * 0.08)}
        mode={viewMode}
        theme={calendarTheme}
        showAdjacentMonths={true}
        eventMinHeightForMonthView={22}
      />

      <AddWorkoutModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        newWorkout={newWorkout}
        onWorkoutChange={handleWorkoutChange}
        onSubmit={() => {
          // Handle workout submission logic here
          setIsModalVisible(false);
        }}
      />

      <EventDetailCard

        visible={isDetailVisible}
        event={selectedEvent}
        onDismiss={() => setIsDetailVisible(false)}
      />
      
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    paddingTop: 60,
    flex: 1,
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1000,
  },
  dropdownButton: {
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
  },
  headerContainer: {
    height: 'auto', 
    borderBottomWidth: 1,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
export default Schedule;