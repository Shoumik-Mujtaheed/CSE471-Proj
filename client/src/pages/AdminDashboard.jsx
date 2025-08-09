// pages/AdminDashboard.jsx
// Main dashboard for admin - manages time slot requests, leave requests, doctors, and staff
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  // STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('slot-requests'); // slot-requests, leave-requests, doctors, staff
  const [slotRequests, setSlotRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FETCH DATA FUNCTIONS
  const fetchSlotRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/slot-requests');
      if (!res.ok) throw new Error('Failed to fetch slot requests');
      const data = await res.json();
      setSlotRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/leave-requests');
      if (!res.ok) throw new Error('Failed to fetch leave requests');
      const data = await res.json();
      setLeaveRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/doctors');
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/staff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    setError(''); // Clear previous errors
    if (activeTab === 'slot-requests') fetchSlotRequests();
    if (activeTab === 'leave-requests') fetchLeaveRequests();
    if (activeTab === 'doctors') fetchDoctors();
    if (activeTab === 'staff') fetchStaff();
  }, [activeTab]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#666' }}>Manage hospital operations, requests, and staff</p>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('slot-requests')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'slot-requests' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'slot-requests' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Time Slot Requests
        </button>
        <button 
          onClick={() => setActiveTab('leave-requests')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'leave-requests' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'leave-requests' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Leave Requests
        </button>
        <button 
          onClick={() => setActiveTab('doctors')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'doctors' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'doctors' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Doctors
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'staff' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'staff' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Staff
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ color: 'red', backgroundColor: '#fee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && <p>Loading...</p>}

      {/* TAB CONTENT */}
      {!loading && (
        <>
          {/* SLOT REQUESTS TAB */}
          {activeTab === 'slot-requests' && (
            <SlotRequestsSection 
              slotRequests={slotRequests} 
              onRefresh={fetchSlotRequests}
            />
          )}

          {/* LEAVE REQUESTS TAB */}
          {activeTab === 'leave-requests' && (
            <LeaveRequestsSection 
              leaveRequests={leaveRequests} 
              onRefresh={fetchLeaveRequests}
            />
          )}

          {/* DOCTORS TAB */}
          {activeTab === 'doctors' && (
            <DoctorsSection doctors={doctors} onRefresh={fetchDoctors} />
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && (
            <StaffSection staff={staff} onRefresh={fetchStaff} />
          )}
        </>
      )}
    </div>
  );
}

// SLOT REQUESTS SECTION COMPONENT
function SlotRequestsSection({ slotRequests, onRefresh }) {
  // APPROVE SLOT REQUEST
  const handleApprove = async (slotId) => {
    try {
      const res = await fetch(`/api/admin/slot-requests/${slotId}/approve`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Slot request approved successfully!');
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // REJECT SLOT REQUEST
  const handleReject = async (slotId) => {
    if (!confirm('Are you sure you want to reject this slot request?')) return;
    
    try {
      const res = await fetch(`/api/admin/slot-requests/${slotId}/reject`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Slot request rejected successfully!');
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Pending Time Slot Requests</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Review and approve/reject doctor time slot requests
      </p>

      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {slotRequests.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No pending slot requests
          </p>
        ) : (
          slotRequests.map((request) => (
            <div key={request._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Doctor Request
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(request.date).toLocaleDateString()}<br />
                    <strong>Time:</strong> {request.startTime} - {request.endTime}<br />
                    <strong>Status:</strong> {request.status}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleApprove(request._id)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px' 
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px' 
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// LEAVE REQUESTS SECTION COMPONENT
function LeaveRequestsSection({ leaveRequests, onRefresh }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  // APPROVE LEAVE REQUEST
  const handleApprove = async (requestId) => {
    try {
      const res = await fetch(`/api/admin/leave-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminComment })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Leave request approved successfully!');
      setSelectedRequest(null);
      setAdminComment('');
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // REJECT LEAVE REQUEST
  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`/api/admin/leave-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminComment })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Leave request rejected successfully!');
      setSelectedRequest(null);
      setAdminComment('');
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Pending Leave Requests</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Review and approve/reject doctor and staff leave requests
      </p>

      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {leaveRequests.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No pending leave requests
          </p>
        ) : (
          leaveRequests.map((request) => (
            <div key={request._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {request.requesterType} Leave Request
                    {request.isEmergency && (
                      <span style={{ color: '#dc3545', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                        [EMERGENCY]
                      </span>
                    )}
                  </div>
                  <div>
                    <strong>Employee:</strong> {request.requester?.user?.name || 'Unknown'}<br />
                    <strong>Leave Type:</strong> {request.leaveType.replace('_', ' ').toUpperCase()}<br />
                    <strong>Duration:</strong> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} ({request.totalDays} days)<br />
                    <strong>Reason:</strong> {request.reason}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                  <button
                    onClick={() => setSelectedRequest(request._id)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px' 
                    }}
                  >
                    Review
                  </button>
                </div>
              </div>

              {/* REVIEW MODAL */}
              {selectedRequest === request._id && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}>
                  <h4>Review Leave Request</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Admin Comment (optional):</label><br />
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem' }}
                      placeholder="Add a comment for the employee..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleApprove(request._id)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px' 
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px' 
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(null);
                        setAdminComment('');
                      }}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px' 
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// DOCTORS SECTION COMPONENT
function DoctorsSection({ doctors }) {
  return (
    <div>
      <h2>All Doctors</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        View all registered doctors in the system
      </p>

      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {doctors.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No doctors found
          </p>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {doctor.user?.name || 'Unknown Doctor'}
                  </div>
                  <div>
                    <strong>Email:</strong> {doctor.user?.email}<br />
                    <strong>Phone:</strong> {doctor.user?.phoneNumber}<br />
                    <strong>Specialty:</strong> {doctor.specialty}<br />
                    {doctor.department && (
                      <span><strong>Department:</strong> {doctor.department}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Registered: {new Date(doctor.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// STAFF SECTION COMPONENT
function StaffSection({ staff }) {
  return (
    <div>
      <h2>All Staff</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        View all registered staff members in the system
      </p>

      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {staff.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No staff members found
          </p>
        ) : (
          staff.map((member) => (
            <div key={member._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {member.user?.name || 'Unknown Staff'}
                  </div>
                  <div>
                    <strong>Email:</strong> {member.user?.email}<br />
                    <strong>Phone:</strong> {member.user?.phoneNumber}<br />
                    {member.department && (
                      <span><strong>Department:</strong> {member.department}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Registered: {new Date(member.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
