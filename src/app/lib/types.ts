import type { Timestamp } from 'firebase/firestore';

export type Message = {
  id: string;
  text?: string;
  sender: 'me' | 'them';
  senderId: string;
  timestamp: string | Date | Timestamp;
  component?: React.ReactNode;
};
