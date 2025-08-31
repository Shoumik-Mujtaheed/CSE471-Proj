import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

function PatientEMR({ patient, onClose, onPrescriptionCreated }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient) {
      fetchPatientData();
    }
  }, [patient]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const currentDoctorId = userData.doctorId || userData._id;

      // Fetch patient's prescriptions from this doctor only
      const prescriptionsRes = await fetch(`${API_BASE_URL}/api/prescriptions/patient/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        // Filter prescriptions from current doctor only
        const doctorPrescriptions = (prescriptionsData.prescriptions || []).filter(
          prescription => prescription.doctor === currentDoctorId || prescription.doctor?._id === currentDoctorId
        );
        setPrescriptions(doctorPrescriptions);
      }

      // Fetch patient's appointments with this doctor only
      const appointmentsRes = await fetch(`${API_BASE_URL}/api/appointments/patient/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.appointments || []);
        
        // Filter appointments with current doctor only
        const doctorAppointments = appointmentsList.filter(
          appointment => appointment.doctor === currentDoctorId || appointment.doctor?._id === currentDoctorId
        );
        setAppointments(doctorAppointments);
      }

    } catch (err) {
      console.error('Error fetching patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90%',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Patient EMR - View Only</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Patient Info */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Patient Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
              <p style={{ margin: '5px 0' }}><strong>Name:</strong> {patient.user?.name || patient.name || 'N/A'}</p>
              <p style={{ margin: '5px 0' }}><strong>Email:</strong> {patient.user?.email || patient.email || 'N/A'}</p>
              <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {patient.user?.phoneNumber || patient.phoneNumber || 'N/A'}</p>
              <p style={{ margin: '5px 0' }}><strong>Blood Group:</strong> {patient.user?.bloodGroup || patient.bloodGroup || 'N/A'}</p>
              <p style={{ margin: '5px 0' }}><strong>Your Prescriptions:</strong> {prescriptions.length}</p>
              <p style={{ margin: '5px 0' }}><strong>Appointments with You:</strong> {appointments.length}</p>
              <p style={{ margin: '5px 0' }}><strong>Status:</strong> {patient.status || 'Active'}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'overview' ? '#007bff' : 'white',
                color: activeTab === 'overview' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'prescriptions' ? '#007bff' : 'white',
                color: activeTab === 'prescriptions' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Your Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'appointments' ? '#007bff' : 'white',
                color: activeTab === 'appointments' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Appointments with You ({appointments.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>Patient Summary</h3>

              {/* Recent Prescriptions */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#007bff' }}>Recent Prescriptions from You</h4>
                {prescriptions.slice(0, 3).map((prescription, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    border: '1px solid #eee',
                    borderRadius: '5px',
                    marginBottom: '10px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <p><strong>Disease:</strong> {prescription.disease || 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
                    <p><strong>Medicines:</strong> {prescription.prescribedMedicines?.length || 0} items</p>
                  </div>
                ))}
                {prescriptions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <p>You haven't prescribed any medications for this patient yet.</p>
                  </div>
                )}
              </div>

              {/* Recent Appointments */}
              <div>
                <h4 style={{ color: '#007bff' }}>Recent Appointments with You</h4>
                {appointments.slice(0, 3).map((appointment, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    border: '1px solid #eee',
                    borderRadius: '5px',
                    marginBottom: '10px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <p><strong>Date:</strong> {new Date(appointment.bookedDate || appointment.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointment.timeSlot}</p>
                    <p><strong>Reason:</strong> {appointment.reason}</p>
                    <p><strong>Status:</strong> 
                      <span style={{
                        color: appointment.status === 'completed' ? '#28a745' : 
                               appointment.status === 'confirmed' ? '#007bff' : 
                               appointment.status === 'booked' ? '#ffc107' : '#dc3545',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {appointment.status}
                      </span>
                    </p>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <p>This patient has no appointments with you.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>All Your Prescriptions for This Patient</h3>
              
              {prescriptions.map((prescription, index) => (
                <div key={index} style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>{prescription.disease || 'N/A'}</h4>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Prescribed Medicines:</strong>
                    {prescription.prescribedMedicines?.map((med, medIndex) => (
                      <div key={medIndex} style={{ 
                        marginLeft: '15px', 
                        padding: '5px 0',
                        fontSize: '14px',
                        borderBottom: medIndex < prescription.prescribedMedicines.length - 1 ? '1px solid #eee' : 'none'
                      }}>
                        • <strong>{med.medicineName}</strong> - Qty: {med.quantity} - {med.instructions || 'No specific instructions'}
                      </div>
                    )) || <span style={{ color: '#666' }}>No medicines listed</span>}
                  </div>
                  
                  {prescription.totalAmount && (
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Total Amount:</strong> ${prescription.totalAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              ))}

              {prescriptions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>You haven't prescribed any medications for this patient yet.</p>
                  <p>Use the "Appointments" tab in the main dashboard to create prescriptions.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>All Appointments with You</h3>
              
              {appointments.map((appointment, index) => (
                <div key={index} style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>
                      {new Date(appointment.bookedDate || appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: appointment.status === 'completed' ? '#d4edda' : 
                                     appointment.status === 'confirmed' ? '#d1ecf1' : 
                                     appointment.status === 'booked' ? '#fff3cd' : '#f8d7da',
                      color: appointment.status === 'completed' ? '#155724' : 
                             appointment.status === 'confirmed' ? '#0c5460' : 
                             appointment.status === 'booked' ? '#856404' : '#721c24'
                    }}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <p style={{ margin: '5px 0' }}><strong>Time Slot:</strong> {appointment.timeSlot}</p>
                  <p style={{ margin: '5px 0' }}><strong>Reason:</strong> {appointment.reason}</p>
                  <p style={{ margin: '5px 0' }}><strong>Urgency:</strong> 
                    <span style={{
                      color: appointment.urgency === 'emergency' ? '#dc3545' :
                             appointment.urgency === 'high' ? '#ffc107' :
                             appointment.urgency === 'normal' ? '#007bff' : '#28a745',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {appointment.urgency || 'normal'}
                    </span>
                  </p>
                  
                  {appointment.notes && (
                    <p style={{ margin: '5px 0' }}><strong>Notes:</strong> {appointment.notes}</p>
                  )}
                </div>
              ))}

              {appointments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>This patient has no appointments scheduled with you.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientEMR;
