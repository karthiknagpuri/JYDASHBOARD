import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { TrendingUp, Users, DollarSign, Calendar, MapPin, BookOpen, Target, Award } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const InteractiveAnalytics = ({ participants }) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [compareMode, setCompareMode] = useState(false);

  // Calculate advanced metrics
  const analytics = useMemo(() => {
    if (!participants || participants.length === 0) {
      return {
        totalParticipants: 0,
        averageAge: 0,
        genderDistribution: {},
        stateDistribution: {},
        educationLevels: {},
        monthlyTrends: {},
        revenueByType: {},
        conversionRate: 0,
        averageScholarship: 0,
        topStates: [],
        ageGroups: {},
        paymentTrends: {},
        applicationSources: {},
        interestAreas: {},
        incomeDistribution: {}
      };
    }

    // Calculate age from DOB
    const calculateAge = (dob) => {
      if (!dob) return null;
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Process participants data
    const processedData = participants.map(p => ({
      ...p,
      age: calculateAge(p.date_of_birth),
      applicationMonth: p.application_submitted_on ? 
        new Date(p.application_submitted_on).toISOString().slice(0, 7) : null,
      paymentMonth: p.payment_date ? 
        new Date(p.payment_date).toISOString().slice(0, 7) : null
    }));

    // Gender distribution
    const genderDistribution = processedData.reduce((acc, p) => {
      const gender = p.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // State distribution (top 10)
    const stateDistribution = processedData.reduce((acc, p) => {
      const state = p.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    
    const topStates = Object.entries(stateDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Education levels
    const educationLevels = processedData.reduce((acc, p) => {
      const education = p.education || 'Unknown';
      acc[education] = (acc[education] || 0) + 1;
      return acc;
    }, {});

    // Age groups
    const ageGroups = processedData.reduce((acc, p) => {
      if (!p.age) return acc;
      let group;
      if (p.age < 20) group = '< 20';
      else if (p.age <= 25) group = '20-25';
      else if (p.age <= 30) group = '26-30';
      else if (p.age <= 35) group = '31-35';
      else group = '> 35';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});

    // Monthly application trends
    const monthlyTrends = processedData.reduce((acc, p) => {
      if (p.applicationMonth) {
        acc[p.applicationMonth] = (acc[p.applicationMonth] || 0) + 1;
      }
      return acc;
    }, {});

    // Payment trends
    const paymentTrends = processedData.reduce((acc, p) => {
      if (p.paymentMonth && p.scholarship_total_amount_paid) {
        if (!acc[p.paymentMonth]) {
          acc[p.paymentMonth] = { count: 0, total: 0 };
        }
        acc[p.paymentMonth].count += 1;
        acc[p.paymentMonth].total += parseFloat(p.scholarship_total_amount_paid) || 0;
      }
      return acc;
    }, {});

    // Revenue by participant type
    const revenueByType = processedData.reduce((acc, p) => {
      const type = p.yatri_type || 'Unknown';
      const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
      acc[type] = (acc[type] || 0) + amount;
      return acc;
    }, {});

    // Interest areas
    const interestAreas = processedData.reduce((acc, p) => {
      if (p.area_of_interest) {
        acc[p.area_of_interest] = (acc[p.area_of_interest] || 0) + 1;
      }
      if (p.area_of_interest_2) {
        acc[p.area_of_interest_2] = (acc[p.area_of_interest_2] || 0) + 1;
      }
      return acc;
    }, {});

    // Income distribution
    const incomeDistribution = processedData.reduce((acc, p) => {
      const income = parseFloat(p.yatri_annual_income) || 0;
      let bracket;
      if (income === 0) bracket = 'Not Specified';
      else if (income < 100000) bracket = '< 1L';
      else if (income < 300000) bracket = '1L - 3L';
      else if (income < 500000) bracket = '3L - 5L';
      else if (income < 1000000) bracket = '5L - 10L';
      else bracket = '> 10L';
      acc[bracket] = (acc[bracket] || 0) + 1;
      return acc;
    }, {});

    // Calculate metrics
    const totalParticipants = processedData.length;
    const paidParticipants = processedData.filter(p => p.scholarship_total_amount_paid > 0).length;
    const conversionRate = totalParticipants > 0 ? (paidParticipants / totalParticipants * 100).toFixed(2) : 0;
    
    const totalRevenue = processedData.reduce((sum, p) => 
      sum + (parseFloat(p.scholarship_total_amount_paid) || 0), 0);
    const averageScholarship = paidParticipants > 0 ? 
      (totalRevenue / paidParticipants).toFixed(2) : 0;

    const averageAge = processedData.filter(p => p.age).reduce((sum, p) => sum + p.age, 0) / 
      processedData.filter(p => p.age).length || 0;

    return {
      totalParticipants,
      averageAge: averageAge.toFixed(1),
      genderDistribution,
      stateDistribution,
      educationLevels,
      monthlyTrends,
      revenueByType,
      conversionRate,
      averageScholarship,
      topStates,
      ageGroups,
      paymentTrends,
      applicationSources: processedData.reduce((acc, p) => {
        const source = p.source || 'Direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {}),
      interestAreas: Object.entries(interestAreas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {}),
      incomeDistribution,
      totalRevenue: totalRevenue.toFixed(2)
    };
  }, [participants]);

  // Chart configurations with interactivity
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString()
        }
      }
    }
  };

  // Render metric cards
  const MetricCard = ({ icon: Icon, title, value, trend, color = '#1976d2' }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: `linear-gradient(90deg, ${color}, ${color}dd)`
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{value}</h3>
          {trend && (
            <p style={{ 
              color: trend > 0 ? '#4caf50' : '#f44336', 
              fontSize: '12px', 
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <TrendingUp size={14} />
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <Icon size={32} style={{ color, opacity: 0.8 }} />
      </div>
    </div>
  );

  // Render charts based on selected metric
  const renderCharts = () => {
    switch (selectedMetric) {
      case 'demographics':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Gender Distribution */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Gender Distribution</h3>
              <div style={{ height: '300px' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(analytics.genderDistribution),
                    datasets: [{
                      data: Object.values(analytics.genderDistribution),
                      backgroundColor: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b'],
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={{ ...chartOptions, cutout: '60%' }}
                />
              </div>
            </div>

            {/* Age Groups */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Age Distribution</h3>
              <div style={{ height: '300px' }}>
                <Bar
                  data={{
                    labels: Object.keys(analytics.ageGroups),
                    datasets: [{
                      label: 'Participants',
                      data: Object.values(analytics.ageGroups),
                      backgroundColor: '#8b5cf6',
                      borderRadius: 8
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Education Levels */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Education Levels</h3>
              <div style={{ height: '300px' }}>
                <Radar
                  data={{
                    labels: Object.keys(analytics.educationLevels).slice(0, 8),
                    datasets: [{
                      label: 'Count',
                      data: Object.values(analytics.educationLevels).slice(0, 8),
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      borderColor: '#22c55e',
                      pointBackgroundColor: '#22c55e'
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Income Distribution */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Income Distribution</h3>
              <div style={{ height: '300px' }}>
                <Pie
                  data={{
                    labels: Object.keys(analytics.incomeDistribution),
                    datasets: [{
                      data: Object.values(analytics.incomeDistribution),
                      backgroundColor: [
                        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6'
                      ]
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        );

      case 'geographic':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
            {/* State Distribution */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Top 10 States</h3>
              <div style={{ height: '400px' }}>
                <Bar
                  data={{
                    labels: analytics.topStates.map(([state]) => state),
                    datasets: [{
                      label: 'Participants',
                      data: analytics.topStates.map(([, count]) => count),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: '#3b82f6',
                      borderWidth: 1,
                      borderRadius: 8
                    }]
                  }}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                      ...chartOptions.plugins,
                      datalabels: {
                        anchor: 'end',
                        align: 'right',
                        formatter: (value) => value
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Geographic Heat Map placeholder */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Geographic Distribution</h3>
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: 'white'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <MapPin size={48} style={{ marginBottom: '16px' }} />
                  <h4>Interactive Map Coming Soon</h4>
                  <p style={{ marginTop: '8px', opacity: 0.9 }}>
                    {analytics.totalParticipants} participants across {Object.keys(analytics.stateDistribution).length} states
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
            {/* Revenue Trends */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Revenue Trends</h3>
              <div style={{ height: '350px' }}>
                <Line
                  data={{
                    labels: Object.keys(analytics.paymentTrends).sort(),
                    datasets: [{
                      label: 'Revenue',
                      data: Object.entries(analytics.paymentTrends)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([, data]) => data.total),
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        ticks: {
                          callback: (value) => '₹' + value.toLocaleString()
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Revenue by Type */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Revenue by Participant Type</h3>
              <div style={{ height: '350px' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(analytics.revenueByType),
                    datasets: [{
                      data: Object.values(analytics.revenueByType),
                      backgroundColor: [
                        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'
                      ],
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        ...chartOptions.plugins.tooltip,
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = '₹' + context.parsed.toLocaleString();
                            return `${label}: ${value}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Payment Distribution */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Monthly Payment Volume</h3>
              <div style={{ height: '350px' }}>
                <Bar
                  data={{
                    labels: Object.keys(analytics.paymentTrends).sort(),
                    datasets: [{
                      label: 'Number of Payments',
                      data: Object.entries(analytics.paymentTrends)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([, data]) => data.count),
                      backgroundColor: 'rgba(251, 146, 60, 0.8)',
                      borderColor: '#fb923c',
                      borderWidth: 1,
                      borderRadius: 8
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
            {/* Application Trends */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Application Trends</h3>
              <div style={{ height: '350px' }}>
                <Line
                  data={{
                    labels: Object.keys(analytics.monthlyTrends).sort(),
                    datasets: [{
                      label: 'Applications',
                      data: Object.entries(analytics.monthlyTrends)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([, count]) => count),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Interest Areas */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Top Interest Areas</h3>
              <div style={{ height: '350px' }}>
                <Bar
                  data={{
                    labels: Object.keys(analytics.interestAreas),
                    datasets: [{
                      label: 'Participants',
                      data: Object.values(analytics.interestAreas),
                      backgroundColor: 'rgba(168, 85, 247, 0.8)',
                      borderColor: '#a855f7',
                      borderWidth: 1,
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

            {/* Source Analysis */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '16px' }}>Application Sources</h3>
              <div style={{ height: '350px' }}>
                <Pie
                  data={{
                    labels: Object.keys(analytics.applicationSources),
                    datasets: [{
                      data: Object.values(analytics.applicationSources),
                      backgroundColor: [
                        '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16'
                      ]
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        );

      default: // overview
        return (
          <div>
            {/* Key Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              marginBottom: '32px'
            }}>
              <MetricCard
                icon={Users}
                title="Total Participants"
                value={analytics.totalParticipants.toLocaleString()}
                color="#3b82f6"
              />
              <MetricCard
                icon={DollarSign}
                title="Total Revenue"
                value={`₹${parseFloat(analytics.totalRevenue).toLocaleString()}`}
                color="#10b981"
              />
              <MetricCard
                icon={Target}
                title="Conversion Rate"
                value={`${analytics.conversionRate}%`}
                color="#8b5cf6"
              />
              <MetricCard
                icon={Award}
                title="Avg. Scholarship"
                value={`₹${parseFloat(analytics.averageScholarship).toLocaleString()}`}
                color="#f59e0b"
              />
            </div>

            {/* Combined Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
              {/* Application & Revenue Trends */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '16px' }}>Application & Revenue Trends</h3>
                <div style={{ height: '350px' }}>
                  <Line
                    data={{
                      labels: [...new Set([
                        ...Object.keys(analytics.monthlyTrends),
                        ...Object.keys(analytics.paymentTrends)
                      ])].sort(),
                      datasets: [
                        {
                          label: 'Applications',
                          data: [...new Set([
                            ...Object.keys(analytics.monthlyTrends),
                            ...Object.keys(analytics.paymentTrends)
                          ])].sort().map(month => analytics.monthlyTrends[month] || 0),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          yAxisID: 'y',
                          tension: 0.4
                        },
                        {
                          label: 'Revenue',
                          data: [...new Set([
                            ...Object.keys(analytics.monthlyTrends),
                            ...Object.keys(analytics.paymentTrends)
                          ])].sort().map(month => analytics.paymentTrends[month]?.total || 0),
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          yAxisID: 'y1',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        x: chartOptions.scales.x,
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Applications'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Revenue (₹)'
                          },
                          ticks: {
                            callback: (value) => '₹' + value.toLocaleString()
                          },
                          grid: {
                            drawOnChartArea: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Demographics Overview */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '16px' }}>Demographics Overview</h3>
                <div style={{ height: '350px' }}>
                  <Bar
                    data={{
                      labels: ['Gender', 'Age Groups', 'Education'],
                      datasets: [
                        {
                          label: 'Male',
                          data: [
                            analytics.genderDistribution['male'] || 0,
                            0,
                            0
                          ],
                          backgroundColor: '#3b82f6'
                        },
                        {
                          label: 'Female',
                          data: [
                            analytics.genderDistribution['female'] || 0,
                            0,
                            0
                          ],
                          backgroundColor: '#ec4899'
                        },
                        {
                          label: '20-25',
                          data: [
                            0,
                            analytics.ageGroups['20-25'] || 0,
                            0
                          ],
                          backgroundColor: '#8b5cf6'
                        },
                        {
                          label: '26-30',
                          data: [
                            0,
                            analytics.ageGroups['26-30'] || 0,
                            0
                          ],
                          backgroundColor: '#10b981'
                        },
                        {
                          label: 'Graduate',
                          data: [
                            0,
                            0,
                            Object.entries(analytics.educationLevels)
                              .filter(([key]) => key.toLowerCase().includes('graduate'))
                              .reduce((sum, [, val]) => sum + val, 0)
                          ],
                          backgroundColor: '#f59e0b'
                        }
                      ]
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales.x,
                          stacked: true
                        },
                        y: {
                          ...chartOptions.scales.y,
                          stacked: true
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header with Controls */}
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Interactive Analytics</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Real-time insights from {analytics.totalParticipants} participants
          </p>
        </div>

        {/* Metric Selector */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { value: 'overview', label: 'Overview' },
            { value: 'demographics', label: 'Demographics' },
            { value: 'geographic', label: 'Geographic' },
            { value: 'financial', label: 'Financial' },
            { value: 'trends', label: 'Trends' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedMetric(option.value)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: selectedMetric === option.value ? 'none' : '1px solid #e5e5e5',
                background: selectedMetric === option.value ? 
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: selectedMetric === option.value ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: selectedMetric === option.value ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
                boxShadow: selectedMetric === option.value ? 
                  '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      {renderCharts()}

      {/* Insights Panel */}
      {selectedMetric === 'overview' && (
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '16px' }}>📊 Key Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ 
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} /> Growth Opportunity
              </h4>
              <p style={{ margin: 0, opacity: 0.95, lineHeight: 1.6 }}>
                {analytics.topStates[0] && `${analytics.topStates[0][0]} leads with ${analytics.topStates[0][1]} participants. 
                Consider targeted campaigns in underrepresented states.`}
              </p>
            </div>
            
            <div style={{ 
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> Demographics
              </h4>
              <p style={{ margin: 0, opacity: 0.95, lineHeight: 1.6 }}>
                Average participant age is {analytics.averageAge} years. 
                Gender ratio shows opportunity for targeted outreach.
              </p>
            </div>
            
            <div style={{ 
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} /> Revenue
              </h4>
              <p style={{ margin: 0, opacity: 0.95, lineHeight: 1.6 }}>
                {analytics.conversionRate}% conversion rate with average scholarship of ₹{analytics.averageScholarship}.
                Focus on improving conversion to maximize revenue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveAnalytics;