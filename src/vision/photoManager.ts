import { ProgressPhotoItem, MonthlyPhotoSet, MonthlyPhotoSessionData, PoseAngle } from './types';

const PHOTO_STORAGE_KEY = 'physique_ai_monthly_photos';

export class PhotoManager {
  private photoSets: Map<string, MonthlyPhotoSet> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Save or update a single pose photo for a target month (e.g., "2026-08")
   */
  public addPhoto(params: {
    month: string;
    angle: PoseAngle;
    imageBase64: string;
    mimeType?: string;
    notes?: string;
    sessionData?: Partial<MonthlyPhotoSessionData>;
  }): MonthlyPhotoSet {
    const { month, angle, imageBase64, mimeType = 'image/jpeg', notes, sessionData } = params;

    let photoSet = this.photoSets.get(month);
    if (!photoSet) {
      photoSet = {
        id: `photoset_${month}`,
        month,
        timestamp: new Date().toISOString(),
      };
    }

    const approxSizeBytes = Math.round((imageBase64.length * 3) / 4);

    const photoItem: ProgressPhotoItem = {
      id: `photo_${month}_${angle}_${Date.now()}`,
      month,
      date: new Date().toISOString(),
      angle,
      imageBase64,
      mimeType,
      notes,
      fileSizeBytes: approxSizeBytes,
      resolution: { width: 1080, height: 1440 }, // Default high resolution snapshot
    };

    if (angle === 'front') photoSet.frontPhoto = photoItem;
    if (angle === 'side') photoSet.sidePhoto = photoItem;
    if (angle === 'back') photoSet.backPhoto = photoItem;

    if (sessionData) {
      photoSet.sessionData = {
        date: new Date().toISOString().split('T')[0],
        ...photoSet.sessionData,
        ...sessionData,
      };
    } else if (!photoSet.sessionData) {
      photoSet.sessionData = {
        date: new Date().toISOString().split('T')[0],
      };
    }

    photoSet.timestamp = new Date().toISOString();
    this.photoSets.set(month, photoSet);
    this.persist();

    return photoSet;
  }

  /**
   * Attach/update session metadata (e.g., weight, sleep, readiness) for a given month's photo set
   */
  public updateSessionData(month: string, data: Partial<MonthlyPhotoSessionData>): MonthlyPhotoSet {
    let photoSet = this.photoSets.get(month);
    if (!photoSet) {
      photoSet = {
        id: `photoset_${month}`,
        month,
        timestamp: new Date().toISOString(),
      };
    }

    photoSet.sessionData = {
      date: new Date().toISOString().split('T')[0],
      ...photoSet.sessionData,
      ...data,
    };

    this.photoSets.set(month, photoSet);
    this.persist();
    return photoSet;
  }

  /**
   * Delete a single pose from a month's photo set
   */
  public deletePose(month: string, angle: PoseAngle): MonthlyPhotoSet | undefined {
    const photoSet = this.photoSets.get(month);
    if (!photoSet) return undefined;

    if (angle === 'front') delete photoSet.frontPhoto;
    if (angle === 'side') delete photoSet.sidePhoto;
    if (angle === 'back') delete photoSet.backPhoto;

    photoSet.timestamp = new Date().toISOString();
    this.photoSets.set(month, photoSet);
    this.persist();
    return photoSet;
  }

  /**
   * Delete entire monthly photo set
   */
  public deleteMonthlyPhotoSet(month: string): void {
    this.photoSets.delete(month);
    this.persist();
  }

  /**
   * Get the photo set for a specific month
   */
  public getPhotoSet(month: string): MonthlyPhotoSet | undefined {
    return this.photoSets.get(month);
  }

  /**
   * Get all recorded photo sets sorted by month ascending
   */
  public getAllPhotoSets(): MonthlyPhotoSet[] {
    return Array.from(this.photoSets.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Returns the previous month's photo set relative to a given month string (YYYY-MM)
   */
  public getPreviousMonthSet(currentMonth: string): MonthlyPhotoSet | undefined {
    const all = this.getAllPhotoSets();
    const currentIndex = all.findIndex((s) => s.month === currentMonth);
    if (currentIndex > 0) {
      return all[currentIndex - 1];
    }
    // If exact month not found, return the latest set before currentMonth
    return all.filter((s) => s.month < currentMonth).pop();
  }

  /**
   * Verifies if a photo set has all three required poses (front, side, back)
   */
  public isCompleteSet(month: string): boolean {
    const set = this.getPhotoSet(month);
    if (!set) return false;
    return Boolean(set.frontPhoto && set.sidePhoto && set.backPhoto);
  }

  /**
   * Count how many poses exist for a given month
   */
  public getUploadedPoseCount(month: string): number {
    const set = this.getPhotoSet(month);
    if (!set) return 0;
    let count = 0;
    if (set.frontPhoto) count++;
    if (set.sidePhoto) count++;
    if (set.backPhoto) count++;
    return count;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(PHOTO_STORAGE_KEY);
      if (raw) {
        const parsed: MonthlyPhotoSet[] = JSON.parse(raw);
        parsed.forEach((set) => this.photoSets.set(set.month, set));
      }
    } catch (e) {
      console.error('[PhotoManager] Failed to load photo sets from storage:', e);
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      const list = Array.from(this.photoSets.values());
      localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('[PhotoManager] Failed to persist photo sets to storage:', e);
    }
  }
}

export const photoManager = new PhotoManager();

