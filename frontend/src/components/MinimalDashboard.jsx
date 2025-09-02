import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Users, TrendingUp, IndianRupee, Target } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MinimalDashboard = ({ participants = [] }) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    if (!participants || participants.length === 0) {
      return {
        totalParticipants: 0,
        totalRevenue: 0,
        averageScholarship: 0,
        conversionRate: 0,
        genderDistribution: { male: 0, female: 0, other: 0 },
        topStates: [],
        monthlyRevenue: {}
      };
    }

    // Process data
    const totalParticipants = participants.length;
    
    // Revenue calculations
    const totalRevenue = participants.reduce((sum, p) => 
      sum + (parseFloat(p.scholarship_total_amount_paid) || 0), 0);
    
    const paidParticipants = participants.filter(p => 
      parseFloat(p.scholarship_total_amount_paid) > 0).length;
    
    const averageScholarship = paidParticipants > 0 ? 
      totalRevenue / paidParticipants : 0;
    
    const conversionRate = totalParticipants > 0 ? 
      (paidParticipants / totalParticipants * 100) : 0;

    // Gender distribution
    const genderDistribution = participants.reduce((acc, p) => {
      const gender = (p.gender || 'other').toLowerCase();
      if (gender === 'male' || gender === 'female') {
        acc[gender] = (acc[gender] || 0) + 1;
      } else {
        acc.other = (acc.other || 0) + 1;
      }
      return acc;
    }, { male: 0, female: 0, other: 0 });

    // State distribution (top 5)
    const stateCount = participants.reduce((acc, p) => {
      const state = p.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    
    const topStates = Object.entries(stateCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Monthly revenue trend
    const monthlyRevenue = participants.reduce((acc, p) => {
      if (p.payment_date && p.scholarship_total_amount_paid) {
        const month = new Date(p.payment_date).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + parseFloat(p.scholarship_total_amount_paid);
      }
      return acc;
    }, {});

    return {
      totalParticipants,
      totalRevenue,
      averageScholarship,
      conversionRate,
      genderDistribution,
      topStates,
      monthlyRevenue
    };
  }, [participants]);

  // Format INR currency
  const formatINR = (amount) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Participants */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Total Participants</p>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
                {analytics.totalParticipants.toLocaleString('en-IN')}
              </h2>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} color="white" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Total Revenue</p>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
                {formatINR(analytics.totalRevenue)}
              </h2>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IndianRupee size={24} color="white" />
            </div>
          </div>
        </div>

        {/* Average Scholarship */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Avg. Scholarship</p>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
                {formatINR(analytics.averageScholarship)}
              </h2>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={24} color="white" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Conversion Rate</p>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
                {analytics.conversionRate.toFixed(1)}%
              </h2>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={24} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px'
      }}>
        {/* Monthly Revenue Trend */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Monthly Revenue Trend
          </h3>
          <div style={{ height: '250px' }}>
            <Line
              data={{
                labels: Object.keys(analytics.monthlyRevenue).sort(),
                datasets: [{
                  data: Object.entries(analytics.monthlyRevenue)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([, amount]) => amount),
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: '#667eea',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    ticks: {
                      ...chartOptions.scales.y.ticks,
                      callback: (value) => '₹' + (value/1000).toFixed(0) + 'K'
                    }
                  }
                },
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => formatINR(context.parsed.y)
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* State Distribution */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Top States
          </h3>
          <div style={{ height: '250px' }}>
            <Bar
              data={{
                labels: analytics.topStates.map(([state]) => state),
                datasets: [{
                  data: analytics.topStates.map(([, count]) => count),
                  backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(34, 197, 94, 0.8)'
                  ],
                  borderRadius: 8
                }]
              }}
              options={{
                ...chartOptions,
                indexAxis: 'y'
              }}
            />
          </div>
        </div>

        {/* Gender Distribution */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Gender Distribution
          </h3>
          <div style={{ height: '250px', position: 'relative' }}>
            <Doughnut
              data={{
                labels: ['Male', 'Female', 'Other'],
                datasets: [{
                  data: [
                    analytics.genderDistribution.male,
                    analytics.genderDistribution.female,
                    analytics.genderDistribution.other
                  ],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                  ],
                  borderWidth: 0
                }]
              }}
              options={{
                ...chartOptions,
                cutout: '65%',
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      font: { size: 12 }
                    }
                  }
                }
              }}
            />
            {/* Center text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {analytics.totalParticipants}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          color: 'white'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '20px'
          }}>
            Quick Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>Top State</p>
              <p style={{ fontSize: '18px', fontWeight: '600', margin: '4px 0' }}>
                {analytics.topStates[0] ? `${analytics.topStates[0][0]} (${analytics.topStates[0][1]})` : 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>Total States</p>
              <p style={{ fontSize: '18px', fontWeight: '600', margin: '4px 0' }}>
                {Object.keys(participants.reduce((acc, p) => ({ ...acc, [p.state || 'Unknown']: 1 }), {})).length}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>Data Quality</p>
              <p style={{ fontSize: '18px', fontWeight: '600', margin: '4px 0' }}>
                {((participants.filter(p => p.email && p.first_name && p.last_name).length / 
                  Math.max(participants.length, 1)) * 100).toFixed(0)}% Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalDashboard;