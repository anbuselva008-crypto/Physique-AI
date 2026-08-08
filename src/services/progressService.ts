import {
  WeightEntry,
  BodyMeasurements,
  ProgressPhoto,
  ExercisePR,
  ProgressStats,
  ProgressSummary,
} from '../types';
import {
  getWeightHistory,
  addWeightEntry,
  getMeasurements,
  addMeasurementEntry,
  getProgressPhotos,
  addProgressPhoto,
  deleteProgressPhoto,
  getPRs,
  addOrUpdatePR,
  getProgressStats,
  getProgressSummary,
  getFormattedDate,
} from '../utils/progressStorage';

export const progressService = {
  load() {
    return {
      weights: getWeightHistory(),
      measurements: getMeasurements(),
      photos: getProgressPhotos(),
      prs: getPRs(),
      stats: getProgressStats(),
      summary: getProgressSummary(),
    };
  },

  save(weightEntry: WeightEntry): WeightEntry[] {
    return addWeightEntry(weightEntry);
  },

  update(prData: { exerciseName: string; weightKg: number; reps: number; date?: string }): ExercisePR[] {
    return addOrUpdatePR(prData.exerciseName, prData.weightKg, prData.reps, prData.date);
  },

  delete(photoId: string): ProgressPhoto[] {
    return deleteProgressPhoto(photoId);
  },

  statistics() {
    return {
      stats: getProgressStats(),
      summary: getProgressSummary(),
    };
  },

  // Additional Domain Methods
  getWeightHistory(): WeightEntry[] {
    return getWeightHistory();
  },

  addWeightEntry(entry: WeightEntry): WeightEntry[] {
    return addWeightEntry(entry);
  },

  getMeasurements(): BodyMeasurements[] {
    return getMeasurements();
  },

  addMeasurementEntry(entry: Omit<BodyMeasurements, 'id'>): BodyMeasurements[] {
    return addMeasurementEntry(entry);
  },

  getProgressPhotos(): ProgressPhoto[] {
    return getProgressPhotos();
  },

  addProgressPhoto(photo: Omit<ProgressPhoto, 'id'>): ProgressPhoto[] {
    return addProgressPhoto(photo);
  },

  deleteProgressPhoto(id: string): ProgressPhoto[] {
    return deleteProgressPhoto(id);
  },

  getPRs(): ExercisePR[] {
    return getPRs();
  },

  addOrUpdatePR(exerciseName: string, newWeightKg: number, reps: number, date?: string): ExercisePR[] {
    return addOrUpdatePR(exerciseName, newWeightKg, reps, date);
  },

  getProgressStats(): ProgressStats {
    return getProgressStats();
  },

  getProgressSummary(): ProgressSummary {
    return getProgressSummary();
  },

  getFormattedDate(offsetDays: number = 0): string {
    return getFormattedDate(offsetDays);
  },
};
