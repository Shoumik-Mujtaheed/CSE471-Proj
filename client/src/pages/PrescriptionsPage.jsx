// pages/PrescriptionsPage.jsx
// Prescriptions page

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/prescriptions`);
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Prescriptions - mediCore</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {prescriptions.map((prescription, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Prescription #{prescription.id}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Patient:</strong> {prescription.patientName}</p>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Doctor:</strong> {prescription.doctorName}</p>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrescriptionsPage;
