import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/api';

export const useProfile = (userType) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchProfile = useCallback(async (token) => {
    try {
      let endpoint;
      
      switch (userType) {
        case 'admin':
          endpoint = `${API_BASE_URL}/api/admin/profile`;
          break;
        case 'staff':
          endpoint = `${API_BASE_URL}/api/staff/profile`;
          break;
        case 'doctor':
          endpoint = `${API_BASE_URL}/api/doctor/profile`;
          break;
        case 'patient':
        default:
          endpoint = `${API_BASE_URL}/api/users/profile`;
          break;
      }
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userType]);
  
  const getToken = useCallback(() => {
    switch (userType) {
      case 'admin':
        return localStorage.getItem('adminToken');
      case 'staff':
        return localStorage.getItem('staffToken');
      case 'doctor':
      case 'patient':
      default:
        return localStorage.getItem('userToken');
    }
  }, [userType]);
  
  return { profile, loading, fetchProfile, getToken };
};
