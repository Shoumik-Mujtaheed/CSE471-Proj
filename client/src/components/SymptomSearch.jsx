import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

function SymptomSearch() {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [query, setQuery] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const addSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setQuery('');
    setSuggestions([]);
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const searchBySymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  const searchByDoctorName = async () => {
    if (!doctorName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/search?name=${encodeURIComponent(doctorName.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults({
          recommendedSpecialty: 'Doctor Name Search Results',
          recommendedDoctors: data.doctors || []
        });
      } else {
        setResults({
          recommendedSpecialty: 'No Results Found',
          recommendedDoctors: []
        });
      }
    } catch (err) {
      console.error('Error searching by doctor name:', err);
      setResults({
        recommendedSpecialty: 'Search Error',
        recommendedDoctors: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>🔍 Find Your Doctor</h1>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('symptoms')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'symptoms' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'symptoms' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🩺 Search by Symptoms
          </button>
          <button
            onClick={() => setActiveTab('name')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'name' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'name' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            👨‍⚕️ Search by Doctor Name
          </button>
        </div>

        {activeTab === 'symptoms' ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#555', fontWeight: '500' }}>
                What are your symptoms?
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    getSuggestions(e.target.value);
                  }}
                  placeholder="Enter your medical condition"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
                <button
                  onClick={() => addSymptom(query)}
                  disabled={!query.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Add
                </button>
              </div>
              
              {suggestions.length > 0 && (
                <div style={{ 
                  marginTop: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {suggestions.map((symptom, index) => (
                    <div
                      key={index}
                      onClick={() => addSymptom(symptom)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white'}
                    >
                      {symptom}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSymptoms.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#555', fontWeight: '500' }}>
                  My Symptoms:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedSymptoms.map((symptom, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '20px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1976d2',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={searchBySymptoms}
                  disabled={loading}
                  style={{
                    marginTop: '15px',
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {loading ? 'Searching...' : 'Search by Specialty'}
                </button>
              </div>
            )}

            {selectedSymptoms.length === 0 && (
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ color: '#495057', marginBottom: '15px' }}>💡 How to search:</h4>
                <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
                  <li>Enter the doctor's full name or partial name</li>
                  <li>You can search by first name, last name, or both</li>
                  <li>The search is case-insensitive</li>
                  <li>Results will show all matching doctors with their specialties</li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#555', fontWeight: '500' }}>
                Doctor Name:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Enter doctor's name"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
                <button
                  onClick={searchByDoctorName}
                  disabled={loading || !doctorName.trim()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ color: '#495057', marginBottom: '15px' }}>💡 How to search:</h4>
              <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
                <li>Enter the doctor's full name or partial name</li>
                <li>You can search by first name, last name, or both</li>
                <li>The search is case-insensitive</li>
                <li>Results will show all matching doctors with their specialties</li>
              </ul>
            </div>
          </>
        )}

        {results && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>👨‍⚕️ {results.recommendedSpecialty}</h3>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              {results.recommendedDoctors.length > 0 ? (
                results.recommendedDoctors.map((doctor, index) => (
                  <div key={index} style={{ marginTop: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{doctor.name}</h4>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Specialty:</strong> {doctor.specialty}</p>
                    {doctor.email && (
                      <p style={{ margin: '5px 0', color: '#666' }}><strong>Email:</strong> {doctor.email}</p>
                    )}
                    {doctor.phoneNumber && (
                      <p style={{ margin: '5px 0', color: '#666' }}><strong>Phone:</strong> {doctor.phoneNumber}</p>
                    )}
                    
                    {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                      <div style={{ margin: '10px 0' }}>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Available Time Slots:</strong>
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '8px',
                          marginTop: '5px'
                        }}>
                          {doctor.availableSlots.map((slot, slotIndex) => (
                            <span
                              key={slotIndex}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                borderRadius: '12px',
                                fontSize: '12px',
                                border: '1px solid #bbdefb'
                              }}
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
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
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      📅 Book Appointment
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  <p>No doctors found matching your search criteria.</p>
                  <p>Try adjusting your search terms or use the symptom search instead.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomSearch;
