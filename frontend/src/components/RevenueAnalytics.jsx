import React, { useState, useMemo } from 'react';
import { TrendingUp, Target, AlertCircle, CheckCircle, XCircle, BarChart3, DollarSign, Users, Calendar, ChevronRight } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import RevenueScenario from './RevenueScenario';
import GeographicalDistribution from './GeographicalDistribution';
import StateWiseAnalysis from './StateWiseAnalysis';

const RevenueAnalytics = ({ participants = [] }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'projection', 'comparison', 'gap', 'scenario', 'geographical', 'statewise'
  const [viewMode, setViewMode] = useState('chart'); // for projection view

  // Best Case/Target Projections Data
  const projectionData = [
    { month: 'March', registration: 10000, submission: 400, onboard: 40, revenue: 2106720, newReg: 10000 },
    { month: 'April', registration: 14000, submission: 800, onboard: 15, revenue: 790020, newReg: 4000 },
    { month: 'May', registration: 18000, submission: 1500, onboard: 15, revenue: 790020, newReg: 4000 },
    { month: 'June', registration: 25000, submission: 2000, onboard: 15, revenue: 790020, newReg: 7000 },
    { month: 'July', registration: 30000, submission: 2500, onboard: 20, revenue: 1053360, newReg: 5000 },
    { month: 'August', registration: 35000, submission: 3500, onboard: 20, revenue: 1053360, newReg: 5000 },
    { month: 'September', registration: 45000, submission: 5000, onboard: 150, revenue: 7900200, newReg: 10000 },
    { month: 'October', registration: 50000, submission: 7000, onboard: 200, revenue: 10533600, newReg: 5000 }
  ];

  // Calculate actual data from uploaded participants
  const actualData = useMemo(() => {
    const monthlyData = {};
    
    participants.forEach(p => {
      const dateField = p.application_submitted_on || p.payment_date || p.selected_date;
      if (dateField) {
        const date = new Date(dateField);
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        
        if (!monthlyData[month]) {
          monthlyData[month] = {
            registrations: 0,
            onboarded: 0,
            revenue: 0
          };
        }
        
        monthlyData[month].registrations++;
        
        if (p.scholarship_total_amount_paid && parseFloat(p.scholarship_total_amount_paid) > 0) {
          monthlyData[month].onboarded++;
          monthlyData[month].revenue += parseFloat(p.scholarship_total_amount_paid);
        }
      }
    });

    return projectionData.map(target => {
      const actual = monthlyData[target.month] || { registrations: 0, onboarded: 0, revenue: 0 };
      return {
        month: target.month,
        registration: actual.registrations,
        onboard: actual.onboarded,
        revenue: actual.revenue
      };
    });
  }, [participants]);

  // Calculate totals
  const targetTotals = {
    registration: 50000,
    submission: 26700,
    onboard: 475,
    revenue: 25017300
  };

  const actualTotals = actualData.reduce((acc, month) => ({
    registration: acc.registration + month.registration,
    onboard: acc.onboard + month.onboard,
    revenue: acc.revenue + month.revenue
  }), { registration: 0, onboard: 0, revenue: 0 });

  // Calculate metrics
  const performanceMetrics = {
    registrationPerf: ((actualTotals.registration / targetTotals.registration) * 100).toFixed(1),
    onboardPerf: ((actualTotals.onboard / targetTotals.onboard) * 100).toFixed(1),
    revenuePerf: ((actualTotals.revenue / targetTotals.revenue) * 100).toFixed(1)
  };

  const gaps = {
    registration: targetTotals.registration - actualTotals.registration,
    onboard: targetTotals.onboard - actualTotals.onboard,
    revenue: targetTotals.revenue - actualTotals.revenue
  };

  const activeMonths = projectionData.filter(m => m.revenue > 0).length;
  const avgRevenue = targetTotals.revenue / activeMonths;
  const peakMonth = projectionData.reduce((max, month) => 
    month.revenue > max.revenue ? month : max, projectionData[0]);
  const conversionRate = ((targetTotals.onboard / targetTotals.registration) * 100).toFixed(2);
  const actualConversionRate = actualTotals.registration > 0 ? 
    ((actualTotals.onboard / actualTotals.registration) * 100).toFixed(2) : '0.00';

  // Format functions
  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toFixed(0)}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 70) return '#3b82f6';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // Chart configurations
  const overviewChartData = {
    labels: projectionData.map(d => d.month),
    datasets: [
      {
        label: 'Target Revenue',
        data: projectionData.map(d => d.revenue),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        borderDash: [5, 5]
      },
      {
        label: 'Actual Revenue',
        data: actualData.map(d => d.revenue),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  const projectionChartData = {
    labels: projectionData.map(d => d.month),
    datasets: [
      {
        label: 'Revenue',
        data: projectionData.map(d => d.revenue),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y',
        type: 'line',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#10b981'
      },
      {
        label: 'New Registrations',
        data: projectionData.map(d => d.newReg),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        yAxisID: 'y1',
        type: 'bar',
        barThickness: 20
      },
      {
        label: 'Onboarded',
        data: projectionData.map(d => d.onboard),
        backgroundColor: 'rgba(251, 146, 60, 0.6)',
        yAxisID: 'y1',
        type: 'bar',
        barThickness: 20
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label;
            if (context.raw >= 1000000 || label.includes('Revenue')) {
              return `${label}: ${formatINR(context.raw)}`;
            }
            return `${label}: ${formatNumber(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          callback: (value) => formatINR(value)
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          font: { size: 10 },
          callback: (value) => formatNumber(value)
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  };

  // Performance Donut Chart
  const performanceDonutData = {
    labels: ['Achieved', 'Gap'],
    datasets: [{
      data: [actualTotals.revenue, Math.max(0, gaps.revenue)],
      backgroundColor: ['#10b981', '#e5e7eb'],
      borderWidth: 0
    }]
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChart3 size={20} color="#10b981" />
          </div>
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0
            }}>
              Revenue Analytics & Projections
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              margin: '2px 0 0 0'
            }}>
              March - October 2025 Performance
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        borderBottom: '2px solid #f3f4f6',
        paddingBottom: '0'
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'scenario', label: 'Pricing Scenario' },
          { id: 'projection', label: 'Best Case' },
          { id: 'comparison', label: 'Actual vs Target' },
          { id: 'gap', label: 'Gap Analysis' },
          { id: 'geographical', label: 'Geographical' },
          { id: 'statewise', label: 'State-wise Analysis' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <DollarSign size={14} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#047857' }}>TARGET REVENUE</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#047857' }}>
                {formatINR(targetTotals.revenue)}
              </div>
              <div style={{ fontSize: '11px', color: '#059669' }}>8 months projection</div>
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '12px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Users size={14} color="#3b82f6" />
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#1e40af' }}>TARGET REGISTRATIONS</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                {formatNumber(targetTotals.registration)}
              </div>
              <div style={{ fontSize: '11px', color: '#2563eb' }}>Cumulative target</div>
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
              borderRadius: '12px',
              border: '1px solid #fde68a'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Target size={14} color="#f59e0b" />
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#92400e' }}>CONVERSION TARGET</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>
                {conversionRate}%
              </div>
              <div style={{ fontSize: '11px', color: '#b45309' }}>Reg to onboard</div>
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%)',
              borderRadius: '12px',
              border: '1px solid #e9d5ff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Calendar size={14} color="#8b5cf6" />
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b21a8' }}>PEAK MONTH</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#6b21a8' }}>
                {peakMonth.month}
              </div>
              <div style={{ fontSize: '11px', color: '#7c3aed' }}>{formatINR(peakMonth.revenue)}</div>
            </div>
          </div>

          {/* Performance Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Revenue Performance
              </h4>
              <div style={{ height: '250px' }}>
                <Line data={overviewChartData} options={chartOptions} />
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Achievement Rate
              </h4>
              <div style={{ height: '200px', position: 'relative' }}>
                <Doughnut
                  data={performanceDonutData}
                  options={{
                    ...chartOptions,
                    cutout: '70%',
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false }
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
                  <div style={{ fontSize: '28px', fontWeight: '700', color: getPerformanceColor(performanceMetrics.revenuePerf) }}>
                    {performanceMetrics.revenuePerf}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>ACHIEVED</div>
                </div>
              </div>
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                  QUICK STATS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Actual Revenue:</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{formatINR(actualTotals.revenue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Gap to Target:</span>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>{formatINR(gaps.revenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Insights */}
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ChevronRight size={16} color="#10b981" />
            <span style={{ fontSize: '12px', color: '#047857' }}>
              <strong>Performance Summary:</strong> {performanceMetrics.revenuePerf}% revenue achievement • 
              {' '}{actualTotals.registration} registrations ({performanceMetrics.registrationPerf}%) • 
              {' '}{actualTotals.onboard} onboarded ({performanceMetrics.onboardPerf}%) • 
              {' '}Conversion: {actualConversionRate}% actual vs {conversionRate}% target
            </span>
          </div>
        </div>
      )}

      {/* Best Case Projection Tab */}
      {activeTab === 'projection' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewMode('chart')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'chart' ? '#3b82f6' : '#f3f4f6',
                  color: viewMode === 'chart' ? 'white' : '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'table' ? '#3b82f6' : '#f3f4f6',
                  color: viewMode === 'table' ? 'white' : '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Table
              </button>
            </div>
          </div>

          {viewMode === 'chart' ? (
            <div style={{ height: '350px' }}>
              <Line data={projectionChartData} options={chartOptions} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Month</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Total Reg</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Submission</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Onboard</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px', fontWeight: '500' }}>{row.month}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        {formatNumber(row.registration)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        {formatNumber(row.submission)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{row.onboard}</td>
                      <td style={{ 
                        padding: '8px', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: row.revenue > 5000000 ? '#10b981' : '#111827'
                      }}>
                        {formatINR(row.revenue)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: '700' }}>
                    <td style={{ padding: '8px' }}>Total</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(targetTotals.registration)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(targetTotals.submission)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{targetTotals.onboard}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#10b981' }}>
                      {formatINR(targetTotals.revenue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Actual vs Target Comparison Tab */}
      {activeTab === 'comparison' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: `2px solid ${getPerformanceColor(performanceMetrics.registrationPerf)}`
            }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                REGISTRATIONS
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {actualTotals.registration.toLocaleString()} / {formatNumber(targetTotals.registration)}
              </div>
              <div style={{
                marginTop: '8px',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: getPerformanceColor(performanceMetrics.registrationPerf),
                color: 'white',
                display: 'inline-block'
              }}>
                {performanceMetrics.registrationPerf}%
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: `2px solid ${getPerformanceColor(performanceMetrics.onboardPerf)}`
            }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                ONBOARDED
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {actualTotals.onboard} / {targetTotals.onboard}
              </div>
              <div style={{
                marginTop: '8px',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: getPerformanceColor(performanceMetrics.onboardPerf),
                color: 'white',
                display: 'inline-block'
              }}>
                {performanceMetrics.onboardPerf}%
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: `2px solid ${getPerformanceColor(performanceMetrics.revenuePerf)}`
            }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                REVENUE
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {formatINR(actualTotals.revenue)} / {formatINR(targetTotals.revenue)}
              </div>
              <div style={{
                marginTop: '8px',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: getPerformanceColor(performanceMetrics.revenuePerf),
                color: 'white',
                display: 'inline-block'
              }}>
                {performanceMetrics.revenuePerf}%
              </div>
            </div>
          </div>

          <div style={{ height: '300px' }}>
            <Bar
              data={{
                labels: projectionData.map(d => d.month),
                datasets: [
                  {
                    label: 'Target Revenue',
                    data: projectionData.map(d => d.revenue),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                  },
                  {
                    label: 'Actual Revenue',
                    data: actualData.map(d => d.revenue),
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      )}

      {/* Gap Analysis Tab */}
      {activeTab === 'gap' && (
        <div>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              padding: '16px',
              background: gaps.registration > 0 ? '#fef2f2' : '#f0fdf4',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: `1px solid ${gaps.registration > 0 ? '#fecaca' : '#bbf7d0'}`
            }}>
              {gaps.registration > 0 ? 
                <XCircle size={24} color="#ef4444" /> : 
                <CheckCircle size={24} color="#10b981" />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  Registration Gap
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {gaps.registration > 0 ? 
                    `Need ${formatNumber(gaps.registration)} more registrations to meet target` :
                    `Exceeded target by ${formatNumber(Math.abs(gaps.registration))} registrations`
                  }
                </div>
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: gaps.registration > 0 ? '#dc2626' : '#16a34a'
              }}>
                {gaps.registration > 0 ? '-' : '+'}{formatNumber(Math.abs(gaps.registration))}
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: gaps.onboard > 0 ? '#fef2f2' : '#f0fdf4',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: `1px solid ${gaps.onboard > 0 ? '#fecaca' : '#bbf7d0'}`
            }}>
              {gaps.onboard > 0 ? 
                <XCircle size={24} color="#ef4444" /> : 
                <CheckCircle size={24} color="#10b981" />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  Onboarding Gap
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {gaps.onboard > 0 ? 
                    `Need ${gaps.onboard} more participants to onboard` :
                    `Exceeded target by ${Math.abs(gaps.onboard)} participants`
                  }
                </div>
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: gaps.onboard > 0 ? '#dc2626' : '#16a34a'
              }}>
                {gaps.onboard > 0 ? '-' : '+'}{Math.abs(gaps.onboard)}
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: gaps.revenue > 0 ? '#fef2f2' : '#f0fdf4',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: `1px solid ${gaps.revenue > 0 ? '#fecaca' : '#bbf7d0'}`
            }}>
              {gaps.revenue > 0 ? 
                <XCircle size={24} color="#ef4444" /> : 
                <CheckCircle size={24} color="#10b981" />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  Revenue Gap
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {gaps.revenue > 0 ? 
                    `Need ${formatINR(gaps.revenue)} more revenue to meet target` :
                    `Exceeded target by ${formatINR(Math.abs(gaps.revenue))}`
                  }
                </div>
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: gaps.revenue > 0 ? '#dc2626' : '#16a34a'
              }}>
                {gaps.revenue > 0 ? '-' : '+'}{formatINR(Math.abs(gaps.revenue))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(251, 146, 60, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
              <AlertCircle size={18} color="#f59e0b" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  Recommended Actions to Close Gaps
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#78350f' }}>
                  {gaps.registration > 10000 && <li>Increase marketing reach and brand awareness campaigns</li>}
                  {gaps.registration > 5000 && gaps.registration <= 10000 && <li>Optimize digital marketing channels and SEO</li>}
                  {gaps.onboard > 100 && <li>Improve conversion funnel and onboarding process</li>}
                  {gaps.onboard > 50 && gaps.onboard <= 100 && <li>Enhance follow-up communication with registrants</li>}
                  {gaps.revenue > 5000000 && <li>Review and optimize pricing strategy</li>}
                  {gaps.revenue > 1000000 && gaps.revenue <= 5000000 && <li>Focus on high-value participant segments</li>}
                  {Object.values(gaps).every(g => g <= 0) && <li>Maintain current momentum and explore growth opportunities</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Scenario Tab */}
      {activeTab === 'scenario' && (
        <RevenueScenario />
      )}

      {/* Geographical Distribution Tab */}
      {activeTab === 'geographical' && (
        <div style={{ marginTop: '16px' }}>
          <GeographicalDistribution participants={participants} />
        </div>
      )}

      {/* State-wise Analysis Tab */}
      {activeTab === 'statewise' && (
        <div style={{ marginTop: '16px' }}>
          <StateWiseAnalysis participants={participants} />
        </div>
      )}
    </div>
  );
};

export default RevenueAnalytics;