
export enum Difficulty {
  BEGINNER = 'Básico',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export interface FretNote {
  string: number; // 1-6 (1 is high E)
  fret: number;
  label: string; // Degree or Note name
  isRoot?: boolean;
}

export interface LessonContent {
  id: string;
  title: string;
  theory: string;
  fretboardNotes: FretNote[];
  fretboardRange: [number, number]; // [startFret, endFret]
  scaleTab: string;
  suggestedBpm: number;
  progression: {
    chords: string[];
    explanation: string;
  };
  challenge: string;
}

export interface UserSettings {
  defaultBpm: number;
  overriddenBpms: Record<string, number>; // LessonId -> BPM
}

export interface UserProgress {
  difficulty: Difficulty;
  completedStepIds: string[];
}
