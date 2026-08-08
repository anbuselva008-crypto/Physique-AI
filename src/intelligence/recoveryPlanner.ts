import { DynamicRecoveryPlan } from './types';
import { getPersona } from '../persona';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';
import { RECOVERY_KNOWLEDGE_DATABASE } from '../knowledge/recoveryKnowledge';

/**
 * RecoveryPlanner
 * Evaluates physiological strain, sleep quality, muscle soreness, and stress levels
 * to construct targeted recovery, stretching, mobility, and hydration protocols.
 */
export class RecoveryPlanner {
  /**
   * Generates today's tailored recovery plan.
   */
  public generateTodayRecoveryPlan(recoveryScore: number): DynamicRecoveryPlan {
    const persona = getPersona();
    const checkInStats = checkInService.statistics();

    const weightKg = persona.body?.weight || 70;
    const sleepHours = checkInStats.todaySleepHours || persona.lifestyle?.averageSleep || 7.5;
    const soreness = checkInStats.todaySoreness || 'None';
    const energyLevel = checkInStats.todayEnergyLevel || 7;

    // Water target
    const waterTargetLiters = Math.round((weightKg * 0.045 + 0.5) * 10) / 10;
    const sleepTargetHours = recoveryScore < 60 ? 8.5 : 8.0;

    // Recommended Stretches based on soreness & weak areas
    const recommendedStretches = [
      'Doorway Chest Stretch (hold 30s per side)',
      'Kneeling Lat & Thoracic Spine Stretch (45s)',
      'Seated Hamstring & Adductor Stretch (45s)',
      'Standing Quadriceps Stretch (30s per leg)',
    ];

    // Mobility Protocol
    const mobilityProtocol = [
      'Cat-Cow Thoracic Mobility (12 reps)',
      'Deep Squat Hold with Hip Pry (60 seconds)',
      '90/90 Hip Switch (10 reps per side)',
      'Ankle Dorsiflexion Wall Leans (10 reps per side)',
    ];

    // Recovery & Stress Advice
    const recoveryAdvice: string[] = [];
    const stressMitigationTips: string[] = [];

    if (sleepHours < 6) {
      recoveryAdvice.push('Sleep deficit detected. Aim for a 20-30 minute midday power nap if possible.');
      stressMitigationTips.push('Take 5 minutes for box breathing (4s in, 4s hold, 4s out, 4s hold) before bed.');
    } else {
      recoveryAdvice.push('Sleep duration was adequate. Maintain a consistent bedtime routine tonight.');
    }

    if (soreness === 'Heavy') {
      recoveryAdvice.push('High delayed onset muscle soreness (DOMS). Take a 15-minute warm Epsom salt bath.');
      recoveryAdvice.push('Perform light 15-minute walking to promote localized muscle blood flow.');
    } else if (soreness === 'Medium' || soreness === 'Light') {
      recoveryAdvice.push('Moderate muscle soreness. Focus on foam rolling target muscle groups.');
    }

    if (energyLevel < 5) {
      stressMitigationTips.push('Reduce caffeine intake after 2:00 PM to protect deep REM sleep architecture.');
      stressMitigationTips.push('Hydrate with 500ml water containing a pinch of Himalayan pink salt.');
    }

    stressMitigationTips.push('Limit screen blue light exposure 45 minutes before going to sleep.');

    return {
      todayRecoveryScore: recoveryScore,
      sleepTargetHours,
      waterTargetLiters,
      recommendedStretches,
      mobilityProtocol,
      recoveryAdvice,
      stressMitigationTips,
    };
  }
}

export const recoveryPlanner = new RecoveryPlanner();
