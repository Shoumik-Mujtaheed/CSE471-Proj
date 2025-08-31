import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

function WritePrescription({ appointment, onClose, onSuccess }) {
  const [prescriptionForm, setPrescriptionForm] = useState({
    disease: '',
    medicines: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value
      };

      // Recalculate total
      if (field === 'quantity' || field === 'price') {
        const quantity = field === 'quantity' ? value : updatedMedicines[index].quantity;
        const price = field === 'price' ? value : updatedMedicines[index].price;
        updatedMedicines[index].total = quantity * price;
      }

      return {
        ...prev,
        medicines: updatedMedicines
      };
    });
  };

  // In handlePrescriptionSubmit function, replace the doctor ID extraction part:

    const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();

    if (!prescriptionForm.disease || prescriptionForm.medicines.length === 0) {
        alert('Please fill all required fields and add at least one medicine');
        return;
    }

    setSubmitting(true);

    try {
        const token = localStorage.getItem('userToken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // More robust doctor ID extraction
        let doctorId = userData.doctorId || userData._id || userData.id;
        
        // Debug logging (remove after fixing)
        console.log('🔍 userData:', userData);
        console.log('🔍 doctorId:', doctorId);
        
        if (!doctorId) {
        alert('Unable to identify doctor. Please logout and login again.');
        return;
        }

        const prescriptionPayload = {
        patient: appointment.user._id,
        doctor: doctorId,
        appointment: appointment._id,
        disease: prescriptionForm.disease,
        prescribedMedicines: prescriptionForm.medicines
        };

        console.log('🚀 Prescription payload:', prescriptionPayload);

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
        if (onSuccess) {
            onSuccess();
        }
        onClose();
        } else {
        const errorData = await res.json();
        console.error('❌ Backend error:', errorData);
        alert(errorData.message || 'Failed to create prescription');
        }
    } catch (err) {
        console.error('❌ Network error:', err);
        alert('Network error. Please try again.');
    } finally {
        setSubmitting(false);
    }
    };


  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchMedicines(query);
    setShowSearch(true);
  };

  if (!appointment) return null;

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
        maxWidth: '700px',
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
          <h2 style={{ margin: 0, color: '#333' }}>Write Prescription</h2>
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
          {/* Appointment Details */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Appointment Details</h3>
            <p style={{ margin: '5px 0' }}><strong>Patient:</strong> {appointment.user?.name || 'N/A'}</p>
            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(appointment.bookedDate || appointment.date).toLocaleDateString()}</p>
            <p style={{ margin: '5px 0' }}><strong>Time:</strong> {appointment.timeSlot}</p>
            <p style={{ margin: '5px 0' }}><strong>Reason:</strong> {appointment.reason}</p>
          </div>

          <form onSubmit={handlePrescriptionSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Disease/Condition: *
              </label>
              <input
                type="text"
                value={prescriptionForm.disease}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, disease: e.target.value })}
                required
                placeholder="Enter diagnosis or condition"
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
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Add Medicines:
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search medicines..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
              
              {showSearch && searchResults.length > 0 && (
                <div style={{
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 5px 5px',
                  maxHeight: '150px',
                  overflow: 'auto',
                  backgroundColor: 'white',
                  position: 'relative',
                  zIndex: 100
                }}>
                  {searchResults.map((medicine, index) => (
                    <div
                      key={index}
                      onClick={() => addMedicine(medicine)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        ':hover': { backgroundColor: '#f8f9fa' }
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <strong>{medicine.name}</strong> - ${medicine.price}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Medicines */}
            {prescriptionForm.medicines.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>Prescribed Medicines:</h4>
                {prescriptionForm.medicines.map((medicine, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 80px 2fr auto',
                    gap: '10px',
                    alignItems: 'center',
                    padding: '15px',
                    border: '1px solid #eee',
                    borderRadius: '5px',
                    marginBottom: '10px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div>
                      <strong>{medicine.medicineName}</strong>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '12px', color: '#666' }}>Qty</label>
                      <input
                        type="number"
                        value={medicine.quantity}
                        onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        style={{ 
                          width: '100%', 
                          padding: '5px', 
                          border: '1px solid #ddd', 
                          borderRadius: '3px' 
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '12px', color: '#666' }}>Price</label>
                      <div style={{ fontWeight: 'bold' }}>${medicine.total.toFixed(2)}</div>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '12px', color: '#666' }}>Instructions</label>
                      <input
                        type="text"
                        value={medicine.instructions}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        placeholder="e.g., Take twice daily"
                        style={{ 
                          width: '100%', 
                          padding: '5px', 
                          border: '1px solid #ddd', 
                          borderRadius: '3px' 
                        }}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '5px',
                  textAlign: 'right'
                }}>
                  <strong>
                    Total Amount: ${prescriptionForm.medicines.reduce((sum, med) => sum + med.total, 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: submitting ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {submitting ? 'Creating Prescription...' : 'Create Prescription'}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WritePrescription;
