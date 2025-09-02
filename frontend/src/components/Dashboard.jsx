import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ModernDashboard from './ModernDashboard';
import CSVSubmissions from './CSVSubmissions';
import UnifiedInsightsBanner from './UnifiedInsightsBanner';
import AddYatriModal from './AddYatriModal';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle, XCircle, Loader, LogOut, UserPlus, IndianRupee } from 'lucide-react';
import { calculateRevenue, formatINR } from '../utils/revenueCalculator';

function Dashboard() {
  const [participants, setParticipants] = useState([]);
  // Priority Pass removed - no longer tracked
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [showAddYatriModal, setShowAddYatriModal] = useState(false);
  const [uploadType, setUploadType] = useState('participants'); // 'participants', 'submissions', 'screenshot-pending'
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  const showAlert = (message, severity = 'info') => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fetch existing participants and priority pass when app loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('participants_csv')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!participantsError && participantsData) {
          setParticipants(participantsData);
        } else {
          // Fallback to API
          const response = await fetch('/api/participants');
          const data = await response.json();
          
          if (response.ok) {
            setParticipants(data.participants || []);
          }
        }

        // Priority Pass data fetching removed
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('csv', file);

    // Determine the API endpoint based on upload type
    let endpoint = '/api/participants/upload-csv';
    
    if (uploadType === 'submissions') {
      endpoint = '/api/submissions/upload-csv';
    } else if (uploadType === 'screenshot-pending') {
      endpoint = '/api/screenshot-pending/upload-csv';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Check if we have detailed upload results
        if (data.success > 0) {
          // New records were added
          const recordType = uploadType === 'submissions' ? 'submissions' : 
                           uploadType === 'screenshot-pending' ? 'Screenshot Pending entries' : 'participants';
          
          showAlert(`✅ Successfully uploaded ${data.success} new ${recordType} to Supabase`, 'success');
          
          // Re-fetch data based on upload type
          if (uploadType === 'participants') {
            if (data.participants && data.participants.length > 0) {
              setParticipants(prev => [...prev, ...data.participants]);
            }
            
            const { data: supabaseData } = await supabase
              .from('participants_csv')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (supabaseData) {
              setParticipants(supabaseData);
            }
          }
        } else if (data.errorDetails && data.errorDetails.some(msg => msg.includes('duplicate'))) {
          // All were duplicates
          const duplicateMsg = data.errorDetails.find(msg => msg.includes('duplicate'));
          showAlert(`ℹ️ ${duplicateMsg} - Data already exists in Supabase`, 'info');
        } else if (data.message === 'CSV processed successfully') {
          // Generic success but no new data
          showAlert('CSV processed but no new data to upload', 'info');
        } else {
          showAlert('No new participants to add', 'info');
        }
        
        // Show total count in database
        if (data.total !== undefined) {
          console.log(`Total participants in Supabase: ${participants.length + (data.success || 0)}`);
        }
      } else {
        showAlert(`❌ ${data.message || 'Upload failed'}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showAlert('Failed to upload CSV file', 'error');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddYatri = async (yatriData) => {
    try {
      // Add to Supabase
      const { error } = await supabase
        .from('participants_csv')
        .insert([yatriData]);

      if (error) {
        console.error('Error adding Yatri:', error);
        showAlert('Failed to add Yatri. Please try again.', 'error');
      } else {
        // Update local state
        setParticipants(prev => [...prev, yatriData]);
        showAlert('Yatri added successfully!', 'success');
        setShowAddYatriModal(false);
      }
    } catch (error) {
      console.error('Error adding Yatri:', error);
      showAlert('Failed to add Yatri. Please try again.', 'error');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Simplified Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }}>
              Jagriti Yatra Dashboard
            </h1>
            
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('analytics')}
                style={{
                  padding: '6px 12px',
                  background: activeTab === 'analytics' ? '#667eea' : 'transparent',
                  color: activeTab === 'analytics' ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                style={{
                  padding: '6px 12px',
                  background: activeTab === 'submissions' ? '#667eea' : 'transparent',
                  color: activeTab === 'submissions' ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Submissions
              </button>
            </div>
          </div>

          {/* Right side controls - simplified */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {activeTab === 'analytics' && (
              <>
                {/* Seat Counters */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>
                    Participants: <strong style={{ color: '#111827' }}>{participants.length}/450</strong>
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    {/* Priority Pass removed */}
                  </span>
                </div>

                {/* Upload Section */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="participants">Participants</option>
                    <option value="submissions">Submissions</option>
                    <option value="screenshot-pending">Screenshot</option>
                  </select>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="csv-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="csv-upload"
                    style={{
                      padding: '6px 12px',
                      background: uploading ? '#e5e7eb' : '#667eea',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {uploading ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Upload
                      </>
                    )}
                  </label>
                </div>

                {/* Add Yatri Button */}
                <button
                  onClick={() => setShowAddYatriModal(true)}
                  style={{
                    padding: '6px 12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UserPlus size={14} />
                  Add Yatri
                </button>
              </>
            )}
            


            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Alert */}
      {alert && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            ...(alert.severity === 'error' && {
              background: 'white',
              border: '1px solid #fca5a5',
              color: '#dc2626'
            }),
            ...(alert.severity === 'warning' && {
              background: 'white',
              border: '1px solid #fde68a',
              color: '#d97706'
            }),
            ...(alert.severity === 'success' && {
              background: 'white',
              border: '1px solid #bbf7d0',
              color: '#16a34a'
            }),
            ...(alert.severity === 'info' && {
              background: 'white',
              border: '1px solid #bfdbfe',
              color: '#2563eb'
            })
          }}>
            {alert.severity === 'success' && <CheckCircle size={20} />}
            {alert.severity === 'error' && <XCircle size={20} />}
            <span style={{ fontSize: '14px' }}>{alert.message}</span>
          </div>
        </div>
      )}

      {/* Revenue Summary - Only show on analytics tab */}
      {activeTab === 'analytics' && participants.length > 0 && (() => {
        const revenue = calculateRevenue(participants, []);
        return (
          <div style={{
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px'
          }}>
            <div style={{
              maxWidth: '1600px',
              margin: '0 auto',
              display: 'flex',
              gap: '32px',
              alignItems: 'center'
            }}>
              {/* Total Revenue */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <IndianRupee size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>TOTAL REVENUE</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                  {formatINR(revenue.totalRevenue)}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {revenue.collectionRate.toFixed(1)}% collected
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Participants Revenue */}
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    PARTICIPANTS
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {formatINR(revenue.participantRevenue)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {revenue.paidParticipants}/{participants.length} paid
                  </div>
                </div>

                {/* Priority Pass Revenue removed */}

                {/* Average */}
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    AVERAGE
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {formatINR(revenue.averageRevenue)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    per participant
                  </div>
                </div>

                {/* Gap */}
                <div>
                  <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '4px', fontWeight: '500' }}>
                    REVENUE GAP
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {formatINR(revenue.revenueGap)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    potential remaining
                  </div>
                </div>
              </div>

              {/* Fill Rate Progress */}
              <div style={{ minWidth: '200px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  CAPACITY UTILIZATION
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                    <span>Participants</span>
                    <span>{revenue.participantFillRate.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${revenue.participantFillRate}%`,
                      height: '100%',
                      background: '#10b981'
                    }} />
                  </div>
                </div>
                {/* Priority Pass capacity visualization removed */}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Content */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px' }}>
          {/* Unified Insights Banner - Shows all insights in one place */}
          {activeTab === 'analytics' && participants.length > 0 && (
            <UnifiedInsightsBanner participants={participants} />
          )}
          
          {/* Main Dashboard Content */}
          {activeTab === 'analytics' ? (
            <ModernDashboard participants={participants} />
          ) : (
            <CSVSubmissions />
          )}
        </div>
      )}

      {/* Add Yatri Modal */}
      <AddYatriModal 
        isOpen={showAddYatriModal}
        onClose={() => setShowAddYatriModal(false)}
        onSave={handleAddYatri}
      />

      {/* Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            0% { 
              opacity: 0;
              transform: translateX(100px);
            }
            100% { 
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `
      }} />
    </div>
  );
}

export default Dashboard;