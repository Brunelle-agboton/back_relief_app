import { useState, useEffect } from 'react';
import api from '../services/api';
import { Appointment } from '../interfaces/types';

const useAppointments = (userId: string | undefined, userType: 'user' | 'practitioner') => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchAppointments = async () => {
      try {
        const endpoint = userType === 'user' 
          ? `/appointments/as-patient/${userId}` 
          : `/appointments/as-practitioner/${userId}`;
        const response = await api.get(endpoint);
        setAppointments(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId, userType]);

  return { appointments, loading, error };
};

export default useAppointments;
