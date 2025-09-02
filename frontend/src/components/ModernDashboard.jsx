import React, { useMemo, useState } from 'react';
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
import { 
  Users, 
  IndianRupee, 
  Target,
  MapPin,
  Award,
  Activity,
  Briefcase,
  GraduationCap,
  Clock
} from 'lucide-react';
import SeatCapacityTracker from './SeatCapacityTracker';
import DeadlineCountdown from './DeadlineCountdown';
import RevenueAnalytics from './RevenueAnalytics';

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

const ModernDashboard = ({ participants = [] }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
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
        monthlyRevenue: {},
        yatriTypes: {},
        educationLevels: {},
        ageGroups: {},
        applicationTrend: {},
        topInstitutes: [],
        incomeDistribution: {}
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

    // State distribution (top 6)
    const stateCount = participants.reduce((acc, p) => {
      const state = p.state || p.address_state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    
    const topStates = Object.entries(stateCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Monthly revenue trend
    const monthlyRevenue = participants.reduce((acc, p) => {
      if (p.payment_date && p.scholarship_total_amount_paid) {
        const month = new Date(p.payment_date).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + parseFloat(p.scholarship_total_amount_paid);
      }
      return acc;
    }, {});

    // Yatri types distribution
    const yatriTypes = participants.reduce((acc, p) => {
      const type = p.yatri_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Education levels
    const educationLevels = participants.reduce((acc, p) => {
      const education = p.education || 'Not Specified';
      acc[education] = (acc[education] || 0) + 1;
      return acc;
    }, {});

    // Age groups
    const ageGroups = participants.reduce((acc, p) => {
      if (p.date_of_birth) {
        const age = new Date().getFullYear() - new Date(p.date_of_birth).getFullYear();
        let group;
        if (age < 20) group = '<20';
        else if (age <= 25) group = '20-25';
        else if (age <= 30) group = '26-30';
        else if (age <= 35) group = '31-35';
        else group = '35+';
        acc[group] = (acc[group] || 0) + 1;
      }
      return acc;
    }, {});

    // Application trend by month
    const applicationTrend = participants.reduce((acc, p) => {
      if (p.application_submitted_on) {
        const month = new Date(p.application_submitted_on).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    // Top institutes
    const instituteCount = participants.reduce((acc, p) => {
      if (p.institute) {
        acc[p.institute] = (acc[p.institute] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topInstitutes = Object.entries(instituteCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Income distribution
    const incomeDistribution = participants.reduce((acc, p) => {
      const income = parseFloat(p.yatri_annual_income) || 0;
      let bracket;
      if (income === 0) bracket = 'Not Specified';
      else if (income < 200000) bracket = '<2L';
      else if (income < 500000) bracket = '2L-5L';
      else if (income < 1000000) bracket = '5L-10L';
      else bracket = '10L+';
      acc[bracket] = (acc[bracket] || 0) + 1;
      return acc;
    }, {});

    return {
      totalParticipants,
      totalRevenue,
      averageScholarship,
      conversionRate,
      genderDistribution,
      topStates,
      monthlyRevenue,
      yatriTypes,
      educationLevels,
      ageGroups,
      applicationTrend,
      topInstitutes,
      incomeDistribution
    };
  }, [participants]);

  // Format INR currency
  const formatINR = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
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
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 14,
        cornerRadius: 12,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { 
          display: false,
          drawBorder: false
        },
        ticks: { 
          font: { size: 11 },
          color: '#64748b'
        }
      },
      y: {
        grid: { 
          color: 'rgba(0, 0, 0, 0.03)',
          drawBorder: false
        },
        ticks: { 
          font: { size: 11 },
          color: '#64748b'
        },
        border: {
          display: false
        }
      }
    }
  };

  // Modern gradient colors
  const gradients = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    danger: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    orange: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  };

  return (
    <div style={{ 
      padding: '32px', 
      maxWidth: '1600px', 
      margin: '0 auto',
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh'
    }}>
      {/* Deadline Countdown Section - Minimal */}
      <DeadlineCountdown 
        currentParticipants={participants.filter(p => p.yatri_type === 'participant').length}
        currentFacilitators={participants.filter(p => p.yatri_type === 'facilitator').length}
      />

      {/* Revenue Analytics - Combined Projections and Comparisons */}
      <RevenueAnalytics participants={participants} />

      {/* Seat Capacity Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          marginBottom: '24px',
          color: '#0f172a',
          letterSpacing: '-0.5px'
        }}>
          Seat Capacity Overview
        </h2>
        <SeatCapacityTracker participants={participants} />
      </div>

      {/* Hero Stats Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          marginBottom: '24px',
          color: '#0f172a',
          letterSpacing: '-0.5px'
        }}>
          Financial & Analytics Overview
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Total Participants */}
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: hoveredCard === 'participants' ? 
                '0 20px 40px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
              transform: hoveredCard === 'participants' ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.04)'
            }}
            onMouseEnter={() => setHoveredCard('participants')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '13px', 
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>
                  Total Participants
                </p>
                <h2 style={{ 
                  fontSize: '36px', 
                  fontWeight: '700', 
                  margin: '12px 0 8px 0',
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {analytics.totalParticipants.toLocaleString('en-IN')}
                </h2>
                <p style={{ 
                  color: '#10b981', 
                  fontSize: '13px', 
                  margin: 0,
                  fontWeight: '600'
                }}>
                  +12% from last month
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: gradients.primary,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
              }}>
                <Users size={28} color="white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: hoveredCard === 'revenue' ? 
                '0 20px 40px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
              transform: hoveredCard === 'revenue' ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.04)'
            }}
            onMouseEnter={() => setHoveredCard('revenue')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '13px', 
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>
                  Total Revenue
                </p>
                <h2 style={{ 
                  fontSize: '36px', 
                  fontWeight: '700', 
                  margin: '12px 0 8px 0',
                  background: gradients.success,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {formatINR(analytics.totalRevenue)}
                </h2>
                <p style={{ 
                  color: '#10b981', 
                  fontSize: '13px', 
                  margin: 0,
                  fontWeight: '600'
                }}>
                  +23% from last month
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: gradients.success,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)'
              }}>
                <IndianRupee size={28} color="white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Average Scholarship */}
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: hoveredCard === 'scholarship' ? 
                '0 20px 40px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
              transform: hoveredCard === 'scholarship' ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.04)'
            }}
            onMouseEnter={() => setHoveredCard('scholarship')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '13px', 
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>
                  Avg. Scholarship
                </p>
                <h2 style={{ 
                  fontSize: '36px', 
                  fontWeight: '700', 
                  margin: '12px 0 8px 0',
                  background: gradients.warning,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {formatINR(analytics.averageScholarship)}
                </h2>
                <p style={{ 
                  color: '#f59e0b', 
                  fontSize: '13px', 
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Steady growth
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: gradients.warning,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(250, 112, 154, 0.3)'
              }}>
                <Award size={28} color="white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: hoveredCard === 'conversion' ? 
                '0 20px 40px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
              transform: hoveredCard === 'conversion' ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.04)'
            }}
            onMouseEnter={() => setHoveredCard('conversion')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '13px', 
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>
                  Conversion Rate
                </p>
                <h2 style={{ 
                  fontSize: '36px', 
                  fontWeight: '700', 
                  margin: '12px 0 8px 0',
                  background: gradients.info,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {analytics.conversionRate.toFixed(1)}%
                </h2>
                <p style={{ 
                  color: '#06b6d4', 
                  fontSize: '13px', 
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Above average
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: gradients.info,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(48, 207, 208, 0.3)'
              }}>
                <Target size={28} color="white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Revenue Trend Chart */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              margin: 0,
              color: '#0f172a'
            }}>
              Revenue Trend
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: '#667eea',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>Monthly</button>
              <button style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>Quarterly</button>
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <Line
              data={{
                labels: Object.keys(analytics.monthlyRevenue).sort(),
                datasets: [{
                  data: Object.entries(analytics.monthlyRevenue)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([, amount]) => amount),
                  borderColor: '#667eea',
                  backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
                    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
                    gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
                    return gradient;
                  },
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: '#667eea',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 3,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                  borderWidth: 3
                }]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `Revenue: ${formatINR(context.parsed.y)}`
                    }
                  }
                },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    ticks: {
                      ...chartOptions.scales.y.ticks,
                      callback: (value) => formatINR(value)
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
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '24px'
          }}>
            <MapPin size={20} color="#667eea" />
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              margin: 0,
              color: '#0f172a'
            }}>
              Geographic Distribution
            </h3>
          </div>
          <div style={{ height: '280px' }}>
            <Bar
              data={{
                labels: analytics.topStates.map(([state]) => state),
                datasets: [{
                  data: analytics.topStates.map(([, count]) => count),
                  backgroundColor: [
                    'rgba(102, 126, 234, 0.85)',
                    'rgba(168, 85, 247, 0.85)',
                    'rgba(236, 72, 153, 0.85)',
                    'rgba(251, 146, 60, 0.85)',
                    'rgba(34, 197, 94, 0.85)',
                    'rgba(59, 130, 246, 0.85)'
                  ],
                  borderRadius: 12,
                  barThickness: 40
                }]
              }}
              options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `Participants: ${context.parsed.x}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Gender Distribution */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '20px',
            color: '#0f172a'
          }}>
            Gender Distribution
          </h3>
          <div style={{ height: '200px', position: 'relative' }}>
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
                    'rgba(79, 172, 254, 0.9)',
                    'rgba(236, 72, 153, 0.9)',
                    'rgba(168, 85, 247, 0.9)'
                  ],
                  borderWidth: 0
                }]
              }}
              options={{
                ...chartOptions,
                cutout: '70%',
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      font: { size: 12 },
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  }
                }
              }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
                {analytics.totalParticipants}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>TOTAL</div>
            </div>
          </div>
        </div>

        {/* Age Distribution */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '20px',
            color: '#0f172a'
          }}>
            Age Groups
          </h3>
          <div style={{ height: '200px' }}>
            <Bar
              data={{
                labels: Object.keys(analytics.ageGroups),
                datasets: [{
                  data: Object.values(analytics.ageGroups),
                  backgroundColor: 'rgba(102, 126, 234, 0.85)',
                  borderRadius: 8
                }]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `Count: ${context.parsed.y}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Quick Insights Card */}
        <div style={{
          background: gradients.primary,
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
          color: 'white'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '20px'
          }}>
            Key Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{ fontSize: '11px', opacity: 0.9, margin: 0, fontWeight: '600' }}>TOP STATE</p>
              <p style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0' }}>
                {analytics.topStates[0] ? analytics.topStates[0][0] : 'N/A'}
              </p>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                {analytics.topStates[0] ? `${analytics.topStates[0][1]} participants` : ''}
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{ fontSize: '11px', opacity: 0.9, margin: 0, fontWeight: '600' }}>DATA QUALITY</p>
              <p style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0' }}>
                {((participants.filter(p => p.email && p.first_name && p.last_name).length / 
                  Math.max(participants.length, 1)) * 100).toFixed(0)}%
              </p>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                Profile completion rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px'
      }}>
        {/* Mini Stats Cards */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={20} color="#667eea" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Total Institutes</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0', color: '#0f172a' }}>
                {Object.keys(analytics.topInstitutes).length}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={20} color="#22c55e" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Active States</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0', color: '#0f172a' }}>
                {Object.keys(analytics.topStates).length}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(251, 146, 60, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={20} color="#fb923c" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Yatri Types</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0', color: '#0f172a' }}>
                {Object.keys(analytics.yatriTypes).length}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} color="#a855f7" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Avg. Processing</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0', color: '#0f172a' }}>
                2.3 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;