export interface PersonaPreferencesDetails {
  coachingStyle: string; // e.g. "Direct, evidence-based, encouraging"
  reminderPreferences: string[]; // e.g. ["Pre-workout notification", "Water intake alert", "Evening macros recap"]
  photoAnalysisEnabled: boolean;
  monthlyReviewEnabled: boolean;
  adaptiveWorkoutEnabled: boolean;
  adaptiveNutritionEnabled: boolean;
}
