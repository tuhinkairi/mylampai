import { FC, useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { TranscriptResult } from '@/types/transcript';
import { AlertCircle, Mic, MicOff, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SpeechRecognitionProps {
  onTranscriptUpdate?: (transcript: TranscriptResult) => void;
}

interface TranscriptData {
  text: string;
  confidence: number;
  detected_terms: string[];
}

interface SpeechRecognitionHookResult {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  finalTranscript: TranscriptData | null;
  interimTranscript: TranscriptData | null;
  permissionStatus: PermissionState;
}

export const SpeechRecognition: FC<SpeechRecognitionProps> = ({
  onTranscriptUpdate
}): JSX.Element => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    isRecording,
    startRecording,
    stopRecording,
    finalTranscript,
    interimTranscript,
    permissionStatus
  }: SpeechRecognitionHookResult = useSpeechRecognition({
    onTranscriptUpdate,
    onError: (error: Error) => {
      console.error('Speech recognition error:', error);
      setError(error.message);
    }
  });

  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (result.state === 'granted') {
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
      }
      setIsInitializing(false);
    };

    checkInitialPermissions();
  }, []);

  const handleRecordingClick = async () => {
    setError(null);
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
      } catch (error) {
        setError('Failed to start recording. Please ensure microphone access is granted.');
      }
    }
  };

  const handleSettingsClick = () => {
    window.open('chrome://settings/content/microphone', '_blank');
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {permissionStatus === 'denied' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Microphone Access Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Please enable microphone access to use speech recognition.</span>
            <button
              onClick={handleSettingsClick}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Open Settings
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-4">
        <button
          onClick={handleRecordingClick}
          disabled={isInitializing || permissionStatus === 'denied'}
          className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5 mr-2" />
          ) : (
            <Mic className="w-5 h-5 mr-2" />
          )}
          {isInitializing
            ? 'Initializing...'
            : isRecording
            ? 'Stop Recording'
            : 'Start Recording'}
        </button>
      </div>

      {interimTranscript && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700">Interim Transcript:</h3>
          <p className="text-gray-600 mt-2">{interimTranscript.text}</p>
        </div>
      )}

      {finalTranscript && (
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold text-gray-800">Final Transcript:</h3>
          <p className="mt-2">{finalTranscript.text}</p>
          <div className="mt-3 text-sm text-gray-500 space-y-1">
            <p>Confidence: {(finalTranscript.confidence * 100).toFixed(1)}%</p>
            {finalTranscript.detected_terms.length > 0 && (
              <p>
                Technical Terms:{' '}
                <span className="text-blue-600">
                  {finalTranscript.detected_terms.join(', ')}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition;