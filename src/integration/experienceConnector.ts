import { useEffect, useState } from 'react';
import { ExperienceState } from '../experience/dashboardState';
import { engineConnector } from './engineConnector';
import { stateSynchronizer } from './stateSynchronizer';

/**
 * ExperienceConnector
 * Master connector between the Experience Engine and React UI layer.
 * Provides unified state retrieval and reactive subscription hooks.
 */
export class ExperienceConnector {
  /**
   * Returns current live ExperienceState from ExperienceEngine.
   */
  public getExperienceState(weekNum: number = 1, dayNum: number = 1): ExperienceState {
    return engineConnector.getExperienceState(weekNum, dayNum);
  }

  /**
   * Subscribes to global state changes.
   */
  public subscribe(listener: () => void): () => void {
    return stateSynchronizer.subscribe(listener);
  }
}

export const experienceConnector = new ExperienceConnector();

/**
 * Custom React Hook to subscribe to global AI state changes in components.
 */
export function useExperienceState(weekNum: number = 1, dayNum: number = 1): ExperienceState {
  const [state, setState] = useState<ExperienceState>(() =>
    experienceConnector.getExperienceState(weekNum, dayNum)
  );

  useEffect(() => {
    const unsubscribe = experienceConnector.subscribe(() => {
      setState(experienceConnector.getExperienceState(weekNum, dayNum));
    });
    return unsubscribe;
  }, [weekNum, dayNum]);

  return state;
}
