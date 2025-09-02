import React from 'react';
import { Users, UserCheck, TrendingUp, AlertTriangle } from 'lucide-react';

const SeatCapacityTracker = ({ participants = [] }) => {
  // Constants for seat allocation
  const PARTICIPANT_SEATS = 450;
  const FACILITATOR_SEATS = 75;
  const TOTAL_SEATS = PARTICIPANT_SEATS + FACILITATOR_SEATS;

  // Calculate current occupancy
  const facilitators = participants.filter(p => 
    p.yatri_type && p.yatri_type.toLowerCase() === 'facilitator'
  ).length;
  
  const regularParticipants = participants.filter(p => 
    !p.yatri_type || p.yatri_type.toLowerCase() === 'participant'
  ).length;
  
  const totalOccupied = participants.length;

  // Calculate percentages
  const participantPercentage = (regularParticipants / PARTICIPANT_SEATS * 100).toFixed(1);
  const facilitatorPercentage = (facilitators / FACILITATOR_SEATS * 100).toFixed(1);
  const totalPercentage = (totalOccupied / TOTAL_SEATS * 100).toFixed(1);

  // Determine status colors based on occupancy
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return '#ef4444'; // Red - Almost full
    if (percentage >= 75) return '#f59e0b'; // Yellow - Warning
    return '#10b981'; // Green - Available
  };

  const getGradient = (percentage) => {
    if (percentage >= 90) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (percentage >= 75) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    }}>
      {/* Participant Seats Card */}
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
          background: getGradient(participantPercentage),
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
                Participant Seats
              </p>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '8px 0',
                color: '#0f172a'
              }}>
                {regularParticipants} / {PARTICIPANT_SEATS}
              </h2>
              <p style={{ 
                color: getStatusColor(participantPercentage), 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '600'
              }}>
                {PARTICIPANT_SEATS - regularParticipants} seats available
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: getGradient(participantPercentage),
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${getStatusColor(participantPercentage)}33`
            }}>
              <Users size={28} color="white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '12px',
            background: '#f1f5f9',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${Math.min(participantPercentage, 100)}%`,
              height: '100%',
              background: getGradient(participantPercentage),
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }} />
          </div>
          
          <p style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            background: getGradient(participantPercentage),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {participantPercentage}% Filled
          </p>
        </div>
      </div>

      {/* Facilitator Seats Card */}
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
          background: getGradient(facilitatorPercentage),
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
                Facilitator Seats
              </p>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '8px 0',
                color: '#0f172a'
              }}>
                {facilitators} / {FACILITATOR_SEATS}
              </h2>
              <p style={{ 
                color: getStatusColor(facilitatorPercentage), 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '600'
              }}>
                {FACILITATOR_SEATS - facilitators} seats available
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: getGradient(facilitatorPercentage),
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${getStatusColor(facilitatorPercentage)}33`
            }}>
              <UserCheck size={28} color="white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '12px',
            background: '#f1f5f9',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${Math.min(facilitatorPercentage, 100)}%`,
              height: '100%',
              background: getGradient(facilitatorPercentage),
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }} />
          </div>
          
          <p style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            background: getGradient(facilitatorPercentage),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {facilitatorPercentage}% Filled
          </p>
        </div>
      </div>

      {/* Total Capacity Card */}
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
                Total Capacity
              </p>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '8px 0'
              }}>
                {totalOccupied} / {TOTAL_SEATS}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '600',
                opacity: 0.9
              }}>
                {TOTAL_SEATS - totalOccupied} total seats remaining
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
          
          {/* Combined Progress */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 4px 0', fontWeight: '600' }}>PARTICIPANTS</p>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(participantPercentage, 100)}%`,
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.8)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 4px 0', fontWeight: '600' }}>FACILITATORS</p>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(facilitatorPercentage, 100)}%`,
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.8)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          </div>
          
          <p style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: 0
          }}>
            {totalPercentage}% Overall Occupancy
          </p>
          
          {/* Warning if approaching capacity */}
          {totalPercentage >= 85 && (
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
              <AlertTriangle size={20} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                Approaching full capacity!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatCapacityTracker;