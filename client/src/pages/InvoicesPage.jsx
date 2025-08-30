// pages/InvoicesPage.jsx
// Invoices page

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Invoices - mediCore</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {invoices.map((invoice, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Invoice #{invoice.invoiceNumber}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Amount:</strong> ${invoice.amount}</p>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Status:</strong> {invoice.status}</p>
            <p style={{ margin: '5px 0', color: '#666' }}><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InvoicesPage;
