
import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { FuelTransaction } from '@/pages/Index';

interface VoiceRecorderProps {
  onTransactionParsed: (transaction: Omit<FuelTransaction, 'id'>) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

const VoiceRecorder = ({ onTransactionParsed, isListening, setIsListening }: VoiceRecorderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      
      toast({
        title: "Đang ghi âm",
        description: "Hãy nói thông tin về lần đổ xăng của bạn",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Lỗi",
        description: "Không thể truy cập microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Simulate speech-to-text processing
      // In a real app, you would send this to a speech recognition service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed transaction - in reality this would come from speech recognition + AI parsing
      const mockTransaction = {
        date: new Date().toISOString().split('T')[0],
        amount: 30 + Math.random() * 20, // Random amount between 30-50L
        pricePerLiter: 23000 + Math.random() * 2000, // Random price around 23-25k VND
        totalCost: 0,
        location: "Cửa hàng xăng dầu",
        notes: "Nhập bằng giọng nói",
      };
      
      mockTransaction.totalCost = mockTransaction.amount * mockTransaction.pricePerLiter;
      
      onTransactionParsed(mockTransaction);
      
      toast({
        title: "Thành công",
        description: "Đã thêm giao dịch từ giọng nói",
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xử lý âm thanh",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={isListening ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`px-6 py-3 text-lg transition-all duration-300 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
      }`}
      size="lg"
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : isListening ? (
        <MicOff className="w-5 h-5 mr-2" />
      ) : (
        <Mic className="w-5 h-5 mr-2" />
      )}
      {isProcessing ? 'Đang xử lý...' : isListening ? 'Dừng ghi âm' : 'Ghi âm'}
    </Button>
  );
};

export default VoiceRecorder;
