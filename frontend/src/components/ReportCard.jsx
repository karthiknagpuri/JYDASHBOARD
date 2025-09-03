import React from 'react';

const ReportCard = () => {
  const stats = {
    totalSubmissions: 7934,
    writtenReviewed: 5911,
    videoReceived: 2905,
    videoScreened: 640,
    docsReceived: 381,
    scholarshipsAllotted: 379,
    regularOnboarded: 131,
    priorityPass: 33,
    deferral: 16,
    totalOnboarded: 180
  };

  const conversionRate = ((stats.totalOnboarded / stats.totalSubmissions) * 100).toFixed(2);

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Visual icons as simple SVG/emoji representations
  const icons = {
    applications: '📝',
    onboarded: '🎓',
    conversion: '📊',
    review: '✅'
  };

  const stageIcons = {
    submissions: '📋',
    written: '✍️',
    video: '🎥',
    screened: '👁️',
    documents: '📄',
    scholarship: '💰',
    onboarded: '🎯'
  };

  return (
    <div>
      {/* Main Summary - Board Meeting Focus */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #bfdbfe'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icons.applications}</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e40af' }}>
              {formatNumber(stats.totalSubmissions)}
            </div>
            <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500', marginTop: '4px' }}>
              TOTAL APPLICATIONS
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icons.onboarded}</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#047857' }}>
              {stats.totalOnboarded}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500', marginTop: '4px' }}>
              TOTAL ONBOARDED
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icons.conversion}</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#92400e' }}>
              {conversionRate}%
            </div>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500', marginTop: '4px' }}>
              CONVERSION RATE
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icons.review}</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#6b21a8' }}>
              74.5%
            </div>
            <div style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '500', marginTop: '4px' }}>
              REVIEW RATE
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Progress */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#1f2937', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          📈 Selection Pipeline Progress
        </h4>

        {/* Visual Progress Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          {[
            { icon: stageIcons.submissions, count: stats.totalSubmissions, label: 'Applications' },
            { icon: stageIcons.written, count: stats.writtenReviewed, label: 'Reviewed' },
            { icon: stageIcons.video, count: stats.videoReceived, label: 'Videos' },
            { icon: stageIcons.screened, count: stats.videoScreened, label: 'Screened' },
            { icon: stageIcons.documents, count: stats.docsReceived, label: 'Documents' },
            { icon: stageIcons.onboarded, count: stats.totalOnboarded, label: 'Onboarded' }
          ].map((stage, index, arr) => (
            <React.Fragment key={index}>
              <div style={{
                flex: 1,
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stage.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {formatNumber(stage.count)}
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                  {stage.label}
                </div>
              </div>
              {index < arr.length - 1 && (
                <div style={{
                  width: '30px',
                  height: '2px',
                  background: '#10b981',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    right: '-4px',
                    top: '-3px',
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    transform: 'rotate(45deg)'
                  }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Detailed Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Stage
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Count
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Progress
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                % of Previous
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>
                {stageIcons.submissions} Total Submissions
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {formatNumber(stats.totalSubmissions)}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#3b82f6',
                    borderRadius: '4px'
                  }} />
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                100%
              </td>
            </tr>
            
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>
                {stageIcons.written} Written Applications Reviewed
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {formatNumber(stats.writtenReviewed)}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '74.5%',
                    height: '100%',
                    background: '#3b82f6',
                    borderRadius: '4px'
                  }} />
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#3b82f6', fontWeight: '500' }}>
                74.5%
              </td>
            </tr>
            
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>
                {stageIcons.video} Video Interviews Received
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {formatNumber(stats.videoReceived)}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '36.6%',
                    height: '100%',
                    background: '#10b981',
                    borderRadius: '4px'
                  }} />
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#10b981', fontWeight: '500' }}>
                49.1%
              </td>
            </tr>
            
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>
                {stageIcons.screened} Video Interviews Screened
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {formatNumber(stats.videoScreened)}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '8.1%',
                    height: '100%',
                    background: '#f59e0b',
                    borderRadius: '4px'
                  }} />
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#f59e0b', fontWeight: '500' }}>
                22.0%
              </td>
            </tr>
            
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>
                {stageIcons.documents} Scholarship Documents Received
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {formatNumber(stats.docsReceived)}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '4.8%',
                    height: '100%',
                    background: '#8b5cf6',
                    borderRadius: '4px'
                  }} />
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#8b5cf6', fontWeight: '500' }}>
                59.5%
              </td>
            </tr>
            
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>
                {stageIcons.scholarship} Scholarships Allotted
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {formatNumber(stats.scholarshipsAllotted)}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '4.8%',
                    height: '100%',
                    background: '#ef4444',
                    borderRadius: '4px'
                  }} />
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#ef4444', fontWeight: '500' }}>
                99.5%
              </td>
            </tr>
            
            <tr style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
              <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#047857' }}>
                {stageIcons.onboarded} TOTAL ONBOARDED
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: '700', color: '#047857' }}>
                {stats.totalOnboarded}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '10px',
                  background: '#bbf7d0',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${conversionRate}%`,
                    height: '100%',
                    background: '#10b981',
                    borderRadius: '5px'
                  }} />
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#047857' }}>
                {conversionRate}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Onboarding Breakdown - Visual Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderTop: '4px solid #3b82f6'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
            {stats.regularOnboarded}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Regular Onboarding
          </div>
          <div style={{
            marginTop: '12px',
            padding: '4px 8px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>72.8%</span>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderTop: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
            {stats.priorityPass}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Priority Pass
          </div>
          <div style={{
            marginTop: '12px',
            padding: '4px 8px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>18.3%</span>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderTop: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏰</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
            {stats.deferral}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Deferral
          </div>
          <div style={{
            marginTop: '12px',
            padding: '4px 8px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>8.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;