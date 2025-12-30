
export interface Participant {
  id: string;
  name: string;
}

export interface Prize {
  id: number;
  rank: number;
  name: string;
  value: string;
  icon: string;
  isBigWinner: boolean;
}

export interface Winner {
  participant: Participant;
  prize: Prize;
  drawnAt: number;
  congratsMessage?: string;
}

export enum AppState {
  SETUP = 'SETUP',
  READY = 'READY',
  DRAWING = 'DRAWING',
  FINISHED = 'FINISHED'
}
