import React, { useState, useMemo } from 'react';
import { TrendingUp, Target, AlertCircle, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';

const ProjectionComparison = ({ participants = [] }) => {
  const [viewMode, setViewMode] = useState('comparison'); // 'comparison', 'gap', 'performance'

  // Best Case/Target Projections (Ad Projections)
  const targetProjections = [
    { month: 'March', registration: 10000, onboard: 40, revenue: 2106720 },
    { month: 'April', registration: 14000, onboard: 15, revenue: 790020 },
    { month: 'May', registration: 18000, onboard: 15, revenue: 790020 },
    { month: 'June', registration: 25000, onboard: 15, revenue: 790020 },
    { month: 'July', registration: 30000, onboard: 20, revenue: 1053360 },
    { month: 'August', registration: 35000, onboard: 20, revenue: 1053360 },
    { month: 'September', registration: 45000, onboard: 150, revenue: 7900200 },
    { month: 'October', registration: 50000, onboard: 200, revenue: 10533600 }
  ];

  // Calculate actual data from uploaded participants
  const actualData = useMemo(() => {
    const monthlyData = {};
    
    participants.forEach(p => {
      // Get month from application_submitted_on or payment_date
      const dateField = p.application_submitted_on || p.payment_date || p.selected_date;
      if (dateField) {
        const date = new Date(dateField);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        
        if (!monthlyData[month]) {
          monthlyData[month] = {
            registrations: 0,
            onboarded: 0,
            revenue: 0
          };
        }
        
        monthlyData[month].registrations++;
        
        // Count as onboarded if payment exists
        if (p.scholarship_total_amount_paid && parseFloat(p.scholarship_total_amount_paid) > 0) {
          monthlyData[month].onboarded++;
          monthlyData[month].revenue += parseFloat(p.scholarship_total_amount_paid);
        }
      }
    });

    // Convert to array format matching target months
    return targetProjections.map(target => {
      const actual = monthlyData[target.month] || { registrations: 0, onboarded: 0, revenue: 0 };
      return {
        month: target.month,
        registration: actual.registrations,
        onboard: actual.onboarded,
        revenue: actual.revenue
      };
    });
  }, [participants]);

  // Calculate totals and metrics
  const targetTotals = {
    registration: 50000,
    onboard: 475,
    revenue: 25017300
  };

  const actualTotals = actualData.reduce((acc, month) => ({
    registration: acc.registration + month.registration,
    onboard: acc.onboard + month.onboard,
    revenue: acc.revenue + month.revenue
  }), { registration: 0, onboard: 0, revenue: 0 });

  // Calculate performance percentages
  const performanceMetrics = {
    registrationPerf: ((actualTotals.registration / targetTotals.registration) * 100).toFixed(1),
    onboardPerf: ((actualTotals.onboard / targetTotals.onboard) * 100).toFixed(1),
    revenuePerf: ((actualTotals.revenue / targetTotals.revenue) * 100).toFixed(1)
  };

  // Calculate gaps
  const gaps = {
    registration: targetTotals.registration - actualTotals.registration,
    onboard: targetTotals.onboard - actualTotals.onboard,
    revenue: targetTotals.revenue - actualTotals.revenue
  };

  // Format currency
  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toFixed(0)}`;
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get performance color
  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 70) return '#3b82f6';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // Chart configuration for comparison view
  const comparisonChartData = {
    labels: targetProjections.map(d => d.month),
    datasets: [
      {
        label: 'Target Revenue',
        data: targetProjections.map(d => d.revenue),
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

  const registrationChartData = {
    labels: targetProjections.map(d => d.month),
    datasets: [
      {
        label: 'Target',
        data: targetProjections.map((d, idx) => {
          const prevReg = idx > 0 ? targetProjections[idx - 1].registration : 0;
          return d.registration - prevReg;
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Actual',
        data: actualData.map(d => d.registration),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
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
            if (context.raw >= 1000000) {
              return `${label}: ${formatINR(context.raw)}`;
            }
            return `${label}: ${formatNumber(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          callback: (value) => formatINR(value)
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
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
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChart3 size={20} color="#3b82f6" />
          </div>
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0
            }}>
              Target vs Actual Performance
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              margin: '2px 0 0 0'
            }}>
              Comparing projections with uploaded data
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('comparison')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'comparison' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'comparison' ? 'white' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Comparison
          </button>
          <button
            onClick={() => setViewMode('gap')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'gap' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'gap' ? 'white' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Gap Analysis
          </button>
          <button
            onClick={() => setViewMode('performance')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'performance' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'performance' ? 'white' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            KPIs
          </button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: `2px solid ${getPerformanceColor(performanceMetrics.registrationPerf)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                REGISTRATIONS
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {actualTotals.registration.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                of {formatNumber(targetTotals.registration)} target
              </div>
            </div>
            <div style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              background: getPerformanceColor(performanceMetrics.registrationPerf),
              color: 'white'
            }}>
              {performanceMetrics.registrationPerf}%
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: `2px solid ${getPerformanceColor(performanceMetrics.onboardPerf)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                ONBOARDED
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {actualTotals.onboard}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                of {targetTotals.onboard} target
              </div>
            </div>
            <div style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              background: getPerformanceColor(performanceMetrics.onboardPerf),
              color: 'white'
            }}>
              {performanceMetrics.onboardPerf}%
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: `2px solid ${getPerformanceColor(performanceMetrics.revenuePerf)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                REVENUE
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {formatINR(actualTotals.revenue)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                of {formatINR(targetTotals.revenue)} target
              </div>
            </div>
            <div style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              background: getPerformanceColor(performanceMetrics.revenuePerf),
              color: 'white'
            }}>
              {performanceMetrics.revenuePerf}%
            </div>
          </div>
        </div>
      </div>

      {/* View-specific content */}
      {viewMode === 'comparison' && (
        <div>
          <div style={{ height: '250px', marginBottom: '20px' }}>
            <Line data={comparisonChartData} options={chartOptions} />
          </div>
          <div style={{ height: '250px' }}>
            <Bar data={registrationChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: true,
                  text: 'Monthly Registrations',
                  font: { size: 12 }
                }
              }
            }} />
          </div>
        </div>
      )}

      {viewMode === 'gap' && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
            Gap to Target
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{
              padding: '12px',
              background: gaps.registration > 0 ? '#fef2f2' : '#f0fdf4',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {gaps.registration > 0 ? 
                <XCircle size={20} color="#ef4444" /> : 
                <CheckCircle size={20} color="#10b981" />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                  Registration Gap
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {gaps.registration > 0 ? 
                    `Need ${formatNumber(gaps.registration)} more registrations` :
                    `Exceeded target by ${formatNumber(Math.abs(gaps.registration))}`
                  }
                </div>
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '700',
                color: gaps.registration > 0 ? '#dc2626' : '#16a34a'
              }}>
                {gaps.registration > 0 ? '-' : '+'}{formatNumber(Math.abs(gaps.registration))}
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: gaps.onboard > 0 ? '#fef2f2' : '#f0fdf4',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {gaps.onboard > 0 ? 
                <XCircle size={20} color="#ef4444" /> : 
                <CheckCircle size={20} color="#10b981" />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                  Onboarding Gap
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {gaps.onboard > 0 ? 
                    `Need ${gaps.onboard} more onboards` :
                    `Exceeded target by ${Math.abs(gaps.onboard)}`
                  }
                </div>
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '700',
                color: gaps.onboard > 0 ? '#dc2626' : '#16a34a'
              }}>
                {gaps.onboard > 0 ? '-' : '+'}{Math.abs(gaps.onboard)}
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: gaps.revenue > 0 ? '#fef2f2' : '#f0fdf4',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {gaps.revenue > 0 ? 
                <XCircle size={20} color="#ef4444" /> : 
                <CheckCircle size={20} color="#10b981" />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                  Revenue Gap
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {gaps.revenue > 0 ? 
                    `Need ${formatINR(gaps.revenue)} more revenue` :
                    `Exceeded target by ${formatINR(Math.abs(gaps.revenue))}`
                  }
                </div>
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '700',
                color: gaps.revenue > 0 ? '#dc2626' : '#16a34a'
              }}>
                {gaps.revenue > 0 ? '-' : '+'}{formatINR(Math.abs(gaps.revenue))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)',
            borderRadius: '8px',
            border: '1px solid rgba(251, 146, 60, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
              <AlertCircle size={16} color="#f59e0b" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                  Action Required
                </div>
                <div style={{ fontSize: '11px', color: '#78350f' }}>
                  To meet targets, focus on: 
                  {gaps.registration > 10000 && ' • Increase marketing reach'}
                  {gaps.onboard > 100 && ' • Improve conversion funnel'}
                  {gaps.revenue > 5000000 && ' • Optimize pricing strategy'}
                  {Object.values(gaps).every(g => g <= 0) && ' Maintain current momentum!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'performance' && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
            Key Performance Indicators
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Conversion Rate (Actual)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                  {actualTotals.registration > 0 ? 
                    ((actualTotals.onboard / actualTotals.registration) * 100).toFixed(2) : '0.00'}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  vs {((targetTotals.onboard / targetTotals.registration) * 100).toFixed(2)}% target
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Average Revenue per Onboard
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                  {actualTotals.onboard > 0 ? 
                    formatINR(actualTotals.revenue / actualTotals.onboard) : '₹0'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  vs {formatINR(targetTotals.revenue / targetTotals.onboard)} target
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Monthly Run Rate
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                  {formatINR(actualTotals.revenue / 8)}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  per month average
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Target Achievement Rate
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: getPerformanceColor(performanceMetrics.revenuePerf) }}>
                  {performanceMetrics.revenuePerf}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  overall performance
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionComparison;