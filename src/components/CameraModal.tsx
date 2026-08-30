import React, { useRef, useState, useEffect } from 'react';
import { Chore, AppSettings } from '../types';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, X, Sparkles, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analyzeChoreSubmission } from '../utils/aiVision';
import { soundManager } from '../utils/audio';

interface CameraModalProps {
  chore: Chore;
  settings: AppSettings;
  onClose: () => void;
  onSuccessApproved: (
    starsEarned: number,
    submissionId: string,
    photoDataUrl: string,
    confidenceScore: number,
    reason: string
  ) => void;
  onSuccessPending: (
    submissionId: string,
    photoDataUrl: string,
    confidenceScore: number,
    reason: string
  ) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  chore,
  settings,
  onClose,
  onSuccessApproved,
  onSuccessPending,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    confidence: number;
    approved: boolean;
    reason: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize iPad camera feed
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.warn('Camera access error or restricted:', err);
        setCameraError('Camera permission denied or unavailable. You can also upload a photo below!');
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    soundManager.playPop();
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);
    processAIAnalysis(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundManager.playPop();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoDataUrl(dataUrl);
      processAIAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processAIAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    // Stop live camera stream during analysis
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    try {
      const result = await analyzeChoreSubmission(
        imageDataUrl,
        chore,
        settings.geminiApiKey,
        settings.aiAutoApproveThreshold
      );

      setIsAnalyzing(false);
      setAnalysisResult({
        confidence: Math.round(result.confidenceScore * 100),
        approved: result.isAutoApproved,
        reason: result.reason,
      });

      if (result.isAutoApproved) {
        soundManager.playFanfare();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#FFD700', '#FF6B9B', '#10B981'],
        });
      } else {
        soundManager.playStarChime();
      }
    } catch {
      setIsAnalyzing(false);
      setAnalysisResult({
        confidence: 65,
        approved: false,
        reason: 'Sent to Dad for quick check! Great effort! ⭐',
      });
      soundManager.playStarChime();
    }
  };

  const retakePhoto = () => {
    soundManager.playPop();
    setPhotoDataUrl(null);
    setAnalysisResult(null);
    setCameraError(null);
    // Restart camera
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        setCameraError('Camera unavailable. Please upload a photo.');
      });
  };

  const handleDone = () => {
    if (!analysisResult || !photoDataUrl) return;
    const subId = `sub-${Date.now()}`;
    if (analysisResult.approved) {
      onSuccessApproved(
        chore.starReward,
        subId,
        photoDataUrl,
        analysisResult.confidence / 100,
        analysisResult.reason
      );
    } else {
      onSuccessPending(
        subId,
        photoDataUrl,
        analysisResult.confidence / 100,
        analysisResult.reason
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{chore.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{chore.title}</h2>
              <p className="text-xs text-purple-200 font-medium">Snap photo proof for ⭐ {chore.starReward} stars!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera / Photo Capture Body */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[300px] overflow-hidden">
          {!photoDataUrl && (
            <>
              {cameraError ? (
                <div className="p-8 text-center text-slate-300 flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                  <p className="text-sm font-medium mb-4">{cameraError}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl flex items-center space-x-2 shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose Photo from Gallery</span>
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover max-h-[420px]"
                />
              )}
            </>
          )}

          {/* Uploaded or Snapped Image View */}
          {photoDataUrl && (
            <img
              src={photoDataUrl}
              alt="Chore proof"
              className="w-full h-full object-contain max-h-[420px]"
            />
          )}

          {/* AI Analyzing Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                <Sparkles className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Checking Your Work...</h3>
              <p className="text-sm text-purple-200 max-w-md font-medium">
                Scanning for: "{chore.aiPrompt}"
              </p>
            </div>
          )}

          {/* AI Result Card Overlay */}
          {analysisResult && !isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in">
              {analysisResult.approved ? (
                <div className="flex flex-col items-center animate-bounce-short">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/40">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mb-1">AUTO APPROVED! 🎉</h3>
                  <p className="text-xl font-bold text-amber-300 mb-3">+ {chore.starReward} STARS EARNED!</p>
                  <div className="bg-slate-800/80 px-4 py-2 rounded-xl text-xs text-slate-300 mb-6 border border-slate-700 max-w-sm">
                    {analysisResult.reason} ({analysisResult.confidence}% confidence)
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-amber-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-amber-500/40">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-amber-400 mb-1">SENT TO DAD FOR CHECK! ⭐</h3>
                  <p className="text-sm text-slate-200 mb-3 max-w-sm font-medium">
                    {analysisResult.reason}
                  </p>
                  <p className="text-xs text-amber-300 font-semibold mb-6">
                    Dad will review this on the iPad soon to confirm your stars!
                  </p>
                </div>
              )}

              {/* Confirm Done Button */}
              <button
                onClick={handleDone}
                className={`px-8 py-3.5 rounded-2xl font-extrabold text-lg shadow-xl transform hover:scale-105 transition-all ${
                  analysisResult.approved
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }`}
              >
                Awesome! Continue 🚀
              </button>
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        {!photoDataUrl && !isAnalyzing && (
          <div className="bg-slate-50 p-4 sm:p-6 border-t border-slate-200 flex items-center justify-between">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Gallery Upload</span>
            </button>

            <button
              onClick={takePhoto}
              disabled={!!cameraError}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-lg rounded-2xl shadow-lg flex items-center space-x-2 transform active:scale-95 transition-all disabled:opacity-50"
            >
              <Camera className="w-6 h-6" />
              <span>SNAP PHOTO</span>
            </button>
          </div>
        )}

        {photoDataUrl && !analysisResult && !isAnalyzing && (
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-center">
            <button
              onClick={retakePhoto}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Photo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
