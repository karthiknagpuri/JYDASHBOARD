import React from 'react';
import { Users, UserCheck, TrendingUp, Activity } from 'lucide-react';

const SeatCapacityTracker = ({ participants = [] }) => {
  // Calculate actual counts from uploaded data
  const facilitators = participants.filter(p => 
    p.yatri_type && p.yatri_type.toLowerCase() === 'facilitator'
  ).length;
  
  const regularParticipants = participants.filter(p => 
    !p.yatri_type || p.yatri_type.toLowerCase() === 'participant'
  ).length;
  
  const totalRegistered = participants.length;

  // Helper function for gradient colors
  const getGradient = () => 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    }}>
      {/* Participant Count Card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: getGradient(),
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
          opacity: 0.1
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ 
                color: '#64748b', 
                fontSize: '13px', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                Registered Participants
              </p>
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                margin: '8px 0',
                color: '#0f172a',
                whiteSpace: 'nowrap'
              }}>
                {regularParticipants.toLocaleString('en-IN')}
              </h2>
              <p style={{ 
                color: '#10b981', 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '600'
              }}>
                Yatris registered
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: getGradient(),
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
            }}>
              <Users size={28} color="white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Activity Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: '#f0fdf4',
            borderRadius: '12px',
            marginTop: '16px'
          }}>
            <Activity size={16} color="#10b981" />
            <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '500' }}>
              Active registrations from database
            </span>
          </div>
        </div>
      </div>

      {/* Facilitator Count Card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
          opacity: 0.1
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ 
                color: '#64748b', 
                fontSize: '13px', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                Registered Facilitators
              </p>
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                margin: '8px 0',
                color: '#0f172a',
                whiteSpace: 'nowrap'
              }}>
                {facilitators.toLocaleString('en-IN')}
              </h2>
              <p style={{ 
                color: '#3b82f6', 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '600'
              }}>
                Facilitators registered
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
            }}>
              <UserCheck size={28} color="white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Activity Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '12px',
            marginTop: '16px'
          }}>
            <Activity size={16} color="#3b82f6" />
            <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: '500' }}>
              Active facilitator registrations
            </span>
          </div>
        </div>
      </div>

      {/* Total Registration Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ 
                fontSize: '13px', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600',
                opacity: 0.9
              }}>
                Total Registrations
              </p>
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                margin: '8px 0',
                whiteSpace: 'nowrap'
              }}>
                {totalRegistered.toLocaleString('en-IN')}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '600',
                opacity: 0.9
              }}>
                Total Yatris in database
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <TrendingUp size={28} color="white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Registration Breakdown */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 4px 0', fontWeight: '600' }}>PARTICIPANTS</p>
              <div style={{
                fontSize: '20px',
                fontWeight: '700'
              }}>
                {regularParticipants.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 4px 0', fontWeight: '600' }}>FACILITATORS</p>
              <div style={{
                fontSize: '20px',
                fontWeight: '700'
              }}>
                {facilitators.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          
          {/* Distribution Percentage */}
          {totalRegistered > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                Distribution: {((regularParticipants / totalRegistered) * 100).toFixed(1)}% Participants, {((facilitators / totalRegistered) * 100).toFixed(1)}% Facilitators
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatCapacityTracker;