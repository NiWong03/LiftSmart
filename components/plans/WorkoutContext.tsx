import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseAuth/FirebaseConfig';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
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
  planId?: string; // Optional field to link workout to a specific plan
}

export interface WorkoutPlan {
  name: string;
  duration: number;
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
  deletingPlans: string[];
  
  // Plan operations
  updatePlan: (plan: Partial<WorkoutPlan>) => Promise<void>;
  addPlan: (plan: Omit<WorkoutPlan, 'planID'>, workouts?: Workout[]) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  startPlanDeletion: (planId: string) => void;
  
  // Workout operations (for components to use)
  addWorkout: (workout: Omit<Workout, 'id' | 'userId'>, planId?: string) => Promise<void>;
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
  

   const [workouts, setWorkouts] = useState<Workout[]>([]);

  const [allPlans, setAllPlans] = useState<WorkoutPlan[]>([]);
  const [deletingPlans, setDeletingPlans] = useState<string[]>([]);
  
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>({
    name: "Plan Name",
    goal: "I want to finish developing app in 6 weeks",
    duration: 6,
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
    // 
    if (!userId) {
      
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
      where('userId', '==', userId)
    );

    
        // stops listening to prevent memory leakes
    const removeListener = onSnapshot(workoutsQuery, 
      (snapshot) => {

        if (snapshot.empty) {
          setWorkouts([]);
          return; 
        }

        const firestoreWorkouts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            day: data.day || '',
            name: data.name || '',
            duration: data.duration || '',
            startTime: data.startTime || '', 
            endTime: data.endTime || '', 
            exercises: data.exercises || 0,
            completed: data.completed || false,
            difficulty: data.difficulty || '',
            userId: data.userId || '',
            planId: data.planId || '', // Include planId field
            date: data.date?.toDate ? data.date.toDate() : 
                  data.date instanceof Date ? data.date : new Date(data.date), // Convert Firestore timestamp to Date
            // Ensure exercises_list is properly structured
            exercises_list: data.exercises_list?.map((exercise: any) => ({
              name: exercise.name || '',
              sets: exercise.sets?.map((set: any) => {
                // Handle both array and object formats
                if (Array.isArray(set)) {
                  return set; // Keep as array if it's already in array format
                } else if (typeof set === 'object' && set !== null) {
                  // Convert object format back to array format
                  return [set.reps || 0, set.weight || '', set.time || 0, set.rest || 0];
                }
                return [0, '', 0, 0]; // Default fallback
              }) || [],
              description: exercise.description || ''
            })) || []
          } as Workout;
        });
        



         
         // Debug time values
         firestoreWorkouts.forEach(workout => {
           // Time values are now properly handled
         });
         setWorkouts(firestoreWorkouts);
         setLoading(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
      }
    );

    return () => {
      removeListener();
      removePlansListener();
    };
  }, [userId]);

  // ==================== FIRESTORE OPERATIONS ====================
  const addWorkout = async (workout: Omit<Workout, 'id' | 'userId'>, planId?: string): Promise<void> => {
    if (!userId) throw new Error('No user logged in');
    
    const workoutData = {
      ...workout,
      userId,
      planId, // Link workout to plan if provided
    };
    
    await addDoc(collection(FIREBASE_DB, 'workouts'), workoutData);
  };

  const updateWorkout = async (workoutId: string, updates: Partial<Workout>): Promise<void> => {
    // Clean the updates to make them Firestore-serializable
    const cleanUpdates: any = { ...updates };
    
    // Handle date conversion (only for the date field, not time strings)
    if (updates.date) {
      cleanUpdates.date = updates.date instanceof Timestamp ? updates.date : Timestamp.fromDate(new Date(updates.date));
    }
    
    // Ensure time strings are preserved as strings (not converted to Date objects)
    if (updates.startTime) {
      cleanUpdates.startTime = updates.startTime.toString();
    }
    if (updates.endTime) {
      cleanUpdates.endTime = updates.endTime.toString();
    }
    
    // Handle exercises_list cleaning
    if (updates.exercises_list) {
      cleanUpdates.exercises_list = updates.exercises_list.map(exercise => ({
        name: exercise.name || '',
        sets: exercise.sets?.map(set => ({
          reps: set[0] || 0,
          weight: set[1] || '',
          time: set[2] || 0,
          rest: set[3] || 0
        })) || [],
        description: exercise.description || ''
      }));
    }
    
    // Update exercises count if exercises_list is being updated
    if (updates.exercises_list) {
      cleanUpdates.exercises = updates.exercises_list.length;
    }
    


    // Update local state immediately for instant UI feedback
    setWorkouts(prevWorkouts => 
      prevWorkouts.map(workout => 
        workout.id === workoutId 
          ? { 
              ...workout, 
              // Only update specific fields, ensuring date is always a Date object
              ...(updates.startTime && { startTime: updates.startTime }),
              ...(updates.endTime && { endTime: updates.endTime }),
              ...(updates.duration && { duration: updates.duration }),
              ...(updates.name && { name: updates.name }),
              ...(updates.day && { day: updates.day }),
              ...(updates.completed !== undefined && { completed: updates.completed }),
              ...(updates.difficulty && { difficulty: updates.difficulty }),
              ...(updates.exercises_list && { exercises_list: updates.exercises_list }),
              // Handle date conversion explicitly
              ...(updates.date && { 
                date: updates.date instanceof Timestamp ? updates.date.toDate() : 
                      updates.date instanceof Date ? updates.date : new Date(updates.date)
              }),
              // Update exercises count if exercises_list is being updated
              ...(updates.exercises_list && { exercises: updates.exercises_list.length })
            }
          : workout
      )
    );
    

    try {
      // Try to update the document first
      const docRef = doc(FIREBASE_DB, 'workouts', workoutId);
      await updateDoc(docRef, cleanUpdates);

    } catch (error: any) {
      // If the document doesn't exist, create it
      if (error.code === 'not-found') {

        const docRef = doc(FIREBASE_DB, 'workouts', workoutId);
        await setDoc(docRef, {
          ...cleanUpdates,
          userId
        });

      } else {
        console.error('Error updating workout in Firestore:', error);
        throw error;
      }
    }
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

  const updatePlan = async (planUpdate: Partial<WorkoutPlan> & { planID?: string }): Promise<void> => {
    if (!userId) throw new Error('No user logged in');
    
    const planId = planUpdate.planID;
    if (!planId) throw new Error('Plan ID is required for update');
    
    try {
      // If this plan is being set as current, unset all other plans first
      if (planUpdate.current === true) {

        
        // Update all other plans to not be current
        const otherPlans = allPlans.filter(plan => plan.planID !== planId);
        for (const otherPlan of otherPlans) {
          const otherPlanRef = doc(FIREBASE_DB, 'plans', otherPlan.planID);
          await updateDoc(otherPlanRef, { current: false });
        }
        
        // Update local state for other plans
        setAllPlans(prevPlans => 
          prevPlans.map(plan => 
            plan.planID !== planId 
              ? { ...plan, current: false }
              : plan
          )
        );
      }
      
      // Update the target plan
      const planRef = doc(FIREBASE_DB, 'plans', planId);
      await updateDoc(planRef, planUpdate);
      
      // Update local state
      setAllPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.planID === planId 
            ? { ...plan, ...planUpdate }
            : plan
        )
      );
      
      // Update currentPlan if it's the one being updated
      setCurrentPlan(prev => 
        prev.planID === planId 
          ? { ...prev, ...planUpdate }
          : prev
      );
      

    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  };

  const addPlan = async (plan: Omit<WorkoutPlan, 'planID'>, workouts?: Workout[]): Promise<void> => {
    if (!userId) throw new Error('No user logged in');
    



    
    try {
      // Check if this is the first plan - if so, set it as current
      const isFirstPlan = allPlans.length === 0;
      
      // First, create the plan to get its ID
      const planData = {
        ...plan,
        userId,
        createdAt: Timestamp.now(),
        current: isFirstPlan, // Set as current if it's the first plan
      };
      
      const planDocRef = await addDoc(collection(FIREBASE_DB, 'plans'), planData);
      const planId = planDocRef.id;
      

      
      if (workouts && workouts.length > 0) {

        
        // Clean workout data to make it Firestore-serializable
        const cleanWorkouts = workouts.map((workout, index) => {
          
          const cleanedWorkout = {
            ...workout,
            userId,
            planId, // Link workout to this plan
            // Ensure date is a Timestamp
            date: workout.date instanceof Timestamp ? workout.date : Timestamp.fromDate(new Date(workout.date)),
            // Fix nested array error for workouts
            exercises_list: workout.exercises_list?.map(exercise => ({
              name: exercise.name || '',
              sets: exercise.sets?.map(set => ({
                reps: set[0] || 0,
                weight: set[1] || '',
                time: set[2] || 0,
                rest: set[3] || 0
              })) || [],
              description: exercise.description || ''
            })) || []
          };
          
          
          return cleanedWorkout;
        });
        

        const workoutPromises = cleanWorkouts.map(async (workout, index) => {
          try {
            const docRef = await addDoc(collection(FIREBASE_DB, 'workouts'), workout);

            return docRef;
          } catch (error) {
            console.error(`Error adding workout ${index + 1}:`, error);
            throw error;
          }
        });
        
        await Promise.all(workoutPromises);
        console.log('All workouts added successfully:', workouts.length);
      } else {
        console.log('No workouts to add to Firestore');
      }
    } catch (error) {
      console.error('Error in addPlan:', error);
      throw error;
    }
  };

  const startPlanDeletion = (planId: string): void => {
    setDeletingPlans(prev => [...prev, planId]);
  };

  const deletePlan = async (planId: string): Promise<void> => {
    if (!userId) throw new Error('No user logged in');
    
    // Remove from deleting plans when deletion is complete
    try {
      await deleteDoc(doc(FIREBASE_DB, 'plans', planId));
      setAllPlans(prevPlans => prevPlans.filter(plan => plan.planID !== planId));
      if (currentPlan.planID === planId) {
        setCurrentPlan({
          name: "Plan Name",
          goal: "I want to finish developing app in 6 weeks",
          duration: 6,
          progress: "Week 3 of 6",
          workoutsCompleted: 0,
          totalWorkouts: 0,
          difficulty: "Difficulty Load",
          emoji: "💪",
          planID: "1",
          current: true
        });
      }
      console.log('Plan deleted successfully:', planId);
    } finally {
      setDeletingPlans(prev => prev.filter(id => id !== planId));
    }
  };

  // ==================== LOCAL OPERATIONS ====================
  const updateWorkouts = (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
  };

  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  };

      const getWorkoutEvents = (): CalendarEvent[] => {
      return workouts
        .filter(workout => workout.planId === currentPlan.planID) // Only show workouts from current plan
        .map(workout => {
          const workoutDate = workout.date instanceof Timestamp ? workout.date.toDate() : 
                             workout.date instanceof Date ? workout.date : new Date(workout.date);
        
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
    // Handle empty or undefined time strings
    if (!timeString || timeString.trim() === '') {
      return date;
    }
    
    const [time, period] = timeString.split(' ');
    
    if (!time || !period) {
      return date;
    }
    
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
    deletingPlans,
    
    // Firestore operations
    updatePlan,
    addPlan,
    deletePlan,
    startPlanDeletion,
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
