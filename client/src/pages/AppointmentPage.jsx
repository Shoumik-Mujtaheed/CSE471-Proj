import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../utils/api';

const AppointmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '', // legacy (kept for UI compatibility)
    dayOfWeek: '', // legacy (kept for UI compatibility)
    timeSlot: '',
    reason: '',
    urgency: 'normal',
    bookedDate: '' // NEW: concrete date required by backend
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
      const response = await fetch(`${API_BASE_URL}/api/time-slots/doctor/${doctorId}/available`);
      if (response.ok) {
        const data = await response.json();
        const allSlots = data.availableTimes || [];
        const filtered = await filterBookedSlots(allSlots, doctorId);
        setAvailableSlots(filtered);
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

      const response = await fetch(`${API_BASE_URL}/api/appointments/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId,
          date, // backend availability check can still accept legacy 'date' for checking same-day occupancy
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

  // Helper to compute next occurrence of a weekday (legacy helper kept)
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

  // CHANGED: when selecting a slot, prefer the earliest available concrete date the server exposed for that day,
  // otherwise fall back to getNextOccurrence (legacy behavior).
  const handleTimeSlotSelect = (dayOfWeek, timeSlot) => {
    // find matching slot to read availableDates if present
    const slot = availableSlots.find(s => s.dayOfWeek === dayOfWeek && s.timeSlot === timeSlot);
    const concrete = (slot?.availableDates && slot.availableDates.length > 0)
      ? slot.availableDates[0].date
      : getNextOccurrence(dayOfWeek);

    setFormData(prev => ({
      ...prev,
      dayOfWeek,
      timeSlot,
      date: concrete, // legacy UI value
      bookedDate: concrete // NEW: the value actually required by backend
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

    // NEW: construct request with bookedDate (not date/dayOfWeek)
    const requestPayload = {
      doctorId: formData.doctorId,
      reason: formData.reason,
      urgency: formData.urgency,
      timeSlot: formData.timeSlot,
      bookedDate: formData.bookedDate // required by updated backend
    };

    // Quick guardrails
    if (!requestPayload.bookedDate || !requestPayload.timeSlot || !requestPayload.reason || !requestPayload.doctorId) {
      alert('Please select a time slot and ensure reason is provided.');
      setIsSubmitting(false);
      return;
    }

    console.log('🚀 API Request:', requestPayload);

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
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
      <>
        <Header />
        <div style={{ 
          minHeight: '80vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ fontSize: '18px' }}>Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
        <button
          onClick={handleBack}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>

        <h1 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
          Book Appointment
        </h1>

        {successMessage && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #c3e6cb'
          }}>
            {successMessage}
          </div>
        )}

        {/* Doctor Information - ORIGINAL STYLE MAINTAINED */}
        {selectedDoctor && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '1px solid #dee2e6'
          }}>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>Doctor Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <p style={{ margin: '0', color: '#666' }}>
                <strong>Name:</strong> Dr. {selectedDoctor.name || 'Unknown'}
              </p>
              <p style={{ margin: '0', color: '#666' }}>
                <strong>Specialty:</strong> {selectedDoctor.specialty || 'N/A'}
              </p>
              <p style={{ margin: '0', color: '#666' }}>
                <strong>Email:</strong> {selectedDoctor.email || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Available Time Slots - ORIGINAL STYLE MAINTAINED */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>Available Time Slots</h3>
          
          {availableSlots.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px' 
            }}>
              No available appointments found
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {availableSlots.map((slot, index) => (
                slot.availableDates.map((availableDate) => (
                  <div
                    key={`${slot._id}-${availableDate.date}`}
                    onClick={() => handleTimeSlotSelect(slot.dayOfWeek, slot.timeSlot)}
                    style={{
                      padding: '15px',
                      border: formData.timeSlot === slot.timeSlot && formData.bookedDate === availableDate.date
                        ? '2px solid #007bff'
                        : '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: formData.timeSlot === slot.timeSlot && formData.bookedDate === availableDate.date
                        ? '#e3f2fd'
                        : 'white',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {availableDate.dayName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                      {new Date(availableDate.date).toLocaleDateString()}
                    </div>
                    <div style={{ color: '#007bff', fontWeight: 'bold' }}>
                      {slot.timeSlot}
                    </div>
                  </div>
                ))
              ))}
            </div>
          )}

          {checkingAvailability && (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
              Checking availability...
            </div>
          )}
        </div>

        {/* Appointment Form - KEPT YOUR ORIGINAL STYLE */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            Appointment Details
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
              Reason for Visit *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                minHeight: '100px',
                resize: 'vertical'
              }}
              placeholder="Please describe the reason for your appointment..."
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
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

          <button
            type="submit"
            disabled={isSubmitting || !formData.timeSlot || !formData.reason}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isSubmitting || !formData.timeSlot || !formData.reason ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isSubmitting || !formData.timeSlot || !formData.reason ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AppointmentPage;
