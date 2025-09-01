// pages/EMRPage.jsx
// EMR (Electronic Medical Records) page for patients

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

function EMRPage() {
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState({}); // 
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      const patientId = userData?._id || userData?.id;

      // Fetch profile
      const profileRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      //  Fetch prescriptions using patient ID endpoint
      const prescriptionsRes = await fetch(`${API_BASE_URL}/api/prescriptions/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        const prescriptionsList = prescriptionsData.prescriptions || [];
        setPrescriptions(prescriptionsList);

        //  Fetch invoice for each prescription
        for (const prescription of prescriptionsList) {
          if (prescription.invoice || prescription.invoiceId) {
            try {
              const invoiceId = prescription.invoice || prescription.invoiceId;
              const invoiceRes = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (invoiceRes.ok) {
                const invoiceData = await invoiceRes.json();
                setInvoices(prev => ({ 
                  ...prev, 
                  [prescription._id]: invoiceData 
                }));
              }
            } catch (invoiceError) {
              console.log('Error fetching invoice:', invoiceError);
            }
          }
        }
      }

      // Fetch appointments (existing logic)
      try {
        const meAppointmentsRes = await fetch(`${API_BASE_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (meAppointmentsRes.ok) {
          const list = await meAppointmentsRes.json();
          const arr = Array.isArray(list) ? list : (list.appointments || []);
          const sorted = arr.slice().sort((a, b) => new Date(a.bookedDate || a.date) - new Date(b.bookedDate || b.date));
          setAppointments(sorted);
        } else {
          const appointmentsRes = await fetch(`${API_BASE_URL}/api/appointments/patient/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (appointmentsRes.ok) {
            const data = await appointmentsRes.json();
            const arr = Array.isArray(data) ? data : (data.appointments || []);
            const sorted = arr.slice().sort((a, b) => new Date(a.bookedDate || a.date) - new Date(b.bookedDate || b.date));
            setAppointments(sorted);
          } else {
            setAppointments([]);
          }
        }
      } catch (appointmentError) {
        console.log('Error fetching appointments:', appointmentError);
        setAppointments([]);
      }

      // Fetch medical history (existing logic)
      try {
        const medicalHistoryRes = await fetch(`${API_BASE_URL}/api/medical-history/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (medicalHistoryRes.ok) {
          const medicalHistoryData = await medicalHistoryRes.json();
          setMedicalHistory(medicalHistoryData || []);
        } else {
          console.log('Medical history endpoint not available, using empty array');
          setMedicalHistory([]);
        }
      } catch (medicalHistoryError) {
        console.log('Error fetching medical history:', medicalHistoryError);
        setMedicalHistory([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📋 Prescriptions</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#1976d2' }}>{prescriptions.length}</p>
              </div>
              <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>📅 Appointments</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#2e7d32' }}>{appointments.length}</p>
              </div>
              <div style={{ backgroundColor: '#fce4ec', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#c2185b' }}>🏥 Medical Tests</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#c2185b' }}>{medicalHistory.length}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              border: '1px solid #ddd'
            }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>📊 Recent Activity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* Recent Prescriptions */}
                {prescriptions.slice(0, 2).map((prescription, index) => (
                  <div key={`prescription-${index}`} style={{
                    padding: '15px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>💊 {prescription.disease || 'Prescription'}</h4>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Doctor:</strong> {prescription.doctor?.name || 'N/A'}</p>
                  </div>
                ))}

                {/* Recent Appointments with Status Color Coding */}
                {appointments.slice(0, 2).map((appointment, index) => {
                  const isCompleted = appointment.status === 'completed';
                  return (
                    <div key={`appointment-${index}`} style={{
                      padding: '15px',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      backgroundColor: isCompleted ? '#e3f2fd' : '#e8f5e8' // Blue for completed, green for others
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📅 Appointment</h4>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Date:</strong> {new Date(appointment.bookedDate || appointment.date).toLocaleDateString()}
                        {appointment.timeSlot && ` • ${appointment.timeSlot}`}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Doctor:</strong> {appointment.doctor?.user?.name || appointment.doctor?.name || appointment.doctorName || 'N/A'}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                          color: isCompleted ? '#1976d2' : '#2e7d32',
                          fontWeight: 'bold',
                          marginLeft: '5px'
                        }}>
                          {isCompleted ? '✅ Completed' : appointment.status}
                        </span>
                      </p>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        );
      
      case 'prescriptions':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '20px' }}>💊 My Prescriptions</h2>
            {prescriptions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666'
              }}>
                No prescriptions found
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {prescriptions.map((prescription, index) => {
                  const invoice = invoices[prescription._id];
                  return (
                    <div key={index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>{prescription.disease || 'Prescription'}</h3>
                      
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Doctor:</strong> {prescription.doctor?.name || 'N/A'}
                      </p>
                      
                      {/* Display prescribed medicines */}
                      <div style={{ margin: '15px 0' }}>
                        <strong>Medicines:</strong>
                        <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                          {prescription.prescribedMedicines?.map((med, medIndex) => (
                            <div key={medIndex} style={{ 
                              margin: '5px 0', 
                              fontSize: '14px',
                              padding: '8px',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid #eee'
                            }}>
                              <div><strong>{med.medicineName}</strong></div>
                              <div>Quantity: {med.quantity} × ${med.price}</div>
                              {med.instructions && <div>Instructions: {med.instructions}</div>}
                              <div style={{ color: '#007bff', fontWeight: 'bold' }}>Total: ${med.total?.toFixed(2) || '0.00'}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Invoice Information - UPDATED */}
                      {invoice ? (
                        <div style={{
                          marginTop: '15px',
                          padding: '15px',
                          backgroundColor: '#e3f2fd',
                          borderRadius: '6px',
                          border: '1px solid #1976d2'
                        }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📄 Invoice</h4>
                          <p style={{ margin: '5px 0', color: '#1565c0' }}>
                            <strong>Invoice ID:</strong> {invoice._id || invoice.invoiceNumber}
                          </p>
                          <p style={{ margin: '5px 0', color: '#1565c0' }}>
                            <strong>Total Amount:</strong> ${invoice.totalAmount?.toFixed(2) || prescription.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                          <p style={{ margin: '5px 0', color: '#1565c0' }}>
                            <strong>Status:</strong> 
                            <span style={{ 
                              color: invoice.status === 'paid' ? '#2e7d32' : 
                                    invoice.status === 'pending' ? '#f57c00' : '#d32f2f',
                              fontWeight: 'bold',
                              marginLeft: '5px'
                            }}>
                              {invoice.status || 'Pending'}
                            </span>
                          </p>
                        </div>
                      ) : (
                        // Show total amount from prescription if invoice isn't loaded yet
                        <div style={{
                          marginTop: '15px',
                          padding: '15px',
                          backgroundColor: '#e3f2fd',
                          borderRadius: '6px',
                          border: '1px solid #1976d2'
                        }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📄 Invoice</h4>
                          <p style={{ margin: '5px 0', color: '#1565c0' }}>
                            <strong>Total Amount:</strong> ${prescription.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                          <p style={{ margin: '5px 0', color: '#1565c0' }}>
                            <strong>Status:</strong> 
                            <span style={{ color: '#f57c00', fontWeight: 'bold', marginLeft: '5px' }}>
                              Pending
                            </span>
                          </p>
                        </div>
                      )}

                      <p style={{ margin: '15px 0 5px 0', color: '#666' }}>
                        <strong>Prescription Status:</strong> 
                        <span style={{ 
                          color: prescription.status === 'active' ? '#28a745' : 
                                prescription.status === 'completed' ? '#007bff' : '#dc3545'
                        }}>
                          {prescription.status || 'active'}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      
      case 'appointments':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '20px' }}>📅 My Appointments</h2>
            
            {/* Active Appointments */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#28a745', marginBottom: '15px' }}>Active Appointments</h3>
              {appointments.filter(apt => apt.status !== 'completed').length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#666',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  No active appointments
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {appointments.filter(apt => apt.status !== 'completed').map((appointment, index) => (
                    <div key={index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#f0fff0'
                    }}>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Date:</strong> {new Date(appointment.bookedDate || appointment.date).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Time:</strong> {appointment.timeSlot}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Doctor:</strong> {appointment.doctor?.user?.name || appointment.doctor?.name || appointment.doctorName || 'N/A'}
                      </p>
                      {appointment.doctor?.specialty && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Specialty:</strong> {appointment.doctor.specialty}
                        </p>
                      )}
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                          color: appointment.status === 'confirmed' ? '#007bff' : 
                                 appointment.status === 'booked' ? '#ffc107' : 
                                 appointment.status === 'cancelled' ? '#dc3545' : '#6c757d'
                        }}>
                          {appointment.status}
                        </span>
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/*  Appointments */}
            <div>
              <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>Completed Appointments</h3>
              {appointments.filter(apt => apt.status === 'completed').length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#666',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  No completed appointments
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {appointments.filter(apt => apt.status === 'completed').map((appointment, index) => (
                    <div key={index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#e3f2fd', // Blue theme for completed
                      opacity: 0.9
                    }}>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Date:</strong> {new Date(appointment.bookedDate || appointment.date).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Time:</strong> {appointment.timeSlot}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Doctor:</strong> {appointment.doctor?.user?.name || appointment.doctor?.name || appointment.doctorName || 'N/A'}
                      </p>
                      {appointment.doctor?.specialty && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Specialty:</strong> {appointment.doctor.specialty}
                        </p>
                      )}
                      <p style={{ margin: '5px 0', color: '#1976d2' }}>
                        <strong>Status:</strong> ✅ Completed
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'medical-history':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '20px' }}>🏥 Medical History</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {medicalHistory.map((test, index) => (
                <div key={index} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{test.testType || test.type}</h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Date:</strong> {new Date(test.testDate || test.date).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Result:</strong> 
                    <span style={{ 
                      color: test.result === 'Normal' || test.result === 'normal' ? '#28a745' : 
                             test.result === 'Abnormal' || test.result === 'abnormal' ? '#dc3545' : '#ffc107'
                    }}>
                      {test.result}
                    </span>
                  </p>
                  {test.doctor && (
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Ordered by:</strong> {test.doctor.name || test.doctorName}
                    </p>
                  )}
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Details:</strong> {test.details || test.description || 'No additional details'}
                  </p>
                  {test.attachments && test.attachments.length > 0 && (
                    <div style={{ margin: '10px 0' }}>
                      <strong>Files:</strong>
                      {test.attachments.map((file, fileIndex) => (
                        <div key={fileIndex} style={{ marginLeft: '10px', fontSize: '14px' }}>
                          📎 {file.filename || file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {medicalHistory.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: '#666',
                  gridColumn: '1 / -1'
                }}>
                  No medical history found
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ color: '#333', fontSize: '20px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>📋 EMR Check - mediCore</h1>
            <p style={{ color: '#666', margin: 0 }}>View your electronic medical records and health information</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/patient-dashboard')}
              style={{
                padding: '12px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ← Back to Dashboard
            </button>
            
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'overview' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'overview' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'prescriptions' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'prescriptions' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            💊 Prescriptions ({prescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'appointments' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'appointments' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📅 Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('medical-history')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'medical-history' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'medical-history' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🏥 Medical History
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

export default EMRPage;