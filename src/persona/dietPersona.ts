export interface DietPersonaDetails {
  foodBudget: string; // e.g. "₹3,000 / month" or "Student Budget"
  dietaryPreferences: string[]; // e.g. ["High Protein", "Non-Vegetarian", "Eggitarian"]
  foodsLiked: string[]; // e.g. ["Chicken Breast", "Eggs", "Oats", "Paneer", "Bananas"]
  foodsAvoided: string[]; // e.g. ["Processed Junk", "Excess Sugar", "Lactose"]
  cookingAbility: string; // e.g. "Basic Meal Prep", "Hostel Microwave", "Full Kitchen"
  hydration: string; // e.g. "3.5 Liters/day"
}
