// pages/PatientDashboard.jsx
// Patient dashboard page - Simplified to show only symptom search and EMR button

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
  };

  // Get symptom suggestions
  const getSuggestions = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/triage/symptoms?query=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  // Add symptom to selected list
  const addSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setQuery('');
    setSuggestions([]);
  };

  // Remove symptom from selected list
  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  // Search by symptoms
  const searchBySymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/triage/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Error searching symptoms:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    getSuggestions(value);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
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
              What are your symptoms, {profile?.name || 'Patient'}?
            </h1>
            <p style={{ color: '#666', margin: 0 }}>Find the right specialist for your medical condition</p>
            
            {/* Advanced Search Button */}
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={() => navigate('/symptom-search')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔍 Advanced Doctor Search (Symptoms + Name)
              </button>
            </div>
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
              onClick={handleLogout} 
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

        {/* Symptom Input */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Enter your medical condition"
            style={{
              width: '70%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={() => addSymptom(query)}
            disabled={!query.trim()}
            style={{
              marginLeft: '10px',
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {suggestions.map((symptom, index) => (
              <button
                key={index}
                onClick={() => addSymptom(symptom)}
                style={{
                  margin: '5px',
                  padding: '8px 12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                {symptom}
              </button>
            ))}
          </div>
        )}

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>📋 MY Symptoms</h3>
            {selectedSymptoms.map((symptom, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  margin: '5px',
                  padding: '8px 12px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '20px',
                  position: 'relative'
                }}
              >
                {symptom}
                <button
                  onClick={() => removeSymptom(symptom)}
                  style={{
                    marginLeft: '8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search Button */}
        {selectedSymptoms.length > 0 && (
          <button
            onClick={searchBySymptoms}
            disabled={searchLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            {searchLoading ? 'Searching...' : '🔍 Search by Specialty'}
          </button>
        )}

        {/* Results */}
        {results && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>👨‍⚕️ Recommended Doctors</h3>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <p><strong>Specialty:</strong> {results.recommendedSpecialty}</p>
              {results.alternativeSpecialty && (
                <p><strong>Alternative:</strong> {results.alternativeSpecialty}</p>
              )}
              
              {results.recommendedDoctors.map((doctor, index) => (
                <div key={index} style={{ marginTop: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{doctor.name}</h4>
                  <p style={{ margin: '5px 0', color: '#666' }}>{doctor.specialty}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}><strong>Available times:</strong> {doctor.availableSlots.join(', ')}</p>
                  <button
                    onClick={() => navigate('/book-appointment', { 
                      state: { 
                        doctor: {
                          id: doctor.id || doctor._id,
                          name: doctor.name,
                          specialty: doctor.specialty
                        }
                      }
                    })}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    📅 Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No symptoms message */}
        {selectedSymptoms.length === 0 && !results && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: '0', fontSize: '16px' }}>No symptoms added.</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: '0.8' }}>
              Start typing above to add your symptoms and find the right specialist.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
