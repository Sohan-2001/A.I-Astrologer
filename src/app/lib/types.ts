export type Message = {
  id: number;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
};
