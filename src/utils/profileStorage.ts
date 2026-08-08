import { UserProfile } from '../types';

const STORAGE_KEY = 'physique_ai_user_profile';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Anbu',
  age: 20,
  heightCm: 175,
  currentWeightKg: 68,
  targetWeightKg: 74,
  gender: 'Male',
  fitnessGoal: 'Build Muscle',
  trainingExperience: 'Intermediate',
  workoutLocation: 'Gym',
  equipment: ['Barbell', 'Dumbbells', 'Machines', 'Bodyweight'],
  schedule: {
    wakeUpTime: '06:30',
    collegeStart: '08:30',
    collegeEnd: '16:30',
    gymTime: '18:00',
    sleepTime: '22:30',
  },
  diet: 'Chicken',
  monthlyBudget: '3500',
  medicalNotes: '',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  country: 'India',
};

export const getStoredProfile = (): UserProfile => {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_USER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.error('Failed to parse profile from localStorage', err);
  }
  return DEFAULT_USER_PROFILE;
};

export const saveProfileToStorage = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
};
