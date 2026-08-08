export interface PersonaConstraintsDetails {
  availableTime: string; // e.g. "60-75 mins per day"
  recoveryLimits: string; // e.g. "Slight shoulder tightness, needs 48h rest between heavy press"
  budgetLimits: string; // e.g. "Strict ₹200/day max food expenditure"
  collegeConstraints: string[]; // e.g. ["80% mandatory attendance", "No cooking in hostel room"]
}
