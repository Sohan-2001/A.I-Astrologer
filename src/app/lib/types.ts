import type { Timestamp } from 'firebase/firestore';
import type { GetPredictionOutput } from '@/ai/flows/get-prediction';

export type Message = {
  id: string;
  text?: string;
  sender: 'me' | 'them';
  senderId: string;
  timestamp: string | Date | Timestamp;
  component?: React.ReactNode;
  predictionData?: GetPredictionOutput;
};
