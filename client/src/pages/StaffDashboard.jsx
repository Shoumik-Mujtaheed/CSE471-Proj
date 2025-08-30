// pages/StaffDashboard.jsx
// Staff dashboard page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

function StaffDashboard() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    if (!token) {
      navigate('/staff-login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      
      // Fetch leave requests
      const leaveRes = await fetch(`${API_BASE_URL}/api/staff/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaveRequests(leaveData);
      }

      // Fetch profile
      const profileRes = await fetch(`${API_BASE_URL}/api/staff/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    navigate('/');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Staff Dashboard - mediCore</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>

      {profile && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Profile</h3>
          <p><strong>Name:</strong> {profile.user?.name}</p>
          <p><strong>Email:</strong> {profile.user?.email}</p>
          <p><strong>Department:</strong> {profile.department}</p>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Leave Requests</h3>
        {leaveRequests.length > 0 ? (
          <div>
            {leaveRequests.map((request, index) => (
              <div key={index} style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '10px', borderRadius: '4px' }}>
                <p><strong>Date:</strong> {request.startDate} to {request.endDate}</p>
                <p><strong>Reason:</strong> {request.reason}</p>
                <p><strong>Status:</strong> {request.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No leave requests found.</p>
        )}
      </div>
    </div>
  );
}

export default StaffDashboard;
