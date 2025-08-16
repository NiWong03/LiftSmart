import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseAuth/FirebaseConfig';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// ==================== INTERFACES ====================
export interface Exercise {
  name: string;
  sets: string;
  weight: string;
}

export interface Workout {
  id: string;
  day: string;
  date: Date;
  name: string;
  duration: string;
  startTime: string;  // Add this - "8:30 AM"
  endTime: string;    // Add this - "9:30 AM"
  exercises: number;
  completed: boolean;
  difficulty: string;
  exercises_list: Exercise[];
  userId: string;
}

export interface WorkoutPlan {
  name: string;
  duration: string;
  progress: string;
  workoutsCompleted: number;
  totalWorkouts: number;
  difficulty: string;
  emoji: string;
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  workoutId?: string;
  type?: 'workout' | 'other';
  workout?: Workout;
}

interface WorkoutContextType {
  // State
  currentPlan: WorkoutPlan;
  workouts: Workout[];
  events: CalendarEvent[];
  loading: boolean;
  
  // Plan operations
  updatePlan: (plan: Partial<WorkoutPlan>) => Promise<void>;
  
  // Workout operations (for components to use)
  addWorkout: (workout: Omit<Workout, 'id' | 'userId'>) => Promise<void>;
  updateWorkout: (workoutId: string, updates: Partial<Workout>) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  markWorkoutComplete: (workoutId: string) => Promise<void>;
  markWorkoutIncomplete: (workoutId: string) => Promise<void>;
  
  // Local operations
  updateWorkouts: (workouts: Workout[]) => void;
  addEvent: (event: CalendarEvent) => void;
  getWorkoutEvents: () => CalendarEvent[];
}

// ==================== CONTEXT SETUP ====================
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

// ==================== PROVIDER ====================
interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  // ==================== AUTH & USER ====================
  const currentUser = FIREBASE_AUTH.currentUser;
  const userId = currentUser?.uid;

  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: '1',
      day: 'Monday',
      date: new Date('2025-08-12'),
      name: 'Push Day - Chest & Triceps',
      duration: 'est time',
      startTime: '8:30 AM',
      endTime: '9:30 AM',
      exercises: 6,
      completed: false,
      difficulty: 'Hard',
      exercises_list: [
        { name: 'Bench Press', sets: '4 x 8-10', weight: '135 lbs' },
        { name: 'Incline Dumbbell Press', sets: '3 x 10-12', weight: '65 lbs' },
        { name: 'Chest Flyes', sets: '3 x 12-15', weight: '30 lbs' },
        { name: 'Tricep Dips', sets: '3 x 10-15', weight: 'Bodyweight' },
        { name: 'Overhead Tricep Extension', sets: '3 x 12-15', weight: '40 lbs' },
        { name: 'Diamond Push-ups', sets: '2 x Max', weight: 'Bodyweight' }
      ],
      userId: 'testUserId' // Placeholder for userId
    },
    {
      id: '2',
      day: 'Tuesday',
      date: new Date('2025-08-13'),
      name: 'Pull Day - Back & Biceps',
      duration: 'est time',
      startTime: '8:30 AM',
      endTime: '9:30 AM',
      exercises: 7,
      completed: false,
      difficulty: 'Medium',
      exercises_list: [
        { name: 'Deadlifts', sets: '4 x 6-8', weight: '185 lbs' },
        { name: 'Pull-ups', sets: '4 x 8-12', weight: 'Bodyweight' },
        { name: 'Barbell Rows', sets: '3 x 10-12', weight: '115 lbs' },
        { name: 'Lat Pulldowns', sets: '3 x 12-15', weight: '110 lbs' },
        { name: 'Bicep Curls', sets: '3 x 12-15', weight: '30 lbs' },
        { name: 'Hammer Curls', sets: '3 x 12-15', weight: '25 lbs' },
        { name: 'Face Pulls', sets: '2 x 15-20', weight: '50 lbs' }
      ],
      userId: 'testUserId' // Placeholder for userId
    },
    {
      id: '3',
      day: 'Wednesday',
      date: new Date('2025-08-14'),
      name: 'Leg Day - Quads & Glutes',
      duration: 'est time',
      startTime: '8:30 AM',
      endTime: '9:30 AM',
      exercises: 6,
      completed: false,
      difficulty: 'Hard',
      exercises_list: [
        { name: 'Squats', sets: '4 x 8-10', weight: '155 lbs' },
        { name: 'Romanian Deadlifts', sets: '4 x 10-12', weight: '135 lbs' },
        { name: 'Bulgarian Split Squats', sets: '3 x 12 each leg', weight: '25 lbs' },
        { name: 'Leg Press', sets: '3 x 15-20', weight: '270 lbs' },
        { name: 'Walking Lunges', sets: '3 x 16 steps', weight: '20 lbs' },
        { name: 'Calf Raises', sets: '4 x 15-20', weight: '45 lbs' }
      ],
      userId: 'testUserId' // Placeholder for userId
    },
    {
      id: '4',
      day: 'Thursday',
      date: new Date('2025-08-15'),
      name: 'Upper Body Power',
      duration: 'est time',
      startTime: '8:30 AM',
      endTime: '9:30 AM',
      exercises: 5,
      completed: false,
      difficulty: 'Medium',
      exercises_list: [
        { name: 'Push Press', sets: '4 x 6-8', weight: '95 lbs' },
        { name: 'Explosive Push-ups', sets: '3 x 8-10', weight: 'Bodyweight' },
        { name: 'Medicine Ball Slams', sets: '3 x 12-15', weight: '20 lbs' },
        { name: 'Battle Ropes', sets: '3 x 30 sec', weight: 'N/A' },
        { name: 'Plank to Push-up', sets: '3 x 10-12', weight: 'Bodyweight' }
      ],
      userId: 'testUserId' // Placeholder for userId
    }
  ]);

  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>({
    name: "Plan Name",
    duration: "6 weeks",
    progress: "Week 3 of 6",
    workoutsCompleted: 0,
    totalWorkouts: workouts.length,
    difficulty: "Difficulty Load",
    emoji: "💪"
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // ==================== FIRESTORE DATA LOADING ====================
  useEffect(() => {
    if (!userId) {
      console.log('No user logged in');
      return;
    }

    setLoading(true);

    const workoutsQuery = query(
      collection(FIREBASE_DB, 'workouts'),
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    // stops listening to prevent memory leakes
    const removeListener = onSnapshot(workoutsQuery, (snapshot) => {  
      if (snapshot.empty) {
        return; 
      }

      const firestoreWorkouts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate() // Convert Firestore timestamp to Date
      })) as Workout[];
      
      console.log('Setting workouts from Firestore:', firestoreWorkouts.length);
      setWorkouts(firestoreWorkouts);
    });

    return removeListener;
  }, [userId]);

  // ==================== FIRESTORE OPERATIONS ====================
  const addWorkout = async (workout: Omit<Workout, 'id' | 'userId'>): Promise<void> => {
    if (!userId) throw new Error('No user logged in');
    
    await addDoc(collection(FIREBASE_DB, 'workouts'), {
      ...workout,
      userId
    });
  };

  const updateWorkout = async (workoutId: string, updates: Partial<Workout>): Promise<void> => {
    await updateDoc(doc(FIREBASE_DB, 'workouts', workoutId), updates);
  };

  const deleteWorkout = async (workoutId: string): Promise<void> => {
    await deleteDoc(doc(FIREBASE_DB, 'workouts', workoutId));
  };

  const markWorkoutComplete = async (workoutId: string): Promise<void> => {
    await updateDoc(doc(FIREBASE_DB, 'workouts', workoutId), { completed: true });
  };

  const markWorkoutIncomplete = async (workoutId: string): Promise<void> => {
    await updateDoc(doc(FIREBASE_DB, 'workouts', workoutId), { completed: false });
  };

  const updatePlan = async (planUpdate: Partial<WorkoutPlan>): Promise<void> => {
    setCurrentPlan(prev => ({ ...prev, ...planUpdate }));
  };

  // ==================== LOCAL OPERATIONS ====================
  const updateWorkouts = (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
  };

  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  };

  const getWorkoutEvents = (): CalendarEvent[] => {
    return workouts.map(workout => {
      const workoutDate = new Date(workout.date);
      
      // Parse stored time strings to actual Date objects
      const startTime = parseTimeToDate(workout.startTime, workoutDate);
      const endTime = parseTimeToDate(workout.endTime, workoutDate);

      return {
        title: workout.name,
        start: startTime,
        end: endTime,
        workoutId: workout.id,
        type: 'workout' as const,
        workout: workout
      };
    });
  };

 
  const parseTimeToDate = (timeString: string, date: Date): Date => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    const result = new Date(date);
    result.setHours(hour24, minutes, 0, 0);
    return result;
  };

  // ==================== CONTEXT VALUE ====================
  const value: WorkoutContextType = {
    // State
    currentPlan,
    workouts,
    events,
    loading,
    
    // Firestore operations
    updatePlan,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    markWorkoutComplete,
    markWorkoutIncomplete,
    
    // Local operations
    updateWorkouts,
    addEvent,
    getWorkoutEvents,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
