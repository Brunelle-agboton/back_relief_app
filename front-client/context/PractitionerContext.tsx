import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Interface pour une disponibilité, basée sur l'entité backend
interface Availability {
  id: number;
  startTime: string; // Les dates sont des chaînes de caractères lorsqu'elles viennent du JSON
  endTime: string;
  timezone: string;
  isBooked: boolean;
}

// Interface for the User object nested in the profile
interface User {
  id: number;
  userName: string;
  email: string;
}

// Interface pour le profil du praticien
interface PractitionerProfile {
  id: number;
  user: User;
  professionalType: string;
  specialties: string[];
  bio?: string;
  licenseNumber?: string;
  phone?: string;
  city: string;
  country: string;
  availabilities: Availability[];
  timezone: string;
}

// Structure des données du contexte
interface PractitionerContextData {
  profile: PractitionerProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => void;
}

// Création du contexte avec des valeurs par défaut
const PractitionerContext = createContext<PractitionerContextData>({
  profile: null,
  isLoading: true,
  error: null,
  refetchProfile: () => {},
});

// Provider du contexte
export const PractitionerProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const [profile, setProfile] = useState<PractitionerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    // On s'assure que l'utilisateur est authentifié et est un professionnel
    if (authState.user?.sub && authState.user.role === 'practitioner') {
      setIsLoading(true);
      try {
        // On appelle la future route /me pour récupérer le profil
        const response = await api.get(`/practitioner-profile/me`);
        setProfile(response.data);
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch practitioner profile.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Si l'utilisateur n'est pas un pro, on ne charge rien
      setProfile(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // On charge le profil uniquement si un token est présent
    if (authState.token) {
      fetchProfile();
    }
  }, [authState.token]); // Se redéclenche si l'utilisateur change (login/logout)

  return (
    <PractitionerContext.Provider value={{ profile, isLoading, error, refetchProfile: fetchProfile }}>
      {children}
    </PractitionerContext.Provider>
  );
};

// Hook custom pour un accès simplifié
export const usePractitioner = () => useContext(PractitionerContext);
