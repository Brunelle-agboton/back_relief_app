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

export type Specialty = {
  id: string;
  name: string;
  displayName: string;
  imageUrl: any;
};

export type SpecialtyCardProps = {
  item: Specialty;
  onPress: (specialtyName: string) => void;
  isSelected: boolean;
};

export interface User {
  id: number;
  userName: string;
  email: string;
};

export interface Availability {
  id: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isBooked: boolean;
}

export type PractitionerProfile = {
  id: number;
  user: User;
  professionalType: string; // e.g., 'kinesiologue'
  specialties?: string[];
  bio?: string;
  licenseNumber?: string;
  phone?: string;
  postalCode?: string;
  city: string;
  country: string;
  establishmentType: string;
  timezone: string;
  teleconsultEnabled: boolean;
  isActive: boolean;
  rating?: number;
  availabilities: Availability[];
  createdAt: string;
  updatedAt: string;
};