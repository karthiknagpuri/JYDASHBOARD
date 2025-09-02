import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Users, Calendar, Target, AlertTriangle } from 'lucide-react';

const DeadlineCountdown = ({ currentParticipants = 0, currentFacilitators = 0 }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [daysRemaining, setDaysRemaining] = useState(0);

  // September 30, 2025 deadline
  const DEADLINE = new Date('2025-09-30T23:59:59');
  const PARTICIPANT_CAPACITY = 450;
  const FACILITATOR_CAPACITY = 75;
  const TOTAL_CAPACITY = PARTICIPANT_CAPACITY + FACILITATOR_CAPACITY;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = DEADLINE - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setDaysRemaining(days + (hours > 0 ? 1 : 0));
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setDaysRemaining(0);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate metrics
  const remainingSeats = TOTAL_CAPACITY - (currentParticipants + currentFacilitators);
  const fillPercentage = ((currentParticipants + currentFacilitators) / TOTAL_CAPACITY * 100).toFixed(1);
  const dailyTarget = daysRemaining > 0 ? Math.ceil(remainingSeats / daysRemaining) : remainingSeats;
  
  // Daily breakdown
  const participantSeatsLeft = PARTICIPANT_CAPACITY - currentParticipants;
  const facilitatorSeatsLeft = FACILITATOR_CAPACITY - currentFacilitators;
  const dailyParticipants = daysRemaining > 0 ? Math.ceil(participantSeatsLeft / daysRemaining) : participantSeatsLeft;
  const dailyFacilitators = daysRemaining > 0 ? Math.ceil(facilitatorSeatsLeft / daysRemaining) : facilitatorSeatsLeft;

  // Urgency level
  const isUrgent = daysRemaining <= 30 || dailyTarget > 15;
  const urgencyColor = dailyTarget > 15 ? '#dc2626' : dailyTarget > 10 ? '#ea580c' : dailyTarget > 5 ? '#ca8a04' : '#16a34a';

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    }}>
      {/* Header with urgency indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} color={isUrgent ? '#ef4444' : '#3b82f6'} />
          </div>
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0
            }}>
              Registration Deadline
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              margin: '2px 0 0 0'
            }}>
              September 30, 2025
            </p>
          </div>
        </div>
        {isUrgent && (
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertTriangle size={12} />
            URGENT
          </span>
        )}
      </div>

      {/* Main content grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        {/* Countdown */}
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            marginBottom: '12px'
          }}>
            <Clock size={14} color="#6b7280" />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
              Time Remaining
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {timeLeft.days || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>days</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {timeLeft.hours || 0}:{String(timeLeft.minutes || 0).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>hours</div>
            </div>
          </div>
        </div>

        {/* Daily Target */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.5) 0%, rgba(219, 234, 254, 0.5) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            marginBottom: '12px'
          }}>
            <Target size={14} color="#3b82f6" />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
              Daily Target
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: urgencyColor, lineHeight: '1' }}>
            {dailyTarget}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            seats per day
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '11px' }}>
              <span style={{ color: '#6b7280' }}>P:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}> {dailyParticipants}/day</span>
            </div>
            <div style={{ fontSize: '11px' }}>
              <span style={{ color: '#6b7280' }}>F:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}> {dailyFacilitators}/day</span>
            </div>
          </div>
        </div>

        {/* Current Progress */}
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            marginBottom: '12px'
          }}>
            <Users size={14} color="#6b7280" />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
              Current Status
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {currentParticipants + currentFacilitators}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>registered</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#ea580c' }}>
                {remainingSeats}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>remaining</div>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '11px',
              marginBottom: '4px'
            }}>
              <span style={{ color: '#6b7280' }}>Progress</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{fillPercentage}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(fillPercentage, 100)}%`,
                height: '100%',
                background: fillPercentage >= 75 ? '#10b981' : 
                            fillPercentage >= 50 ? '#3b82f6' :
                            fillPercentage >= 25 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Seats Breakdown */}
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            marginBottom: '12px'
          }}>
            <TrendingUp size={14} color="#6b7280" />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
              Breakdown
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              paddingBottom: '8px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Participants</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                {currentParticipants}/{PARTICIPANT_CAPACITY}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Facilitators</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                {currentFacilitators}/{FACILITATOR_CAPACITY}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert message if needed */}
      {dailyTarget > 10 && daysRemaining > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <span style={{ fontSize: '12px', color: '#92400e' }}>
            High daily target! Need to register {dailyTarget} people per day 
            ({Math.round(dailyTarget/24)} per hour) to meet the deadline.
          </span>
        </div>
      )}
    </div>
  );
};

export default DeadlineCountdown;