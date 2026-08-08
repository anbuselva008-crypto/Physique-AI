export interface UserPersonalDetails {
  name: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  college: string;
  occupation: string;
}

export interface UserBodyDetails {
  height: number; // in cm
  weight: number; // in kg
  estimatedBodyFat: number; // percentage e.g. 15.5
  goalBodyFat: number; // percentage e.g. 12.0
  bodyType: string; // e.g. "Mesomorph", "Ectomorph", "Endomorph"
  weakAreas: string[];
  strongAreas: string[];
}

export interface UserPersonaPersonalModule {
  personal: UserPersonalDetails;
  body: UserBodyDetails;
}
