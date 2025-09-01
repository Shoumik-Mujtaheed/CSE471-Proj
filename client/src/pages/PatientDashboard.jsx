// pages/PatientDashboard.jsx
// Patient dashboard page - Now uses SymptomSearch component for advanced search

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SymptomSearch from '../components/SymptomSearch';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

function PatientDashboard() {
  const navigate = useNavigate();
  const { checkAuth, logout } = useAuth('patient');
  const { profile, loading, fetchProfile, getToken } = useProfile('patient');

  useEffect(() => {
    const initializeDashboard = async () => {
      if (checkAuth()) {
        const token = getToken();
        if (token) {
          await fetchProfile(token);
        }
      }
    };
    
    initializeDashboard();
  }, []); // Empty dependency array to run only once

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {/* Header with EMR Button in Corner */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>
              Welcome back, {profile?.name || 'Patient'}! 👋
            </h1>
            <p style={{ color: '#666', margin: 0 }}>Find the right specialist for your medical condition</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* EMR Check Button */}
            <button
              onClick={() => navigate('/emr')}
              style={{
                padding: '12px 20px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📋 EMR Check
            </button>
            
            {/* Logout Button */}
            <button 
              onClick={logout} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Use SymptomSearch Component Instead of Duplicate Code */}
        <SymptomSearch />
      </div>
    </div>
  );
}

export default PatientDashboard;
