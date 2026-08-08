import { RecoveryTopic } from '../types';

export const RECOVERY_KNOWLEDGE_DATABASE: RecoveryTopic[] = [
  {
    id: 'rec-1',
    topic: 'Sleep & Circadian Rhythm',
    description: 'Sleep is the single most potent recovery enhancer. Growth hormone (GH) release peaks during deep slow-wave sleep (N3 stage), repairing damaged muscle tissue and consolidating motor learning.',
    benefits: [
      'Maximizes endogenous growth hormone and testosterone secretion.',
      'Restores glycogen stores and repairs micro-tears in muscular fiber.',
      'Optimizes insulin sensitivity, focus, reaction time, and pain tolerance.',
      'Reduces systemic cortisol levels and prevents chronic overtraining.'
    ],
    protocol: [
      'Maintain a consistent sleep-wake schedule (same time +/- 30 mins every day).',
      'Target 7 to 9 hours of uninterrupted night sleep.',
      'Expose eyes to natural sunlight within 30 minutes of waking.',
      'Keep bedroom dark, cool (18-20°C / 65-68°F), and quiet.'
    ],
    actionableTips: [
      'Stop caffeine consumption at least 8 hours before bedtime.',
      'Turn off bright screens or use blue-light blockers 1 hour before sleep.',
      'Take 200-400mg Magnesium Glycinate 30-60 minutes before bedtime if stressed or suffering from muscle cramps.'
    ]
  },
  {
    id: 'rec-2',
    topic: 'DOMS (Delayed Onset Muscle Soreness)',
    description: 'DOMS is micro-trauma to muscle fibers and inflammation in surrounding connective tissue occurring 12-72 hours after novel or heavy eccentric training.',
    benefits: [
      'Indicates muscle remodeling and adaptation to new stimuli.',
      'Provides feedback on training stimulus and localized muscular stress.'
    ],
    protocol: [
      'Engage in active recovery (light walking, cycling, or swimming) at 30-50% HR max.',
      'Hydrate adequately with water and electrolytes (sodium, potassium, magnesium).',
      'Consume 1.6-2.2g of protein per kg bodyweight to accelerate tissue repair.'
    ],
    actionableTips: [
      'Do not take high-dose NSAIDs (e.g. Ibuprofen) regularly, as they inhibit satellite cell activity and blunt hypertrophy signals.',
      'A warm bath or light massage increases local blood flow and reduces perceived soreness.',
      'Do not skip a scheduled light workout purely because of mild DOMS; movement aids recovery.'
    ]
  },
  {
    id: 'rec-3',
    topic: 'Mobility & Joint Health',
    description: 'Mobility is the usable, active range of motion around a joint. Good mobility ensures clean movement mechanics, reducing wear on tendons and ligamentous structures.',
    benefits: [
      'Allows full range of motion under load for superior muscle activation.',
      'Prevents compensatory stress on surrounding joints (e.g. ankle mobility protecting knees).',
      'Enhances posture, stability, and lifting leverage.'
    ],
    protocol: [
      'Perform joint-specific mobility drills before lifting (e.g., ankle dorsiflexion, thoracic spine rotations, hip CARs).',
      'Dedicate 10-15 minutes on rest days or post-workout to target restricted areas.',
      'Use controlled eccentric resistance through complete range of motion.'
    ],
    actionableTips: [
      'Prioritize thoracic spine extension, hip flexor mobility, and ankle dorsiflexion.',
      'Use resistance bands for joint distraction and smooth dynamic mobility drills.',
      'Always move into ranges you can actively control; do not force painful positions.'
    ]
  },
  {
    id: 'rec-4',
    topic: 'Dynamic vs Static Stretching',
    description: 'Stretching improves flexibility and reduces muscle stiffness. Dynamic stretching is motion-based for pre-workout; static stretching involves holding positions post-workout.',
    benefits: [
      'Dynamic stretching warms tissue, lubes joints, and prepares neural pathways.',
      'Static stretching downregulates the nervous system and relaxes hypertonic muscles.'
    ],
    protocol: [
      'Pre-Workout: 5-8 minutes of dynamic movements (leg swings, arm circles, inchworms).',
      'Post-Workout: Static stretches held for 30-45 seconds for target muscle groups.',
      'Breathe deeply (4 sec in, 6 sec out) during static holds to signal parasympathetic shift.'
    ],
    actionableTips: [
      'Never do prolonged heavy static stretching right before heavy compound lifts, as it can temporarily reduce maximal force production.',
      'Focus static stretches on tight muscle groups like hip flexors, hamstrings, and pec minor.'
    ]
  },
  {
    id: 'rec-5',
    topic: 'Warmup Protocols (RAMP System)',
    description: 'A structured warmup primes the central nervous system, increases core body temperature, elevates synovial fluid in joints, and lowers injury risk.',
    benefits: [
      'Increases muscle muscle temperature and metabolic efficiency.',
      'Improves nerve conduction velocity and muscle contraction speed.',
      'Mentally prepares the athlete for intense efforts.'
    ],
    protocol: [
      'Raise: 3-5 mins light cardiovascular activity (rower, incline treadmill, jump rope).',
      'Activate & Mobilize: Direct activation of glutes, rotator cuff, core + dynamic mobility.',
      'Potentiate: Feeder sets on main lift starting with empty bar up to working weight.'
    ],
    actionableTips: [
      'Feeder set example for 100kg Bench Press: 20kg x 10, 50kg x 5, 70kg x 3, 85kg x 1, 95kg x 1.',
      'Keep feeder sets short to prime neuromuscular pathways without accumulating fatigue.'
    ]
  },
  {
    id: 'rec-6',
    topic: 'Cooldown & Nervous System Downregulation',
    description: 'Transitioning the body from a high-stress sympathetic state to a parasympathetic recovery state post-workout.',
    benefits: [
      'Flushes metabolic byproducts and reduces heart rate safely.',
      'Kickstarts recovery process and lowers systemic stress hormones.',
      'Reduces post-workout dizziness and blood pooling.'
    ],
    protocol: [
      '3-5 minutes of slow walking or light spinning.',
      '5 minutes of diaphragmatic box breathing (4s inhale, 4s hold, 4s exhale, 4s hold).',
      'Light static stretching or foam rolling targeting primary working muscles.'
    ],
    actionableTips: [
      'Perform box breathing lying on your back with legs elevated on a bench.',
      'Consume post-workout protein and hydration within 1-2 hours after cooldown.'
    ]
  }
];
