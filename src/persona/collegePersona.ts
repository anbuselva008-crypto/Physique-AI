export interface CollegePersonaDetails {
  collegeName: string;
  department: string;
  academicYear: string;
  canteenOptions: string[];
  hostelStatus: string; // e.g. "Hostel Resident", "Day Scholar", "PG"
  scheduleFlexibility: string; // e.g. "Medium", "High during weekends", "Low during exams"
}
