import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Target, Calendar, ChevronRight } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';

const RevenueProjection = () => {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

  // Best Case Scenario Data (Registration numbers are cumulative)
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

  // Calculate totals (Total: 475 onboarded, ₹25,017,300 revenue as per the data)
  const totals = {
    registration: 50000,  // Total unique registrations (October cumulative)
    submission: 26700,
    onboard: 475,
    revenue: 25017300
  };

  // Calculate key metrics
  const activeMonths = projectionData.filter(m => m.revenue > 0).length;
  const avgRevenue = totals.revenue / activeMonths;
  const peakMonth = projectionData.reduce((max, month) => 
    month.revenue > max.revenue ? month : max, projectionData[0]);
  const conversionRate = ((totals.onboard / totals.registration) * 100).toFixed(2);
  const submissionRate = ((totals.submission / totals.registration) * 100).toFixed(1);

  // Format currency
  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Chart configuration
  const chartData = {
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label === 'Revenue') {
              return `${label}: ${formatINR(context.raw)}`;
            } else if (label === 'Onboarded') {
              return `${label}: ${context.raw}`;
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
        },
        title: {
          display: true,
          text: 'Revenue',
          font: { size: 11 }
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
        },
        title: {
          display: true,
          text: 'Count',
          font: { size: 11 }
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
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0
            }}>
              Best Case Revenue Projection
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              margin: '2px 0 0 0'
            }}>
              March - October 2025
            </p>
          </div>
        </div>
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

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <DollarSign size={14} color="#10b981" />
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>TOTAL REVENUE</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
            {formatINR(totals.revenue)}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>8 months total</div>
        </div>

        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Users size={14} color="#3b82f6" />
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>TOTAL REGISTRATIONS</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            {formatNumber(totals.registration)}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Cumulative target</div>
        </div>

        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Target size={14} color="#f59e0b" />
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>CONVERSION</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Reg to onboard</div>
        </div>

        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Calendar size={14} color="#8b5cf6" />
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>PEAK MONTH</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
            {peakMonth.month}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>{formatINR(peakMonth.revenue)}</div>
        </div>
      </div>

      {/* Chart or Table View */}
      {viewMode === 'chart' ? (
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
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
                    {row.registration > 0 ? formatNumber(row.registration) : '-'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {row.submission > 0 ? formatNumber(row.submission) : '-'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{row.onboard}</td>
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'right', 
                    fontWeight: '600',
                    color: row.revenue > 10000000 ? '#10b981' : '#111827'
                  }}>
                    {formatINR(row.revenue)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: '700' }}>
                <td style={{ padding: '8px' }}>Total</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(totals.registration)}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(totals.submission)}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{totals.onboard}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#10b981' }}>
                  {formatINR(totals.revenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Growth Indicators */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <ChevronRight size={16} color="#10b981" />
        <span style={{ fontSize: '12px', color: '#047857' }}>
          <strong>Projected Growth:</strong> Peak revenue in {peakMonth.month} with {formatINR(peakMonth.revenue)} • 
          Average monthly revenue: {formatINR(avgRevenue)} • 
          Total onboarding target: {totals.onboard} participants
        </span>
      </div>
    </div>
  );
};

export default RevenueProjection;