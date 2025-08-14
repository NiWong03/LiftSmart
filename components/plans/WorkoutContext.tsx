import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Exercise {
  name: string;
  sets: string; //set.rep.weight set.rep.time
  // reps: number;
  weight: string; //optional
  // time: number;
  //description/notes: string, href 
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
        { name: 'Bench Press', sets: '4 x 8-10', weight: '135 lbs' },
        { name: 'Incline Dumbbell Press', sets: '3 x 10-12', weight: '65 lbs' },
        { name: 'Chest Flyes', sets: '3 x 12-15', weight: '30 lbs' },
        { name: 'Tricep Dips', sets: '3 x 10-15', weight: 'Bodyweight' },
        { name: 'Overhead Tricep Extension', sets: '3 x 12-15', weight: '40 lbs' },
        { name: 'Diamond Push-ups', sets: '2 x Max', weight: 'Bodyweight' }
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
        { name: 'Deadlifts', sets: '4 x 6-8', weight: '185 lbs' },
        { name: 'Pull-ups', sets: '4 x 8-12', weight: 'Bodyweight' },
        { name: 'Barbell Rows', sets: '3 x 10-12', weight: '115 lbs' },
        { name: 'Lat Pulldowns', sets: '3 x 12-15', weight: '110 lbs' },
        { name: 'Bicep Curls', sets: '3 x 12-15', weight: '30 lbs' },
        { name: 'Hammer Curls', sets: '3 x 12-15', weight: '25 lbs' },
        { name: 'Face Pulls', sets: '2 x 15-20', weight: '50 lbs' }
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
        { name: 'Squats', sets: '4 x 8-10', weight: '155 lbs' },
        { name: 'Romanian Deadlifts', sets: '4 x 10-12', weight: '135 lbs' },
        { name: 'Bulgarian Split Squats', sets: '3 x 12 each leg', weight: '25 lbs' },
        { name: 'Leg Press', sets: '3 x 15-20', weight: '270 lbs' },
        { name: 'Walking Lunges', sets: '3 x 16 steps', weight: '20 lbs' },
        { name: 'Calf Raises', sets: '4 x 15-20', weight: '45 lbs' }
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
        { name: 'Push Press', sets: '4 x 6-8', weight: '95 lbs' },
        { name: 'Explosive Push-ups', sets: '3 x 8-10', weight: 'Bodyweight' },
        { name: 'Medicine Ball Slams', sets: '3 x 12-15', weight: '20 lbs' },
        { name: 'Battle Ropes', sets: '3 x 30 sec', weight: 'N/A' },
        { name: 'Plank to Push-up', sets: '3 x 10-12', weight: 'Bodyweight' }
      ]
    }
  ]);

  const [allPlans, setAllPlans] = useState<WorkoutPlan[]>([
    {
      id: "1",
      name: "Plan Name",
      current: true,
      duration: 6,
      progress: "Week 3 of 6",
      workoutsCompleted: 0,
      totalWorkouts: workouts.length,
      difficulty: "Difficulty Load",
      emoji: "💪",
      goal:"",
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
