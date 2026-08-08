import { UserProfile } from '../types';
import { getStoredProfile, saveProfileToStorage, DEFAULT_USER_PROFILE } from '../utils/profileStorage';

export const profileService = {
  load(): UserProfile {
    return getStoredProfile();
  },

  save(profile: UserProfile): UserProfile {
    saveProfileToStorage(profile);
    return profile;
  },

  update(partialProfile: Partial<UserProfile>): UserProfile {
    const current = this.load();
    const updated: UserProfile = { ...current, ...partialProfile };
    saveProfileToStorage(updated);
    return updated;
  },

  delete(): UserProfile {
    saveProfileToStorage(DEFAULT_USER_PROFILE);
    return DEFAULT_USER_PROFILE;
  },

  statistics() {
    const p = this.load();
    const heightInMeters = p.heightCm / 100;
    const bmi = +(p.currentWeightKg / (heightInMeters * heightInMeters)).toFixed(1);
    const weightToGoalKg = +(p.targetWeightKg - p.currentWeightKg).toFixed(1);

    return {
      name: p.name,
      age: p.age,
      heightCm: p.heightCm,
      currentWeightKg: p.currentWeightKg,
      targetWeightKg: p.targetWeightKg,
      weightToGoalKg,
      bmi,
      fitnessGoal: p.fitnessGoal,
      experience: p.trainingExperience,
      location: p.workoutLocation,
      diet: p.diet,
      city: p.city,
    };
  },
};
