import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, X, SwitchCamera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CameraCaptureProps {
  onPhotoCaptured: (dataUrl: string) => void;
  onClose: () => void;
  initialPhoto?: string | null;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoCaptured, onClose, initialPhoto }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhoto || null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or context.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setIsCameraActive(true);
      setCapturedPhoto(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('[Camera] Error accessing camera:', err);
      setErrorMsg(t('camera.noSupport'));
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to compressed JPEG data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onPhotoCaptured(capturedPhoto);
      onClose();
    }
  };

  // Start camera automatically on open if no photo exists
  useEffect(() => {
    if (!capturedPhoto) {
      startCamera('environment');
    }
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold">{t('camera.title')}</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Live Captured Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
            />
          )}

          {/* Hidden canvas for snapshot rendering */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Guide Overlay when camera is active */}
          {isCameraActive && !capturedPhoto && (
            <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center">
              <span className="text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
                {t('hero.directCameraNotice')}
              </span>
            </div>
          )}

          {/* Error / Permission State */}
          {errorMsg && !capturedPhoto && (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
              <p className="text-sm text-slate-300 mb-4">{errorMsg}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors"
              >
                {t('common.save', 'Retry Camera')}
              </button>
            </div>
          )}
        </div>

        {/* Subtitle / Rules */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 text-center">
          {t('camera.subtitle')}
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-t border-slate-800">
          {capturedPhoto ? (
            <>
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('camera.retake')}
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md"
              >
                <Check className="w-4 h-4" />
                {t('camera.confirm')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={switchCamera}
                disabled={!isCameraActive}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-800/80 rounded-lg disabled:opacity-40 transition-colors"
              >
                <SwitchCamera className="w-4 h-4" />
                <span>{t('camera.switch')}</span>
              </button>

              <button
                onClick={takeSnapshot}
                disabled={!isCameraActive}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all disabled:opacity-40 shadow-lg font-bold"
              >
                <Camera className="w-5 h-5 text-slate-950" />
                {t('camera.takePhoto')}
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
