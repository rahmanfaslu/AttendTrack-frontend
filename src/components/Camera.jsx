import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, RefreshCw, Check, X } from 'lucide-react';

export default function Camera({ onCapture, onCancel, distance }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [phase, setPhase] = useState('streaming');
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (phase !== 'streaming') return;
    let active = true;
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      } catch {
        setError('Camera access denied. Please allow camera and try again.');
        setPhase('error');
      }
    };
    const t = setTimeout(init, 100);
    return () => { active = false; clearTimeout(t); streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [phase]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const capture = useCallback(() => {
    const canvas = canvasRef.current, video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      stopStream();
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
      setPhase('captured');
    }, 'image/jpeg', 0.85);
  }, [stopStream]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <CameraIcon size={16} className="text-[#6B7280]" />
            <span className="text-sm font-medium text-[#0F1923]">Take a Selfie</span>
          </div>
          <button onClick={() => { stopStream(); onCancel(); }}
            className="w-7 h-7 rounded-full bg-[#F4F6F9] hover:bg-[#E5E7EB] flex items-center justify-center transition">
            <X size={14} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Distance Overlay*/}
        {distance !== null && (
          <div className="px-5 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600">Proximity</span>
            <span className="text-sm font-bold text-blue-700">{distance}m</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5">
          {phase === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 text-center mb-4">
              {error}
            </div>
          )}

          {phase === 'streaming' && (
            <div className="relative rounded-2xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} />
                
              {/* Frame guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-40 rounded-full border-2 border-white/40" />
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <p className="text-white/60 text-xs bg-black/30 px-3 py-1 rounded-full">Position your face in the guide</p>
              </div>
            </div>
          )}

          {phase === 'captured' && capturedUrl && (
            <div className="relative rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
              <img src={capturedUrl} alt="Preview"
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} />
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Check size={10} />
                Photo captured
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {phase === 'streaming' && (
            <button onClick={capture}
              className="w-full bg-[#0F1923] hover:bg-[#1a2a3a] text-white rounded-xl py-3.5 text-sm font-medium transition flex items-center justify-center gap-2">
              <CameraIcon size={15} />
              Capture Photo
            </button>
          )}

          {phase === 'captured' && (
            <div className="flex gap-3">
              <button onClick={() => { setCapturedUrl(null); setCapturedBlob(null); setPhase('streaming'); }}
                className="flex-1 bg-[#F4F6F9] hover:bg-[#E5E7EB] text-[#374151] rounded-xl py-3.5 text-sm font-medium transition flex items-center justify-center gap-2">
                <RefreshCw size={14} />
                Retake
              </button>
              <button onClick={() => capturedBlob && onCapture(capturedBlob)}
                className="flex-1 bg-[#0F1923] hover:bg-[#1a2a3a] text-white rounded-xl py-3.5 text-sm font-medium transition flex items-center justify-center gap-2">
                <Check size={14} />
                Use Photo
              </button>
            </div>
          )}

          {phase === 'error' && (
            <button onClick={() => { stopStream(); onCancel(); }}
              className="w-full bg-[#F4F6F9] text-[#374151] rounded-xl py-3.5 text-sm font-medium">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}