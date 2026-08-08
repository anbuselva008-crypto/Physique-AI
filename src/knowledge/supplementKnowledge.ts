import { SupplementInfo } from '../types';

export const SUPPLEMENT_KNOWLEDGE_DATABASE: SupplementInfo[] = [
  {
    id: 'supp-1',
    name: 'Creatine Monohydrate',
    recommendedDosage: '3 - 5 grams daily (loading phase of 20g/day for 5 days is optional).',
    timing: 'Any consistent time daily, ideally post-workout with carbohydrate/protein meal.',
    primaryBenefits: [
      'Increases intramuscular phosphocreatine stores for explosive ATP regeneration.',
      'Improves maximal strength, power output, and total training volume by 5-15%.',
      'Enhances cellular hydration (muscle cell volumization) and lean muscle growth.',
      'Supports cognitive performance and mental fatigue resistance under sleep deprivation.'
    ],
    scientificMechanism: 'Donates phosphate groups to ADP to rapidly synthesize ATP during high-intensity short-duration anaerobic exercise.',
    sideEffectsAndSafety: 'Extremely safe and most researched fitness supplement in existence. Initial mild water retention inside muscle cells (not bloat). Drink adequate water.',
    budgetRating: 'Low',
    evidenceLevel: 'Strong'
  },
  {
    id: 'supp-2',
    name: 'Whey / Plant Protein Powder',
    recommendedDosage: '25 - 50 grams per serving (1 - 2 scoops based on daily protein target).',
    timing: 'Post-workout, between meals, or added to oatmeal/smoothies whenever convenient.',
    primaryBenefits: [
      'Convenient, highly bioavailable source of essential amino acids (EAAs and BCAAs).',
      'Triggers Muscle Protein Synthesis (MPS) via high leucine content (~2.5g-3g per scoop).',
      'Supports muscle repair, recovery, and satiety during calorie deficit.'
    ],
    scientificMechanism: 'Rapidly digested and absorbed amino acids elevate plasma amino acid concentrations, activating the mTORC1 pathway for muscle synthesis.',
    sideEffectsAndSafety: 'Lactose intolerant individuals should opt for Whey Isolate or high-quality Pea/Soy Plant Protein blend. Generally safe with no kidney harm in healthy adults.',
    budgetRating: 'Medium',
    evidenceLevel: 'Strong'
  },
  {
    id: 'supp-3',
    name: 'Electrolytes (Sodium, Potassium, Magnesium)',
    recommendedDosage: 'Sodium: 500-1000mg, Potassium: 200-400mg, Magnesium: 100-200mg during/around workouts.',
    timing: 'Before or during intense/sweaty workouts, or immediately upon waking.',
    primaryBenefits: [
      'Prevents muscular cramping, fatigue, and blood pressure drops during heavy training.',
      'Maintains optimal intracellular fluid balance and nerve impulse transmission.',
      'Sustains endurance and muscular contraction force in hot/humid climates.'
    ],
    scientificMechanism: 'Restores key ions lost in sweat required for action potential firing across muscle cell membranes.',
    sideEffectsAndSafety: 'Safe for active individuals sweating regularly. Individuals with hypertension or kidney disease should monitor total sodium intake.',
    budgetRating: 'Low',
    evidenceLevel: 'Strong'
  },
  {
    id: 'supp-4',
    name: 'Caffeine Anhydrous / Pre-Workout',
    recommendedDosage: '150 - 300 mg (approx 3-6 mg/kg bodyweight) 30-45 minutes pre-workout.',
    timing: '30-45 minutes before training. Avoid taking within 6-8 hours of sleep.',
    primaryBenefits: [
      'Increases alertness, central nervous system drive, and focus.',
      'Reduces rating of perceived exertion (RPE), making heavy weights feel lighter.',
      'Increases fat oxidation and acute endurance output.'
    ],
    scientificMechanism: 'Acts as an adenosine receptor antagonist in the brain, preventing adenosine-induced drowsiness and elevating dopamine/adrenaline.',
    sideEffectsAndSafety: 'Can cause jitteriness, anxiety, elevated heart rate, or insomnia if taken too late or in excessive amounts (>400mg). Tolerance develops over time.',
    budgetRating: 'Low',
    evidenceLevel: 'Strong'
  },
  {
    id: 'supp-5',
    name: 'Vitamin D3 (+ K2)',
    recommendedDosage: '1000 - 4000 IU daily (taken with a meal containing fat).',
    timing: 'Morning or early afternoon with a fat-containing meal for absorption.',
    primaryBenefits: [
      'Supports natural testosterone production and hormone synthesis.',
      'Improves bone mineral density and muscular calcium uptake.',
      'Boosts immune function, mood regulation, and recovery efficiency.'
    ],
    scientificMechanism: 'Functions as a pro-hormone regulating over 1000 gene expressions in human tissues including skeletal muscle and immune cells.',
    sideEffectsAndSafety: 'Extremely safe at standard doses. Pairing with Vitamin D3 + K2 ensures proper calcium deposition in bones rather than arterial walls.',
    budgetRating: 'Low',
    evidenceLevel: 'Strong'
  },
  {
    id: 'supp-6',
    name: 'Omega-3 Fish Oil (EPA & DHA)',
    recommendedDosage: '1000 - 3000 mg total EPA + DHA combined daily.',
    timing: 'With major meals (Breakfast or Dinner).',
    primaryBenefits: [
      'Reduces systemic inflammation and joint soreness.',
      'Enhances muscle protein synthesis sensitivity in older adults.',
      'Supports cardiovascular health, triglyceride reduction, and brain cognitive function.'
    ],
    scientificMechanism: 'Integrates into cell membranes, modulating inflammatory eicosanoid pathways and improving membrane fluidity.',
    sideEffectsAndSafety: 'Highly safe. Choose molecularly distilled brands to avoid heavy metal contamination. Mild fishy burps eliminated by taking with meals or keeping softgels frozen.',
    budgetRating: 'Medium',
    evidenceLevel: 'Strong'
  }
];
