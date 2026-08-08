import { TrainingScienceConcept } from '../types';

export const TRAINING_SCIENCE_DATABASE: TrainingScienceConcept[] = [
  {
    id: 'ts-1',
    title: 'Progressive Overload',
    summary: 'The gradual increase of stress placed upon the musculoskeletal system during resistance training to force adaptation and continuous growth.',
    keyPrinciples: [
      'Increase load (weight) while keeping reps and form constant.',
      'Increase repetitions completed with the same weight.',
      'Increase number of sets per exercise or muscle group.',
      'Improve execution quality, range of motion, and tempo control.',
      'Decrease rest periods while maintaining power output.'
    ],
    practicalApplication: 'Track every workout in a log. Aim to add 1 rep or 1-2.5 kg to primary compound movements every week or two.',
    commonMisconceptions: [
      'Progressive overload requires adding weight every single workout.',
      'Ego lifting with poor form counts as overload.',
      'Changing exercises constantly is necessary to confuse muscles.'
    ]
  },
  {
    id: 'ts-2',
    title: 'Hypertrophy',
    summary: 'The enlargement of skeletal muscle fiber cross-sectional area through mechanical tension, metabolic stress, and muscle damage.',
    keyPrinciples: [
      'Mechanical tension is the primary driver of muscle hypertrophy.',
      'Train close to failure (RIR 1-3) to recruit high-threshold motor units.',
      'Optimal rep range for efficiency is 6 to 15 reps, though 5-30 reps stimulate growth if taken close to failure.',
      'Target each muscle group 2 times per week for optimal stimulus-to-fatigue ratio.',
      'Ensure sufficient total weekly volume (10-20 hard sets per muscle group).'
    ],
    practicalApplication: 'Perform 3-4 sets of 8-12 reps per exercise with controlled eccentrics (2-3 seconds down) and explode up.',
    commonMisconceptions: [
      'High reps tone muscle and low reps build bulk; muscle growth requires a specific magic rep range.',
      'Soreness (DOMS) is mandatory for muscle growth.'
    ]
  },
  {
    id: 'ts-3',
    title: 'Strength',
    summary: 'The maximal force-producing capacity of a muscle or muscle group against a given resistance.',
    keyPrinciples: [
      'Neuromuscular adaptation and motor unit recruitment are key.',
      'Focus on high intensity (80-90%+ 1RM) in the 1-6 rep range.',
      'Longer rest intervals (3-5 minutes) between heavy sets allow neural recovery.',
      'Specificity: Practice the exact lifts (Squat, Bench, Deadlift, Overhead Press) frequently.'
    ],
    practicalApplication: 'Structure main lifts around 3-5 sets of 3-5 reps with 3+ minutes rest, focusing on explosive concentric acceleration.',
    commonMisconceptions: [
      'Strength training does not build any muscle mass.',
      'You must max out (1RM) every week to get stronger.'
    ]
  },
  {
    id: 'ts-4',
    title: 'Power',
    summary: 'The ability to exert maximal force in the shortest possible time (Force x Velocity).',
    keyPrinciples: [
      'High speed of movement with moderate loads (30-70% 1RM).',
      'Focus on maximum acceleration during the concentric phase.',
      'Keep set volume low (2-5 reps) to avoid velocity loss due to fatigue.',
      'Key exercises include Olympic weightlifting, plyometrics, and medicine ball throws.'
    ],
    practicalApplication: 'Incorporate jump squats, power cleans, or speed bench press (3-5 sets of 2-4 reps) at the start of workouts when fresh.',
    commonMisconceptions: [
      'Power training is the same as muscular endurance or high-cardio circuits.',
      'Fatigue is a good indicator of a power workout.'
    ]
  },
  {
    id: 'ts-5',
    title: 'Muscular Endurance',
    summary: 'The capacity of a muscle to sustain repeated contractions or maintain force against submaximal resistance over time.',
    keyPrinciples: [
      'Higher rep ranges (15-25+ reps) with short rest periods (30-60 seconds).',
      'Enhances mitochondrial density, capillary density, and lactate buffering capacity.',
      'Maintains muscular stamina for sports, functional tasks, and high-volume sessions.'
    ],
    practicalApplication: 'Finish leg or shoulder days with 2-3 burn-out sets of 15-25 reps or timed isometric holds (e.g., plank, wall sit).',
    commonMisconceptions: [
      'High reps burn local fat in the targeted area (spot reduction).',
      'Endurance training completely destroys muscle mass.'
    ]
  },
  {
    id: 'ts-6',
    title: 'Volume',
    summary: 'The total amount of work performed, calculated as Sets x Reps x Weight (Volume Load) or Direct Working Sets per week.',
    keyPrinciples: [
      'Direct hard sets per muscle group per week is the most practical volume metric.',
      'Maintenance Volume (MV): 6-8 sets/week.',
      'Maximum Adaptive Volume (MAV): 10-20 sets/week for most individuals.',
      'Maximum Recoverable Volume (MRV): The upper threshold beyond which fatigue outpaces adaptation.'
    ],
    practicalApplication: 'Start a training block at ~10 sets/muscle/week and gradually scale to ~16-18 sets over 4-6 weeks before deloading.',
    commonMisconceptions: [
      'More volume is always better (junk volume leads to overtraining).',
      'Warmup sets count toward direct weekly volume.'
    ]
  },
  {
    id: 'ts-7',
    title: 'Intensity & Proximity to Failure',
    summary: 'The relative effort of a set measured by Percentage of 1RM or Reps in Reserve (RIR) / Rating of Perceived Exertion (RPE).',
    keyPrinciples: [
      'RIR (Reps in Reserve): 0 RIR = Complete failure; 2 RIR = 2 reps left in the tank.',
      'Most hypertrophy sets should be taken between 1 and 3 RIR for maximal stimulus with manageable fatigue.',
      'Training to absolute failure every set elevates central nervous system fatigue dramatically without proportional gain.'
    ],
    practicalApplication: 'Push working sets until you can only complete 1-2 more clean repetitions with good form before stopping.',
    commonMisconceptions: [
      'If you don not hit absolute failure every set, the set was wasted.',
      'Light weights cannot build muscle regardless of proximity to failure.'
    ]
  },
  {
    id: 'ts-8',
    title: 'Frequency',
    summary: 'How often a specific muscle group or lift is trained within a weekly cycle.',
    keyPrinciples: [
      'Training a muscle 2-3 times per week distributes volume effectively.',
      'Spreading 12 sets over 2 sessions (6 + 6) results in higher quality reps than doing all 12 in one session.',
      'Allows higher average power output and less acute session fatigue.'
    ],
    practicalApplication: 'Adopt an Upper/Lower or Push/Pull/Legs split to hit each muscle group twice every 7-8 days.',
    commonMisconceptions: [
      'Traditional bro-splits (1 muscle per week) are useless.',
      'Training a muscle group twice a week does not allow enough recovery time.'
    ]
  },
  {
    id: 'ts-9',
    title: 'Recovery & Supercompensation',
    summary: 'The biological process where the body repairs tissue damage, replenishes energy stores, and adapts beyond baseline levels.',
    keyPrinciples: [
      'Training provides the stimulus; recovery provides the adaptation and growth.',
      'Protein synthesis peaks 24-48 hours post-workout.',
      'Deload weeks (reducing volume by 50% and intensity by 10%) every 4-8 weeks restore systemic nervous system balance.',
      'Nutritional support (adequate calories and protein) and 7-9 hours of quality sleep are essential.'
    ],
    practicalApplication: 'Schedule at least 1-2 complete rest days per week and plan a deliberate deload week after heavy 6-week training blocks.',
    commonMisconceptions: [
      'Rest days make you lose muscle or fitness gains.',
      'Stretching alone replaces proper sleep and nutrition for recovery.'
    ]
  }
];
