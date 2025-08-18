import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseAuth/FirebaseConfig';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';



export type Set = [reps: number, weight: string, time: number, rest: number];

// ==================== INTERFACES ====================

export interface Exercise {
  name: string;
  sets: Set[]; // [reps, weight, time, rest]
  description?: string;
}


export interface Workout {
  id: string;
  day: string;
  date: Date | Timestamp;
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
  goal: string;
  workoutsCompleted: number;
  totalWorkouts: number;
  difficulty: string;
  emoji: string;
  planID: string;
  current: boolean;
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
  allPlans: WorkoutPlan[];
  workouts: Workout[];
  events: CalendarEvent[];
  loading: boolean;
  
  // Plan operations
  updatePlan: (plan: Partial<WorkoutPlan>) => Promise<void>;
  addPlan: (plan: Omit<WorkoutPlan, 'planID'>) => Promise<void>;
  
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
        { name: 'Bench Press', sets: [[10, '135 lbs', 20,60]], description: 'Flat barbell press for chest strength' },
        { name: 'Incline Dumbbell Press', sets: [[12, '65 lbs', 20,60]], description: 'Targets upper chest' },
        { name: 'Chest Flyes', sets: [[15, '30 lbs', 20,60]], description: 'Isolation chest exercise' },
        { name: 'Tricep Dips', sets: [[12, 'Bodyweight', 20,60]], description: 'Bodyweight dips for triceps' },
        { name: 'Overhead Tricep Extension', sets: [[15, '40 lbs', 20,60]], description: 'Dumbbell or EZ bar overhead extension' },
        { name: 'Diamond Push-ups', sets: [[20, 'Bodyweight', 20,60]], description: 'Close grip push-ups for triceps' }
      ],
      userId: 'testUserID'
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
        { name: 'Deadlifts', sets: [[8, '185 lbs', 20,60]], description: 'Full body posterior chain exercise' },
        { name: 'Pull-ups', sets: [[10, 'Bodyweight', 20,60]], description: 'Vertical pulling for lats' },
        { name: 'Barbell Rows', sets: [[12, '115 lbs', 20,60]], description: 'Horizontal pull for mid-back' },
        { name: 'Lat Pulldowns', sets: [[15, '110 lbs', 20,60]], description: 'Cable lat pulldown' },
        { name: 'Bicep Curls', sets: [[15, '30 lbs', 20,60]], description: 'Isolation for biceps' },
        { name: 'Hammer Curls', sets: [[15, '25 lbs', 20,60]], description: 'Targets brachialis and forearms' },
        { name: 'Face Pulls', sets: [[20, '50 lbs', 20,60]], description: 'Rear delts and traps' }
      ],
      userId: 'testUserID'
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
        { name: 'Squats', sets: [[10, '155 lbs', 20,60]], description: 'Barbell squats for quads & glutes' },
        { name: 'Romanian Deadlifts', sets: [[12, '135 lbs', 20,60]], description: 'Hamstring & glute focused deadlift' },
        { name: 'Bulgarian Split Squats', sets: [[12, '25 lbs', 20,60]], description: 'Single leg strength exercise' },
        { name: 'Leg Press', sets: [[20, '270 lbs', 20,60]], description: 'Heavy quad/glute push' },
        { name: 'Walking Lunges', sets: [[16, '20 lbs', 20,60]], description: 'Forward lunges with dumbbells' },
        { name: 'Calf Raises', sets: [[20, '45 lbs', 20,60]], description: 'Standing calf raises' }
      ],
      userId: 'testUserID'
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
        { name: 'Push Press', sets: [[8, '95 lbs', 20,60]], description: 'Overhead press with leg drive' },
        { name: 'Explosive Push-ups', sets: [[10, 'Bodyweight', 20,60]], description: 'Plyometric push-ups for power' },
        { name: 'Medicine Ball Slams', sets: [[15, '20 lbs', 20,60]], description: 'Full body explosive movement' },
        { name: 'Battle Ropes', sets: [[30, 'N/A', 20,60]], description: 'High-intensity conditioning ropes' },
        { name: 'Plank to Push-up', sets: [[12, 'Bodyweight', 20,60]], description: 'Core stability with push-up transition' }
      ],
      userId: 'testUserID'
    }
  ]);

  const [allPlans, setAllPlans] = useState<WorkoutPlan[]>([]);
  
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>({
    name: "Plan Name",
    goal: "I want to finish developing app in 6 weeks",
    duration: "6 weeks",
    progress: "Week 3 of 6",
    workoutsCompleted: 0,
    totalWorkouts: workouts.length,
    difficulty: "Difficulty Load",
    emoji: "💪",
    planID: "1",
    current: true
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

    // Load user's plans
    const plansQuery = query(
      collection(FIREBASE_DB, 'plans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const removePlansListener = onSnapshot(plansQuery, (snapshot) => {
      const userPlans = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name || '',
          duration: data.duration || '',
          progress: data.progress || '0%',
          goal: data.goal || '',
          workoutsCompleted: data.workoutsCompleted || 0,
          totalWorkouts: data.totalWorkouts || 0,
          difficulty: data.difficulty || '',
          emoji: data.emoji || '💪',
          planID: doc.id,
          current: data.current || false
        } as WorkoutPlan;
      });
      
      setAllPlans(userPlans);
      
      // Set current plan (first one marked as current, or first plan)
      const currentUserPlan = userPlans.find(plan => plan.current) || userPlans[0];
      if (currentUserPlan) {
        setCurrentPlan(currentUserPlan);
      }
    });

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

    return () => {
      removeListener();
      removePlansListener();
    };
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

  const addPlan = async (plan: Omit<WorkoutPlan, 'planID'>): Promise<void> => {
    if (!userId) throw new Error('No user logged in');
    
    const docRef = await addDoc(collection(FIREBASE_DB, 'plans'), {
      ...plan,
      userId,
      createdAt: Timestamp.now()
    });
    
    // Update the local plan with the generated planID
    console.log('Plan created with ID:', docRef.id);
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
        const workoutDate = workout.date instanceof Timestamp ? workout.date.toDate() : new Date(workout.date);
      
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
    allPlans,
    workouts,
    events,
    loading,
    
    // Firestore operations
    updatePlan,
    addPlan,
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
