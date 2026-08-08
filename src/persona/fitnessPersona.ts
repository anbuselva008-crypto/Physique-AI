export interface FitnessPersonaDetails {
  goal: string;
  trainingLevel: string; // e.g. "Beginner", "Intermediate", "Advanced"
  preferredWorkoutTime: string; // e.g. "06:30 AM" or "6:00 PM"
  preferredWorkoutDays: string[]; // e.g. ["Monday", "Wednesday", "Friday", "Saturday"]
  availableEquipment: string[]; // e.g. ["Barbell", "Dumbbells", "Cables", "Pull-up Bar"]
}
