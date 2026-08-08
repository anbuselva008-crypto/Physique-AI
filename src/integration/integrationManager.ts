import { stateSynchronizer } from './stateSynchronizer';
import { engineConnector } from './engineConnector';
import { dashboardConnector } from './dashboardConnector';
import { coachConnector } from './coachConnector';
import { workoutConnector } from './workoutConnector';
import { nutritionConnector } from './nutritionConnector';
import { visionConnector } from './visionConnector';
import { experienceConnector } from './experienceConnector';
import { systemController } from '../system/systemController';
import { profileService } from '../services/profileService';
import { personaEngineManager } from '../persona';
import { UserProfile } from '../types';

/**
 * IntegrationManager
 * Master system coordinator that boots and manages stateSynchronizer, engineConnector,
 * dashboardConnector, coachConnector, workoutConnector, nutritionConnector, visionConnector,
 * and experienceConnector.
 */
export class IntegrationManager {
  private isBooted: boolean = false;

  /**
   * Boots the integration layer, initializing SystemController and StateSynchronizer.
   */
  public bootSystem(): void {
    if (this.isBooted) return;

    // 1. Initialize AIOS SystemController
    systemController.initialize();

    // 2. Sync all initial states
    stateSynchronizer.syncAllState();

    this.isBooted = true;
  }

  /**
   * Synchronizes profile updates across ProfileService, PersonaBuilder, and StateSynchronizer.
   */
  public updateProfile(updatedProfile: UserProfile): void {
    profileService.save(updatedProfile);
    personaEngineManager.buildPersona();
    stateSynchronizer.syncAllState();
  }

  // Connectors accessors
  public get stateSynchronizer() {
    return stateSynchronizer;
  }

  public get engineConnector() {
    return engineConnector;
  }

  public get dashboardConnector() {
    return dashboardConnector;
  }

  public get coachConnector() {
    return coachConnector;
  }

  public get workoutConnector() {
    return workoutConnector;
  }

  public get nutritionConnector() {
    return nutritionConnector;
  }

  public get visionConnector() {
    return visionConnector;
  }

  public get experienceConnector() {
    return experienceConnector;
  }
}

export const integrationManager = new IntegrationManager();
