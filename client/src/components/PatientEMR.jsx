import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

function PatientEMR({ patient, onClose, onPrescriptionCreated }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Prescription form state
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    disease: '',
    medicines: []
  });
  
  // Medicine search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (patient) {
      fetchPatientData();
    }
  }, [patient]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Fetch patient's prescriptions
      const prescriptionsRes = await fetch(`${API_BASE_URL}/api/prescriptions/patient/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(prescriptionsData.prescriptions || []);
      }

      // Fetch patient's appointments
      const appointmentsRes = await fetch(`${API_BASE_URL}/api/appointments/patient/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search medicines
  const searchMedicines = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/search?query=${query}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Error searching medicines:', err);
    }
  };

  // Add medicine to prescription
  const addMedicine = (medicine) => {
    const newMedicine = {
      medicineId: medicine._id,
      medicineName: medicine.name,
      quantity: 1,
      price: medicine.price,
      instructions: '',
      total: medicine.price
    };
    
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }));
    
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  // Remove medicine from prescription
  const removeMedicine = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  // Update medicine details
  const updateMedicine = (index, field, value) => {
    setPrescriptionForm(prev => {
      const updatedMedicines = [...prev.medicines];
      updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
      
      // Recalculate total
      if (field === 'quantity' || field === 'price') {
        const quantity = field === 'quantity' ? value : updatedMedicines[index].quantity;
        const price = field === 'price' ? value : updatedMedicines[index].price;
        updatedMedicines[index].total = quantity * price;
      }
      
      return { ...prev, medicines: updatedMedicines };
    });
  };

  // Handle prescription submit
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionForm.disease || prescriptionForm.medicines.length === 0) {
      alert('Please fill all required fields and add at least one medicine');
      return;
    }
    
    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const doctorId = userData.doctorId || userData._id;
      
      const prescriptionPayload = {
        patient: patient._id,
        doctor: doctorId,
        disease: prescriptionForm.disease,
        prescribedMedicines: prescriptionForm.medicines
      };

      const res = await fetch(`${API_BASE_URL}/api/doctor/prescriptions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionPayload)
      });

      if (res.ok) {
        alert('Prescription created successfully!');
        setPrescriptionForm({ disease: '', medicines: [] });
        setShowPrescriptionForm(false);
        fetchPatientData(); // Refresh data
        if (onPrescriptionCreated) {
          onPrescriptionCreated();
        }
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to create prescription');
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
      alert('Network error. Please try again.');
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchMedicines(query);
    setShowSearch(true);
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
        padding: '30px',
        borderRadius: '10px',
        width: '95%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #eee',
          paddingBottom: '15px'
        }}>
          <h2 style={{ color: '#333', margin: 0 }}>📋 {patient.user?.name || 'Patient'} - EMR</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '1px solid #ddd',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'overview' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'overview' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'prescriptions' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'prescriptions' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'appointments' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'appointments' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Appointments
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Patient Info */}
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>👤 Patient Information</h3>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <strong>Name:</strong> {patient.user?.name || 'N/A'}
                </p>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <strong>Email:</strong> {patient.user?.email || 'N/A'}
                </p>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <strong>Phone:</strong> {patient.user?.phoneNumber || 'N/A'}
                </p>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <strong>Blood Group:</strong> {patient.user?.bloodGroup || 'N/A'}
                </p>
              </div>

              {/* Quick Stats */}
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Quick Stats</h3>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <strong>Total Prescriptions:</strong> {prescriptions.length}
                </p>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <strong>Total Appointments:</strong> {appointments.length}
                </p>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  <strong>Status:</strong> {patient.status || 'Active'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowPrescriptionForm(true)}
                style={{
                  padding: '15px 30px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginRight: '15px'
                }}
              >
                💊 Write New Prescription
              </button>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#007bff', margin: 0 }}>💊 Prescriptions ({prescriptions.length})</h3>
              <button
                onClick={() => setShowPrescriptionForm(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ➕ New Prescription
              </button>
            </div>
            
            {prescriptions.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {prescriptions.map((prescription, index) => (
                  <div key={index} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      Prescription #{prescription._id?.slice(-6) || index + 1}
                    </h4>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Disease:</strong> {prescription.disease || 'N/A'}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Medicines:</strong> {prescription.prescribedMedicines?.length || 0} items
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <p>No prescriptions found for this patient.</p>
                <p>Click "New Prescription" to create the first prescription.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h3 style={{ color: '#007bff', marginBottom: '20px' }}>📋 Appointments ({appointments.length})</h3>
            {appointments.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {appointments.map((appointment, index) => (
                  <div key={index} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      Appointment #{index + 1}
                    </h4>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Time:</strong> {appointment.timeSlot}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Reason:</strong> {appointment.reason}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Status:</strong> {appointment.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <p>No appointments found for this patient.</p>
              </div>
            )}
          </div>
        )}

        {/* Prescription Form Modal */}
        {showPrescriptionForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>Write Prescription for {patient.user?.name}</h3>
              
              <form onSubmit={handlePrescriptionSubmit}>
                {/* Disease/Diagnosis */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                    Disease/Diagnosis: *
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.disease}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, disease: e.target.value})}
                    required
                    placeholder="Enter disease or diagnosis"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                {/* Medicine Search */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                    Search Medicine: *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Type medicine name (e.g., para, ibu)"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '16px'
                      }}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearch && searchResults.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1002
                      }}>
                        {searchResults.map(medicine => (
                          <div
                            key={medicine._id}
                            onClick={() => addMedicine(medicine)}
                            style={{
                              padding: '10px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            <strong>{medicine.name}</strong>
                            <br />
                            <small>Price: ${medicine.price} | Stock: {medicine.quantity}</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Medicines */}
                {prescriptionForm.medicines.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Selected Medicines:</h4>
                    {prescriptionForm.medicines.map((medicine, index) => (
                      <div key={index} style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '15px',
                        marginBottom: '10px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <strong>{medicine.medicineName}</strong>
                          <button
                            type="button"
                            onClick={() => removeMedicine(index)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '14px', color: '#666' }}>Quantity:</label>
                            <input
                              type="number"
                              min="1"
                              value={medicine.quantity}
                              onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '3px'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '14px', color: '#666' }}>Instructions:</label>
                            <input
                              type="text"
                              value={medicine.instructions}
                              onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                              placeholder="e.g., Take twice daily"
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '3px'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                          Price: ${medicine.price} × {medicine.quantity} = ${medicine.total}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionForm(false)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Create Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientEMR;
