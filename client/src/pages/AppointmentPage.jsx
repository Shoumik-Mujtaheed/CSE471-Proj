// pages/AppointmentPage.jsx
// Real appointment booking page for patients with available time slots

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AppointmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    dayOfWeek: '',
    timeSlot: '',
    reason: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Get doctor info from location state
    const doctor = location.state?.doctor;
    const doctorId = doctor?.id || doctor?._id;
    
    if (doctor && doctorId) {
      setSelectedDoctor(doctor);
      setFormData(prev => ({ ...prev, doctorId: doctorId }));
      fetchAvailableSlots(doctorId);
    } else {
      console.error('No doctor information found in navigation state');
      navigate('/search-doctors');
    }
  }, [location, navigate]);

  const fetchAvailableSlots = async (doctorId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/time-slots/doctor/${doctorId}/available`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableTimes || []);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get next occurrence of selected day
  const getNextOccurrence = (dayOfWeek) => {
    const today = new Date();
    const currentDay = today.getDay();
    
    // Simple and reliable calculation
    let daysToAdd = dayOfWeek - currentDay;
    
    // If the selected day is today or has already passed this week, get next week's occurrence
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    
    // Verify the calculated date matches the selected day of week
    const calculatedDay = nextDate.getDay();
    if (calculatedDay !== dayOfWeek) {
      console.error('❌ Date calculation mismatch:', {
        selectedDay: dayOfWeek,
        calculatedDay: calculatedDay,
        daysToAdd: daysToAdd,
        today: today.toDateString(),
        nextDate: nextDate.toDateString()
      });
    }
    
    // Use local date to avoid timezone issues
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (dayOfWeek, timeSlot) => {
    const nextDate = getNextOccurrence(dayOfWeek);
    setFormData(prev => ({ 
      ...prev, 
      dayOfWeek, 
      timeSlot,
      date: nextDate
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    // Log the request payload
    const requestPayload = {
      doctorId: formData.doctorId,
      reason: formData.reason,
      urgency: formData.urgency,
      dayOfWeek: formData.dayOfWeek,
      timeSlot: formData.timeSlot,
      date: formData.date
    };
    
    console.log('🚀 API Request:');
    console.log(JSON.stringify(requestPayload, null, 2));
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        setSuccessMessage('Appointment booked successfully! Redirecting...');
        // Add a delay to show the success message before navigation
        setTimeout(() => {
          navigate('/patient-dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
      // Don't navigate away, stay on the current page
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="appointment-container">
        <div className="appointment-form">
          <h1>Book an Appointment</h1>
          
          {/* Selected Doctor Info */}
          {selectedDoctor && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '6px',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Selected Doctor</h3>
              <p style={{ margin: '5px 0', fontSize: '16px' }}>
                <strong>Name:</strong> Dr. {selectedDoctor.name || 'Unknown'}
              </p>
              <p style={{ margin: '5px 0', fontSize: '16px' }}>
                <strong>Specialty:</strong> {selectedDoctor.specialty || 'N/A'}
              </p>
              <p style={{ margin: '5px 0', fontSize: '16px' }}>
                <strong>Email:</strong> {selectedDoctor.email || 'N/A'}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div style={{
              padding: '15px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Time Slot Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                Select Available Time Slot:
              </label>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                Click on a time slot to select it. The system will automatically calculate the next available date.
              </div>
              {availableSlots.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {availableSlots.map((slot) => {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayName = days[slot.dayOfWeek];
                    const isSelected = formData.dayOfWeek === slot.dayOfWeek && formData.timeSlot === slot.timeSlot;
                    
                    return (
                      <div
                         key={slot.id}
                         onClick={() => handleTimeSlotSelect(slot.dayOfWeek, slot.timeSlot)}
                         style={{
                           padding: '12px',
                           border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
                           borderRadius: '6px',
                           backgroundColor: isSelected ? '#e3f2fd' : 'white',
                           cursor: 'pointer',
                           textAlign: 'center'
                         }}
                       >
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{dayName}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {slot.timeSlot === '8-12' ? '8:00 AM - 12:00 PM' :
                           slot.timeSlot === '12-4' ? '12:00 PM - 4:00 PM' :
                           slot.timeSlot === '4-8' ? '4:00 PM - 8:00 PM' :
                           slot.timeSlot === '20-00' ? '8:00 PM - 12:00 AM' : slot.timeSlot}
                        </div>
                        {isSelected && (
                          <>
                            <div style={{ color: '#007bff', fontSize: '12px', marginTop: '5px' }}>✓ Selected</div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                              {(() => {
                                const calculatedDate = getNextOccurrence(slot.dayOfWeek);
                                return new Date(calculatedDate).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                              })()}
                            </div>
                          </>
                        )}
                       </div>
                     );
                  })}
                </div>
              ) : (
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#f8d7da', 
                  color: '#721c24', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  No available time slots for this doctor at the moment.
                </div>
              )}
            </div>

            {/* Selected Date Display */}
            {formData.dayOfWeek !== null && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                Appointment Date:
              </label>
              <div style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa',
                color: '#333'
              }}>
                {(() => {
                  const calculatedDate = getNextOccurrence(formData.dayOfWeek);
                  return new Date(calculatedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                })()}
              </div>
            </div>
          )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                Reason for Visit:
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Describe your symptoms or reason for appointment"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                Urgency Level:
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentPage;
