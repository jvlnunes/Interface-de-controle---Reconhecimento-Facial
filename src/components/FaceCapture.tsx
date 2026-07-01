import { useEffect, useRef, useState, useCallback } from 'react';
import ScanFrame from './ScanFrame';

interface FaceCaptureProps {
  onCapture: (blob: Blob) => void;
  disabled?: boolean;
}

export default function FaceCapture({ onCapture, disabled }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'live' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setStatus('starting');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('live');
    } catch {
      setStatus('error');
      setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1); // espelha para ficar natural, como um espelho
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setPreview(URL.createObjectURL(blob));
          onCapture(blob);
        }
      },
      'image/jpeg',
      0.92
    );
    stopCamera();
    setStatus('idle');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onCapture(file);
    e.target.value = '';
  }

  function retake() {
    setPreview(null);
    startCamera();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ScanFrame size="lg" active={status === 'live'} className="max-w-[280px]">
        {preview ? (
          <img src={preview} alt="Rosto capturado" className="w-full h-full object-cover" />
        ) : status === 'live' ? (
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover -scale-x-100" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono text-center px-4">
            {status === 'starting' ? 'Iniciando câmera…' : status === 'error' ? errorMsg : 'Nenhuma câmera ativa'}
          </div>
        )}
      </ScanFrame>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-wrap items-center justify-center gap-2">
        {!preview && status !== 'live' && (
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-strong transition-colors disabled:opacity-50"
          >
            Ativar câmera
          </button>
        )}
        {status === 'live' && (
          <button
            type="button"
            onClick={handleCapture}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-ink hover:brightness-95 transition"
          >
            Capturar foto
          </button>
        )}
        {preview && (
          <button
            type="button"
            onClick={retake}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-line bg-surface hover:bg-canvas transition"
          >
            Repetir captura
          </button>
        )}
        <label className="px-4 py-2 text-sm font-medium rounded-lg border border-line bg-surface hover:bg-canvas transition cursor-pointer">
          Enviar arquivo
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={disabled} />
        </label>
      </div>
      {status === 'error' && <p className="text-xs text-danger max-w-[280px] text-center">{errorMsg}</p>}
    </div>
  );
}