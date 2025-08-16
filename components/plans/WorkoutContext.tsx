import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Set = [reps: number, weight: string, time: number, rest: number];


export interface Exercise {
  name: string;
  sets: Set[]; // [reps, weight, time, rest]
  description?: string;
}

export interface Workout {
  id: string;
  day: string;
  date: Date;
  name: string;
  duration: string;
  exercises: number;
  completed: boolean;
  difficulty: string;
  exercises_list: Exercise[];
}


export interface WorkoutPlan {
  id: string;
  name: string;
  current: boolean;
  goal:string;
  duration: number;
  progress: string;
  workoutsCompleted: number;
  totalWorkouts: number;
  difficulty: string;
  emoji: string;
  workouts: Workout[];
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
  currentPlan: WorkoutPlan;
  allPlans: WorkoutPlan[];
  workouts: Workout[];
  events: CalendarEvent[];
  updatePlan: (plan: Partial<WorkoutPlan>) => void;
  updateWorkouts: (workouts: Workout[]) => void;
  addEvent: (event: CalendarEvent) => void;
  getWorkoutEvents: () => CalendarEvent[];
  markWorkoutComplete: (workoutId: string) => void;
  markWorkoutIncomplete: (workoutId: string) => void;
  addPlan: (plan: Omit<WorkoutPlan, 'id'>) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: '1',
      day: 'Monday',
      date: new Date('2025-08-12'),
      name: 'Push Day - Chest & Triceps',
      duration: 'est time',
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
      ]
    },
    {
      id: '2',
      day: 'Tuesday',
      date: new Date('2025-08-13'),
      name: 'Pull Day - Back & Biceps',
      duration: 'est time',
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
      ]
    },
    {
      id: '3',
      day: 'Wednesday',
      date: new Date('2025-08-14'),
      name: 'Leg Day - Quads & Glutes',
      duration: 'est time',
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
      ]
    },
    {
      id: '4',
      day: 'Thursday',
      date: new Date('2025-08-15'),
      name: 'Upper Body Power',
      duration: 'est time',
      exercises: 5,
      completed: false,
      difficulty: 'Medium',
      exercises_list: [
        { name: 'Push Press', sets: [[8, '95 lbs', 20,60]], description: 'Overhead press with leg drive' },
        { name: 'Explosive Push-ups', sets: [[10, 'Bodyweight', 20,60]], description: 'Plyometric push-ups for power' },
        { name: 'Medicine Ball Slams', sets: [[15, '20 lbs', 20,60]], description: 'Full body explosive movement' },
        { name: 'Battle Ropes', sets: [[30, 'N/A', 20,60]], description: 'High-intensity conditioning ropes' },
        { name: 'Plank to Push-up', sets: [[12, 'Bodyweight', 20,60]], description: 'Core stability with push-up transition' }
      ]
    }
  ]);


  const [allPlans, setAllPlans] = useState<WorkoutPlan[]>([
    {
      id: "1",
      name: "Plan Name",
      current: true,
      duration: 6,
      progress: "",
      workoutsCompleted: 0,
      totalWorkouts: workouts.length,
      difficulty: "Difficulty Load",
      emoji: "💪",
      goal:" I want to finish creating a fitness app in 6 weeks",
      workouts:[]
    }
  ]);


  const currentPlan = allPlans.find(plan => plan.current) || allPlans[0];


  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      title: 'Meeting',
      start: new Date(2025, 7, 6, 13, 45),
      end: new Date(2025, 7, 6, 16, 30),
      type: 'other'
    },
  ]);

  // Convert workout duration string to minutes
  // is this even being used? Probably switch to AI implementation later
  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60; // default to 60 minutes
  };

  // Convert workouts to calendar events
  const getWorkoutEvents = (): CalendarEvent[] => {
    return workouts.map(workout => {
      const workoutDate = new Date(workout.date);
      const startTime = new Date(workoutDate);
      startTime.setHours(8, 0, 0, 0); // Default start time 8:00 AM
      
      const durationMinutes = parseDuration(workout.duration);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + durationMinutes);

      return {
        title: `${workout.name}`,
        start: startTime,
        end: endTime,
        workoutId: workout.id,
        type: 'workout' as const,
        workout: workout
      };
    });
  };

  const updatePlan = (planUpdate: Partial<WorkoutPlan>) => {
    setAllPlans(prev => 
      prev.map(plan => 
        plan.current ? { ...plan, ...planUpdate } : plan
      )
    );
  };

  const updateWorkouts = (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
  };

  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  };

  const markWorkoutComplete = (workoutId: string) => {
    setWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? { ...workout, completed: true }
          : workout
      )
    );
    // Update plan completion count
    const completedCount = workouts.filter(w => w.completed || w.id === workoutId).length;
    setAllPlans(prev => 
      prev.map(plan => 
        plan.current ? { ...plan, workoutsCompleted: completedCount } : plan
      )
    );
  };

  const markWorkoutIncomplete = (workoutId: string) => {
    setWorkouts(prev => {
      const updatedWorkouts = prev.map(workout =>
        workout.id === workoutId ? { ...workout, completed: false } : workout
      );
      
      const completedCount = updatedWorkouts.filter(w => w.completed).length;

      setAllPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.current ? { ...plan, workoutsCompleted: completedCount } : plan
        )
      );

      return updatedWorkouts;
    });
  };

  const addPlan = (plan: Omit<WorkoutPlan, 'id'>) => {
    const newPlan: WorkoutPlan = {
      ...plan,
      id: (allPlans.length + 1).toString()
    };
    setAllPlans(prev => [...prev, newPlan]);
  };


const value: WorkoutContextType = {
    currentPlan,
    allPlans,
    workouts,
    events,
    updatePlan,
    updateWorkouts,
    addEvent,
    getWorkoutEvents,
    markWorkoutComplete,
    markWorkoutIncomplete,
    addPlan,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
