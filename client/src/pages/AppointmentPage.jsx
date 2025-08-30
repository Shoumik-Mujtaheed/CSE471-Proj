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
  const [checkingAvailability, setCheckingAvailability] = useState(false);
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
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/time-slots/doctor/${doctorId}/available`);
      
      if (response.ok) {
        const data = await response.json();
        const allSlots = data.availableTimes || [];
        const availableSlots = await filterBookedSlots(allSlots, doctorId);
        setAvailableSlots(availableSlots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookedSlots = async (slots, doctorId) => {
    try {
      console.log('🔍 Filtering booked slots for doctor:', doctorId);
      
      const today = new Date();
      const nextWeek = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        nextWeek.push({
          date: date.toISOString().split('T')[0],
          dayOfWeek: date.getDay()
        });
      }

      const availableSlots = [];
      
      for (const slot of slots) {
        const availableDates = [];
        
        for (const weekDay of nextWeek) {
          if (weekDay.dayOfWeek === slot.dayOfWeek) {
            const isBooked = await checkIfSlotBooked(doctorId, weekDay.date, slot.timeSlot);
            
            if (!isBooked) {
              availableDates.push({
                date: weekDay.date,
                dayOfWeek: weekDay.dayOfWeek,
                dayName: getDayName(weekDay.dayOfWeek)
              });
            }
          }
        }
        
        if (availableDates.length > 0) {
          availableSlots.push({
            ...slot,
            availableDates
          });
        }
      }
      
      console.log('✅ Available slots after filtering:', availableSlots);
      return availableSlots;
    } catch (error) {
      console.error('Error filtering booked slots:', error);
      return slots;
    }
  };

  const checkIfSlotBooked = async (doctorId, date, timeSlot) => {
    try {
      setCheckingAvailability(true);
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        console.error('No authentication token found');
        return false;
      }
      
      const response = await fetch(`http://localhost:5000/api/appointments/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId,
          date,
          timeSlot
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.isBooked;
      } else if (response.status === 401) {
        console.error('Authentication failed - token may be expired');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getNextOccurrence = (dayOfWeek) => {
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysToAdd = dayOfWeek - currentDay;
    
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const requestPayload = {
      doctorId: formData.doctorId,
      reason: formData.reason,
      urgency: formData.urgency,
      dayOfWeek: formData.dayOfWeek,
      timeSlot: formData.timeSlot,
      date: formData.date
    };
    
    console.log('🚀 API Request:', requestPayload);
    
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
          
          {selectedDoctor && (
            <div className="doctor-info">
              <h3>Selected Doctor</h3>
              <p>
                <strong>Name:</strong> Dr. {selectedDoctor.name || 'Unknown'}
              </p>
              <p>
                <strong>Specialty:</strong> {selectedDoctor.specialty || 'N/A'}
              </p>
              <p>
                <strong>Email:</strong> {selectedDoctor.email || 'N/A'}
              </p>
            </div>
          )}

          {successMessage && (
            <div className="message success">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label>
                Select Available Time Slot:
              </label>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                Click on a time slot to select it. The system will automatically calculate the next available date.
                {checkingAvailability && (
                  <span style={{ color: '#007bff', marginLeft: '10px' }}>
                    🔍 Checking availability...
                  </span>
                )}
              </div>
              {availableSlots.length > 0 ? (
                <div className="time-slot-grid">
                  {availableSlots.map((slot) => {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayName = days[slot.dayOfWeek];
                    const isSelected = formData.dayOfWeek === slot.dayOfWeek && formData.timeSlot === slot.timeSlot;
                    
                    return (
                      <div
                         key={`${slot.dayOfWeek}-${slot.timeSlot}`}
                         onClick={() => handleTimeSlotSelect(slot.dayOfWeek, slot.timeSlot)}
                         className={`time-slot-item ${isSelected ? 'selected' : ''}`}
                       >
                        <div className="day-name">{dayName}</div>
                        <div className="time-range">
                          {slot.timeSlot === '8-12' ? '8:00 AM - 12:00 PM' :
                           slot.timeSlot === '12-4' ? '12:00 PM - 4:00 PM' :
                           slot.timeSlot === '4-8' ? '4:00 PM - 8:00 PM' :
                           slot.timeSlot === '20-00' ? '8:00 PM - 12:00 AM' : slot.timeSlot}
                        </div>
                        
                        {slot.availableDates && slot.availableDates.length > 0 && (
                          <div className="availability-info">
                            Available: {slot.availableDates.length} date{slot.availableDates.length > 1 ? 's' : ''}
                          </div>
                        )}
                        
                        {isSelected && (
                          <>
                            <div className="selected-info">✓ Selected</div>
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                              {new Date(getNextOccurrence(slot.dayOfWeek)).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </>
                        )}
                       </div>
                     );
                  })}
                </div>
              ) : (
                <div className="message error">
                  No available time slots for this doctor at the moment.
                </div>
              )}
            </div>

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
                {new Date(getNextOccurrence(formData.dayOfWeek)).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
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
