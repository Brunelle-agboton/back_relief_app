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

// --- Updated Interfaces based on API response ---

export interface User {
  id: number;
  email: string;
  userName: string;
  role: 'practitioner' | 'user';
  age?: number | null;
  drinkReminder?: boolean | null;
  hourSit?: number | null;
  isExercise?: boolean | null;
  numberTraining?: number | null;
  poids?: number | null;
  restReminder?: boolean | null;
  sexe?: 'male' | 'female' | 'other' | null;
  taille?: number | null;
}

export interface PractitionerProfile {
  id: number;
  bio: string | null;
  city: string;
  clinicAddress: string | null;
  country: string;
  createdAt: string;
  establishmentType: string;
  isActive: boolean;
  licenseNumber: string;
  phone: string;
  postalCode: string;
  professionalType: string;
  qualifications: string[] | null; // Assuming it's an array of strings
  rating: number | null;
  specialties: string[];
  teleconsultEnabled: boolean;
  timezone: string;
  updatedAt: string;
  user?: User; // Practitioner is also a user
  availabilities: Availability[];
  appointments: Appointment[];
}

export interface Appointment {
  id: number;
  start_at: string;
  end_at: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  notes: string | null;
  meeting_url: string | null;
  cancellation_reason: string | null;
  cancelled_byId: number | null;
  created_at: string;
  updated_at: string;
  patient?: User;
  practitioner?: PractitionerProfile;
  // Internal flag for UI logic
  isInterview?: boolean;
}

// Kept for compatibility if used elsewhere, but Appointment is more accurate
export interface Availability {
  id: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isBooked: boolean;
}
