// pages/StaffDashboard.jsx
// Staff dashboard page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

function StaffDashboard() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const navigate = useNavigate();
  const { checkAuth, logout } = useAuth('staff');
  const { profile, loading, fetchProfile, getToken } = useProfile('staff');

  useEffect(() => {
    if (checkAuth()) {
      const token = getToken();
      fetchProfile(token);
      fetchData(token);
    }
  }, [checkAuth, fetchProfile, getToken]);

  const fetchData = async (token) => {
    try {
      // Fetch leave requests
      const leaveRes = await fetch(`${API_BASE_URL}/api/staff/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaveRequests(leaveData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>
            Welcome back, {profile?.name || 'Staff'}! 👋
          </h1>
          <p style={{ color: '#666', margin: 0 }}>Staff Dashboard</p>
        </div>
        
        <button 
          onClick={logout} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Staff-specific content */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Leave Requests</h2>
        {leaveRequests.length > 0 ? (
          <div>
            {leaveRequests.map((request, index) => (
              <div key={index} style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                marginBottom: '10px',
                backgroundColor: '#f8f9fa'
              }}>
                <p><strong>Type:</strong> {request.leaveType}</p>
                <p><strong>From:</strong> {request.startDate}</p>
                <p><strong>To:</strong> {request.endDate}</p>
                <p><strong>Reason:</strong> {request.reason}</p>
                <p><strong>Status:</strong> {request.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center' }}>No leave requests found.</p>
        )}
      </div>
    </div>
  );
}

export default StaffDashboard;
