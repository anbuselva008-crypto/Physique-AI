import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PoseAngle, MonthlyPhotoSet } from '../../vision/types';
import { photoManager } from '../../vision/photoManager';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCw,
  Sparkles,
  Maximize2,
  X,
  Upload,
  Info,
} from 'lucide-react';

interface PoseCaptureCardProps {
  month: string;
  photoSet?: MonthlyPhotoSet;
  onPhotosUpdated: () => void;
  onRunAnalysis: () => void;
  isAnalyzing?: boolean;
}

export const PoseCaptureCard: React.FC<PoseCaptureCardProps> = ({
  month,
  photoSet,
  onPhotosUpdated,
  onRunAnalysis,
  isAnalyzing = false,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<{
    angle: PoseAngle;
    src: string;
    title: string;
  } | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Pose configurations with SVG guide vectors
  const poseConfigs: Array<{
    angle: PoseAngle;
    title: string;
    description: string;
    guidePoints: string[];
    photoKey: 'frontPhoto' | 'sidePhoto' | 'backPhoto';
  }> = [
    {
      angle: 'front',
      title: 'Front View',
      description: 'Relaxed standing posture facing camera straight on',
      guidePoints: ['Shoulders level', 'Abdominal wall relaxed', 'Hands by sides'],
      photoKey: 'frontPhoto',
    },
    {
      angle: 'side',
      title: 'Side View',
      description: '90-degree lateral profile view for posture assessment',
      guidePoints: ['Spine natural curve', 'Head neutral', 'Arms slightly back'],
      photoKey: 'sidePhoto',
    },
    {
      angle: 'back',
      title: 'Back View',
      description: 'Posterior chain view for lat sweep and shoulder balance',
      guidePoints: ['Lats relaxed/flared', 'Scapulae level', 'Symmetrical stance'],
      photoKey: 'backPhoto',
    },
  ];

  const handleFileUpload = (angle: PoseAngle, e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setValidationError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // File size validation (minimum 10KB, max 15MB)
    if (file.size < 10 * 1024) {
      setValidationError('Image resolution too small. Please upload a clear photo.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setValidationError('File size exceeds 15MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        photoManager.addPhoto({
          month,
          angle,
          imageBase64: reader.result,
          mimeType: file.type,
        });

        onPhotosUpdated();

        // Check if now all 3 poses exist -> trigger auto analysis
        const updatedCount = photoManager.getUploadedPoseCount(month);
        if (updatedCount === 3) {
          setTimeout(() => {
            onRunAnalysis();
          }, 300);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePose = (angle: PoseAngle) => {
    photoManager.deletePose(month, angle);
    onPhotosUpdated();
  };

  const uploadedCount = photoManager.getUploadedPoseCount(month);
  const isComplete = uploadedCount === 3;

  return (
    <div className="space-y-6">
      {/* Session Progress Header */}
      <Card className="bg-[#111111] border-[#222222] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-base font-extrabold text-white">
                Monthly Photo Session — {month}
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Upload Front, Side, and Back photos to trigger automated AI body fat and muscle analysis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isComplete
                  ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {uploadedCount}/3 Poses Uploaded
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1e1e1e] h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-[#10B981] h-full transition-all duration-500"
            style={{ width: `${(uploadedCount / 3) * 100}%` }}
          />
        </div>

        {/* Status Notice */}
        {validationError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2 mt-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {!isComplete && (
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex items-center gap-2.5 text-xs text-gray-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {3 - uploadedCount} pose{3 - uploadedCount > 1 ? 's' : ''} remaining.{' '}
              <strong className="text-white">Pipeline auto-executes</strong> once all 3 views are provided.
            </span>
          </div>
        )}
      </Card>

      {/* 3 Pose Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {poseConfigs.map((config) => {
          const photo = photoSet?.[config.photoKey];
          const hasPhoto = Boolean(photo?.imageBase64);

          return (
            <Card
              key={config.angle}
              className={`bg-[#111111] border transition-all p-4 flex flex-col justify-between relative ${
                hasPhoto ? 'border-[#10B981]/40' : 'border-[#222222] hover:border-[#333333]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{config.title}</h3>
                  <p className="text-[11px] text-gray-400">{config.description}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    hasPhoto
                      ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                      : 'bg-[#181818] text-gray-500 border-[#2a2a2a]'
                  }`}
                >
                  {hasPhoto ? 'Uploaded' : 'Missing'}
                </span>
              </div>

              {/* Photo Box or Silhouette Guide */}
              <div className="aspect-[3/4] bg-[#161616] rounded-xl border border-[#222222] relative overflow-hidden flex flex-col items-center justify-center my-2 group">
                {hasPhoto && photo?.imageBase64 ? (
                  <>
                    <img
                      src={photo.imageBase64}
                      alt={`${config.title} Progress`}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Action Controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPreview({
                            angle: config.angle,
                            src: photo.imageBase64,
                            title: config.title,
                          })
                        }
                        className="bg-[#222] hover:bg-[#333] text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View photo"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePose(config.angle)}
                        className="bg-rose-950/80 hover:bg-rose-600 text-rose-200 hover:text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Delete pose"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center space-y-3">
                    {/* SVG Silhouette Guide */}
                    <div className="w-20 h-28 mx-auto opacity-30 text-[#10B981] flex items-center justify-center">
                      <svg viewBox="0 0 100 150" className="w-full h-full fill-current">
                        {/* Body Silhouette Outline */}
                        <circle cx="50" cy="20" r="12" />
                        <path d="M 35,35 Q 50,32 65,35 L 75,70 Q 65,75 60,85 L 62,140 L 52,140 L 50,95 L 48,140 L 38,140 L 40,85 Q 35,75 25,70 Z" />
                      </svg>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-300">No Photo Uploaded</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Click below to attach photo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Guide points checklist */}
              <div className="bg-[#181818] rounded-xl p-2.5 my-2 border border-[#222222]">
                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                  Pose Framing Guide
                </p>
                <ul className="space-y-1">
                  {config.guidePoints.map((pt, i) => (
                    <li key={i} className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3 h-3 ${hasPhoto ? 'text-[#10B981]' : 'text-gray-600'}`}
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Upload / Retake Button */}
              <div className="mt-2">
                <label className="block w-full">
                  <span
                    className={`flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      hasPhoto
                        ? 'bg-[#181818] hover:bg-[#222222] border-[#2a2a2a] text-gray-300'
                        : 'bg-[#10B981] hover:bg-[#059669] border-transparent text-black shadow-md shadow-[#10B981]/10'
                    }`}
                  >
                    {hasPhoto ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Retake / Replace</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload {config.title}</span>
                      </>
                    )}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileUpload(config.angle, e)}
                    className="hidden"
                  />
                </label>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Manual Run Analysis trigger button (also triggers automatically) */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#111111] border border-[#222222] p-4 rounded-2xl gap-4">
        <div>
          <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span>Automated AI Transformation Analysis</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            Runs Gemini Vision -&gt; Body Composition -&gt; Monthly Comparisons -&gt; Re-calibrates Workouts & Nutrition.
          </p>
        </div>

        <Button
          onClick={onRunAnalysis}
          variant="primary"
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold"
          icon={<Sparkles className="w-4 h-4" />}
        >
          {isAnalyzing ? 'Analyzing Physique...' : 'Run Vision Analysis'}
        </Button>
      </div>

      {/* Preview Zoom Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl max-w-lg w-full p-4 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
              <h3 className="text-sm font-bold text-white">{selectedPreview.title} — Full Preview</h3>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-[#181818]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[3/4] max-h-[60vh] bg-[#161616] rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={selectedPreview.src}
                alt={selectedPreview.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedPreview(null)}
                className="text-xs py-1.5 px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
