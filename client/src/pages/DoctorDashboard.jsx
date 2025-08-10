// pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  
  // STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('profile'); // profile, appointments, prescriptions
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user token from localStorage (using your existing auth system)
  const getToken = () => localStorage.getItem('userToken');

  // Check if user is logged in and is a doctor
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Load initial data
    fetchDoctorProfile();
  }, [navigate]);

  // FETCH DATA FUNCTIONS
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/profile', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch doctor profile');
      const data = await res.json();
      setDoctorProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/appointments', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/prescriptions', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch prescriptions');
      const data = await res.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'prescriptions') fetchPrescriptions();
  }, [activeTab]);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Check if user is logged in
  if (!getToken()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>🔐 Please log in to access doctor dashboard</h2>
        <p>You need to be logged in as a doctor to access this page.</p>
        <button 
          onClick={() => navigate('/login')}
          style={{ 
            padding: '1rem 2rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>👨‍⚕️ Doctor Dashboard</h1>
          {doctorProfile && (
            <p style={{ margin: 0, color: '#666' }}>
              Welcome, Dr. {doctorProfile.name} | {doctorProfile.specialty || 'No specialty set'}
            </p>
          )}
        </div>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Logout
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'profile' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'profile' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Profile & Schedule
        </button>
        <button 
          onClick={() => setActiveTab('appointments')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'appointments' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'appointments' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Appointments
        </button>
        <button 
          onClick={() => setActiveTab('prescriptions')}
          style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'prescriptions' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'prescriptions' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Prescriptions
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ color: 'red', backgroundColor: '#fee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && <p>Loading...</p>}

      {/* TAB CONTENT */}
      {!loading && (
        <>
          {/* PROFILE & SCHEDULE TAB */}
          {activeTab === 'profile' && (
            <ProfileSection 
              doctorProfile={doctorProfile} 
              onRefresh={fetchDoctorProfile}
              token={getToken()}
            />
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <AppointmentsSection 
              appointments={appointments} 
              onRefresh={fetchAppointments}
              token={getToken()}
            />
          )}

          {/* PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <PrescriptionsSection 
              prescriptions={prescriptions}
              onRefresh={fetchPrescriptions}
              token={getToken()}
            />
          )}
        </>
      )}
    </div>
  );
}

// PROFILE & SCHEDULE SECTION COMPONENT
function ProfileSection({ doctorProfile, onRefresh, token }) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [profileForm, setProfileForm] = useState({
    specialty: '',
    appointmentTimes: []
  });
  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: ''
  });

  // Load specialties and initialize form
  useEffect(() => {
    fetchSpecialties();
    if (doctorProfile) {
      setProfileForm({
        specialty: doctorProfile.specialty || '',
        appointmentTimes: doctorProfile.appointmentTimes || []
      });
    }
  }, [doctorProfile]);

  const fetchSpecialties = async () => {
    try {
      const res = await fetch('/api/doctor/specialty-options', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSpecialties(data);
      }
    } catch (err) {
      console.error('Failed to fetch specialties:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Profile updated successfully!');
      setShowEditForm(false);
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const addTimeSlot = () => {
    if (!newTimeSlot.startTime || !newTimeSlot.endTime) {
      alert('Please fill in both start and end times');
      return;
    }
    
    setProfileForm({
      ...profileForm,
      appointmentTimes: [...profileForm.appointmentTimes, { ...newTimeSlot }]
    });
    setNewTimeSlot({ dayOfWeek: 'Monday', startTime: '', endTime: '' });
  };

  const removeTimeSlot = (index) => {
    const updatedTimes = profileForm.appointmentTimes.filter((_, i) => i !== index);
    setProfileForm({ ...profileForm, appointmentTimes: updatedTimes });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Doctor Profile & Schedule</h2>
        <button 
          onClick={() => setShowEditForm(!showEditForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {showEditForm ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* PROFILE DISPLAY */}
      {!showEditForm && doctorProfile && (
        <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', marginBottom: '2rem' }}>
          <h3>Current Profile</h3>
          <p><strong>Name:</strong> {doctorProfile.name}</p>
          <p><strong>Email:</strong> {doctorProfile.email}</p>
          <p><strong>Phone:</strong> {doctorProfile.phoneNumber}</p>
          <p><strong>Specialty:</strong> {doctorProfile.specialty || 'Not set'}</p>
          
          <h4>Appointment Schedule:</h4>
          {doctorProfile.appointmentTimes && doctorProfile.appointmentTimes.length > 0 ? (
            <div>
              {doctorProfile.appointmentTimes.map((slot, index) => (
                <div key={index} style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', margin: '0.5rem 0', borderRadius: '4px' }}>
                  <strong>{slot.dayOfWeek}</strong>: {slot.startTime} - {slot.endTime}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No appointment times set</p>
          )}
        </div>
      )}

      {/* PROFILE EDIT FORM */}
      {showEditForm && (
        <form onSubmit={handleSaveProfile} style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>
          <h3>Edit Profile & Schedule</h3>
          
          {/* SPECIALTY SELECTION */}
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Specialty:</strong></label><br />
            <select
              value={profileForm.specialty}
              onChange={(e) => setProfileForm({...profileForm, specialty: e.target.value})}
              required
              style={{ padding: '0.5rem', width: '300px' }}
            >
              <option value="">Select specialty...</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          {/* APPOINTMENT TIMES */}
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Appointment Schedule:</strong></label>
            
            {/* EXISTING TIME SLOTS */}
            <div style={{ marginBottom: '1rem' }}>
              {profileForm.appointmentTimes.map((slot, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', backgroundColor: 'white', margin: '0.5rem 0', borderRadius: '4px' }}>
                  <span><strong>{slot.dayOfWeek}</strong>: {slot.startTime} - {slot.endTime}</span>
                  <button 
                    type="button" 
                    onClick={() => removeTimeSlot(index)}
                    style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* ADD NEW TIME SLOT */}
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px' }}>
              <h4>Add New Time Slot</h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={newTimeSlot.dayOfWeek}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, dayOfWeek: e.target.value})}
                  style={{ padding: '0.5rem' }}
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, startTime: e.target.value})}
                  style={{ padding: '0.5rem' }}
                  placeholder="Start time"
                />
                <input
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, endTime: e.target.value})}
                  style={{ padding: '0.5rem' }}
                  placeholder="End time"
                />
                <button 
                  type="button" 
                  onClick={addTimeSlot}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Add Slot
                </button>
              </div>
            </div>
          </div>

          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '1rem' }}>
            Save Profile
          </button>
          <button type="button" onClick={() => setShowEditForm(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

// APPOINTMENTS SECTION COMPONENT
function AppointmentsSection({ appointments, onRefresh, token }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert(`Appointment ${status} successfully!`);
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fff3cd', color: '#856404' };
      case 'confirmed': return { bg: '#d1ecf1', color: '#0c5460' };
      case 'completed': return { bg: '#d4edda', color: '#155724' };
      case 'cancelled': return { bg: '#f8d7da', color: '#721c24' };
      default: return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  return (
    <div>
      <h2>Patient Appointments</h2>
      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {appointments.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No appointments found</p>
        ) : (
          appointments.map((appointment) => {
            const statusStyle = getStatusColor(appointment.status);
            return (
              <div key={appointment._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>{appointment.user?.name || 'Unknown Patient'}</strong>
                      <span style={{ marginLeft: '1rem', color: '#666' }}>
                        📧 {appointment.user?.email} | 📞 {appointment.user?.phoneNumber}
                      </span>
                    </div>
                    <div style={{ color: '#666' }}>
                      📅 {new Date(appointment.appointmentDate).toLocaleDateString()} 
                      🕐 {appointment.appointmentTime}
                    </div>
                    {appointment.reason && (
                      <div style={{ color: '#666', marginTop: '0.5rem' }}>
                        <strong>Reason:</strong> {appointment.reason}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      fontSize: '0.9rem'
                    }}>
                      {appointment.status.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {appointment.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem' }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          onClick={() => setSelectedAppointment(appointment)}
                          style={{ padding: '0.25rem 0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem' }}
                        >
                          Write Prescription
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PRESCRIPTION MODAL */}
      {selectedAppointment && (
        <PrescriptionModal 
          appointment={selectedAppointment}
          token={token}
          onClose={() => setSelectedAppointment(null)}
          onSuccess={() => {
            setSelectedAppointment(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// PRESCRIPTION MODAL COMPONENT
function PrescriptionModal({ appointment, token, onClose, onSuccess }) {
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    diagnosis: '',
    instructions: '',
    notes: ''
  });

  const addMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index) => {
    const updatedMeds = prescriptionForm.medications.filter((_, i) => i !== index);
    setPrescriptionForm({ ...prescriptionForm, medications: updatedMeds });
  };

  const updateMedication = (index, field, value) => {
    const updatedMeds = [...prescriptionForm.medications];
    updatedMeds[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medications: updatedMeds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/doctor/appointments/${appointment._id}/prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionForm)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Prescription created successfully!');
      onSuccess();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        width: '90%', 
        maxWidth: '600px',
        maxHeight: '80%',
        overflow: 'auto'
      }}>
        <h3>Write Prescription</h3>
        <p><strong>Patient:</strong> {appointment.user?.name}</p>
        <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
        
        <form onSubmit={handleSubmit}>
          {/* MEDICATIONS */}
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Medications:</strong></label>
            {prescriptionForm.medications.map((med, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4>Medication {index + 1}</h4>
                  {prescriptionForm.medications.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMedication(index)}
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    required
                    style={{ padding: '0.5rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g., 500mg)"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    required
                    style={{ padding: '0.5rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g., twice daily)"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    required
                    style={{ padding: '0.5rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., 7 days)"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    style={{ padding: '0.5rem' }}
                  />
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addMedication}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Add Another Medication
            </button>
          </div>

          {/* DIAGNOSIS */}
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Diagnosis:</strong></label><br />
            <input
              type="text"
              value={prescriptionForm.diagnosis}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
              style={{ padding: '0.5rem', width: '100%' }}
              placeholder="Patient diagnosis"
            />
          </div>

          {/* INSTRUCTIONS */}
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Instructions:</strong></label><br />
            <textarea
              value={prescriptionForm.instructions}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
              rows="3"
              style={{ padding: '0.5rem', width: '100%' }}
              placeholder="Instructions for patient"
            />
          </div>

          {/* NOTES */}
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Notes:</strong></label><br />
            <textarea
              value={prescriptionForm.notes}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
              rows="2"
              style={{ padding: '0.5rem', width: '100%' }}
              placeholder="Additional notes"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
              Create Prescription
            </button>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PRESCRIPTIONS SECTION COMPONENT
function PrescriptionsSection({ prescriptions, onRefresh, token }) {
  return (
    <div>
      <h2>Prescriptions Written</h2>
      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {prescriptions.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No prescriptions found</p>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Patient:</strong> {prescription.patient?.name}
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      📅 {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {prescription.diagnosis && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Diagnosis:</strong> {prescription.diagnosis}
                    </div>
                  )}
                  <div>
                    <strong>Medications:</strong>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {prescription.medications.map((med, index) => (
                        <li key={index}>
                          {med.name} - {med.dosage} ({med.frequency})
                          {med.duration && ` for ${med.duration}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {prescription.instructions && (
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      <strong>Instructions:</strong> {prescription.instructions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}