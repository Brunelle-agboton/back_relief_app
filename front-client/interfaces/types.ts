export type Exercise = {
    id: number;
    title: string;
    image: string;
    category: string;
}

export type ProgramLine = {
  order: number;
  repetitions?: number;
  duration?: number;    // en secondes
  calories?: number;
  exercise: Exercise;
};

export type Program = {
  id: number;
  title: string;
  description?: string;
  image: string;
  lines: ProgramLine[];
};

export type CategorizedPrograms = {
  [category: string]: Program[];
};

export type Notification = {
    id: number;
    time: string;
    title: string;
    active: boolean;
  };

export type HealthEntry = {
  id: number;
  level: number;
  location: string;
  description: string;
  timestamp: string; // ISO
};