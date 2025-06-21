
import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  id?: string;
  type?: string;
}

const VoiceInput = ({ value, onChange, placeholder, id, type = "text" }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.onstop = () => {
        // Simulate speech recognition - in real app would use actual speech-to-text
        const mockText = type === "number" ? 
          Math.floor(Math.random() * 100000).toString() : 
          "Nhập bằng giọng nói";
        onChange(value + " " + mockText);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      {/* <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={isListening ? stopListening : startListening}
        className={isListening ? 'bg-red-100 border-red-300' : ''}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button> */}
    </div>
  );
};

export default VoiceInput;
