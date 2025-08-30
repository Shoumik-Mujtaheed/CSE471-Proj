// pages/MedicationsPage.jsx
// Medications page - now uses consolidated inventory API

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory`);
      if (res.ok) {
        const data = await res.json();
        setMedications(data);
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchMedications = async (query) => {
    if (!query || query.length < 2) {
      fetchMedications();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/search?query=${query}`);
      if (res.ok) {
        const data = await res.json();
        setMedications(data);
      }
    } catch (err) {
      console.error('Error searching medications:', err);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchMedications(query);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Medications - mediCore</h1>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search medications..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {medications.map((med, index) => (
          <div key={med._id || index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{med.name}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Price:</strong> {med.price}tk</p>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Quantity:</strong> {med.quantity}</p>
            {med.supplier && (
              <p style={{ margin: '5px 0', color: '#666' }}><strong>Supplier:</strong> {med.supplier}</p>
            )}
            {med.reorderThreshold && (
              <p style={{ margin: '5px 0', color: '#666' }}><strong>Reorder Threshold:</strong> {med.reorderThreshold}</p>
            )}
            {med.needsReorder && (
              <div style={{ 
                marginTop: '10px', 
                padding: '8px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                color: '#856404'
              }}>
                ⚠️ Low Stock - Reorder Needed
              </div>
            )}
          </div>
        ))}
      </div>
      
      {medications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No medications found.
        </div>
      )}
    </div>
  );
}

export default MedicationsPage;
